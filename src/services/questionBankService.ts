
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExamQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  difficulty_level?: number;
  subject?: string;
  created_at?: string;
  unit_objective?: string;
}

// Local storage keys
const STORED_QUESTIONS_KEY = 'ethio_exam_stored_questions';
const QUESTION_USAGE_KEY = 'ethio_exam_question_usage';
const LAST_SYNC_KEY = 'ethio_exam_last_question_sync';

// API keys for question generation
const API_KEYS = [
  null, // Primary API key from Supabase secrets
  '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', // Secondary API key 1
  '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', // Secondary API key 2
];

/**
 * Checks if the device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Get stored questions from local storage (only for history)
 */
export const getStoredQuestions = (): ExamQuestion[] => {
  try {
    const storedQuestionsJson = localStorage.getItem(STORED_QUESTIONS_KEY);
    if (!storedQuestionsJson) return [];
    return JSON.parse(storedQuestionsJson);
  } catch (error) {
    console.error("Error retrieving stored questions:", error);
    return [];
  }
};

/**
 * Save questions to local storage for history
 */
export const storeQuestions = (questions: ExamQuestion[]): void => {
  try {
    localStorage.setItem(STORED_QUESTIONS_KEY, JSON.stringify(questions));
  } catch (error) {
    console.error("Error storing questions:", error);
  }
};

/**
 * Track which questions have been used in which exam sessions
 */
export const trackQuestionUsage = (examId: string, questionIds: string[]): void => {
  try {
    const usageJson = localStorage.getItem(QUESTION_USAGE_KEY);
    const usage = usageJson ? JSON.parse(usageJson) : {};
    usage[examId] = questionIds;
    localStorage.setItem(QUESTION_USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error("Error tracking question usage:", error);
  }
};

/**
 * Generates questions using Groq AI service directly (through your Supabase edge function)
 * Restores in-app duplicate question checking.
 * Now supports multiple API keys to handle API limits.
 */
export const generateUniqueQuestions = async (
  count: number,
  subject?: string,
  unitObjective?: string,
  examId: string = Date.now().toString()
): Promise<{questions: ExamQuestion[], source: 'ai', warning?: string, error?: string}> => {
  if (!isOnline()) {
    throw new Error("An internet connection is required to generate AI questions. Please connect and try again.");
  }

  console.log(`Attempting to generate ${count} AI questions for ${subject || "general"} subject with objective: ${unitObjective || "not specified"}`);

  // We'll make multiple attempts with increasing backoff
  const maxAttempts = 3;
  const baseDelay = 2000; // 2 second initial delay
  const maxQuestionsPerBatch = 10; // Maximum number of questions to generate in a single API call
  const batches = Math.ceil(count / maxQuestionsPerBatch);
  
  let allQuestions: ExamQuestion[] = [];
  let lastError: Error | null = null;
  let apiKeyIndex = 0;
  
  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const batchSize = Math.min(maxQuestionsPerBatch, count - (batchIndex * maxQuestionsPerBatch));
    let batchSucceeded = false;
    
    // Try each API key until successful or all keys are exhausted
    while (apiKeyIndex < API_KEYS.length && !batchSucceeded) {
      for (let attempt = 1; attempt <= maxAttempts && !batchSucceeded; attempt++) {
        try {
          console.log(`Batch ${batchIndex + 1}/${batches}: Generation attempt ${attempt}/${maxAttempts} with API key index ${apiKeyIndex}`);

          // Inform user of retry attempts
          if ((apiKeyIndex > 0 || attempt > 1) && batchIndex === 0) {
            toast.info(`Retrying AI question generation (attempt ${attempt}/${maxAttempts})...`);
          } else if (apiKeyIndex > 0 && batchIndex > 0) {
            toast.info(`Continuing with additional questions using alternate API...`);
          }

          // Add significant randomization to the prompts to get different results on retries
          const randomSeed = Math.floor(Math.random() * 1000000) + Date.now() % 10000;
          const challengeVariations = ["challenging", "advanced", "complex", "difficult", "analytical"];
          const selectedChallenge = challengeVariations[attempt % challengeVariations.length];
          const uniqueRequestId = `${Date.now()}-${attempt}-${randomSeed}-${apiKeyIndex}-${batchIndex}`;

          const result = await supabase.functions.invoke("ai-generate-questions", {
            body: {
              subject: subject || "",
              count: batchSize,
              unitObjective: unitObjective || undefined,
              challengeLevel: "advanced",
              instructionType: selectedChallenge,
              randomSeed: randomSeed,
              attempt: attempt,
              uniqueRequestId: uniqueRequestId,
              timestamp: Date.now(),
              apiKeyIndex: apiKeyIndex // Pass the current API key index to the edge function
            }
          });

          console.log(`AI function response (attempt ${attempt}, API key ${apiKeyIndex}, batch ${batchIndex}):`, result);

          if (result.error) {
            console.error(`Error from AI function (attempt ${attempt}, API key ${apiKeyIndex}):`, result.error);
            lastError = new Error(`API error: ${result.error.message}`);

            if (result.error.message?.includes("rate limit") || 
                result.error.message?.includes("quota exceeded") ||
                result.error.message?.includes("limit exceeded")) {
              console.log(`API key ${apiKeyIndex} has reached its limit. Switching to next API key.`);
              apiKeyIndex++;
              break; // Break out of attempt loop to try next API key
            }

            // Wait before retrying
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000); // Exponential backoff, max 15 seconds
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          if (!result.data?.questions || result.data.questions.length === 0) {
            console.error(`AI service returned empty questions (attempt ${attempt}, API key ${apiKeyIndex})`);
            lastError = new Error("The AI service failed to generate any questions");

            // Wait before retrying
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // Filter out duplicate questions by question_text and options (basic deduping)
          const unique = new Map<string, ExamQuestion>();
          for (const q of result.data.questions) {
            const key = 
              (q.question_text?.trim().toLowerCase() || "") + 
              "|" + (q.option_a?.trim().toLowerCase() || "") +
              "|" + (q.option_b?.trim().toLowerCase() || "") +
              "|" + (q.option_c?.trim().toLowerCase() || "") +
              "|" + (q.option_d?.trim().toLowerCase() || "");
            if (!unique.has(key)) {
              unique.set(key, q);
            }
          }
          let batchQuestions = Array.from(unique.values());

          // Ensure each question has a unique ID (if missing)
          batchQuestions = batchQuestions.map((q: ExamQuestion, index: number) => ({
            ...q,
            id: q.id || `generated-${Date.now()}-${index}-${batchIndex}-${Math.random().toString(36).substring(2, 9)}`
          }));

          // Add batch questions to all questions
          allQuestions = [...allQuestions, ...batchQuestions];
          
          // Mark batch as successful
          batchSucceeded = true;
          console.log(`Successfully generated batch ${batchIndex + 1}/${batches} with ${batchQuestions.length} questions`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          console.error(`Batch ${batchIndex + 1}, Attempt ${attempt}, API key ${apiKeyIndex}: AI question generation failed:`, errorMessage);
          lastError = error instanceof Error ? error : new Error(errorMessage);

          // Check if it's a rate limit error, if so switch to next API key
          if (errorMessage.includes("rate limit") || 
              errorMessage.includes("quota exceeded") || 
              errorMessage.includes("limit exceeded")) {
            console.log(`API key ${apiKeyIndex} has reached its limit. Switching to next API key.`);
            apiKeyIndex++;
            break; // Break out of attempt loop to try next API key
          }
          
          // Only retry if it's not a network error or another critical issue
          if (errorMessage.includes("internet") || errorMessage.includes("network") || errorMessage.includes("connection")) {
            throw lastError; // Don't retry network errors
          }

          // Wait before retrying
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // If we've tried all API keys and still failed, break out
      if (apiKeyIndex >= API_KEYS.length && !batchSucceeded) {
        break;
      }
    }
    
    // If we couldn't generate this batch with any API key, break out of batch loop
    if (!batchSucceeded) {
      break;
    }
    
    // If we've generated enough questions or used all API keys, break out
    if (allQuestions.length >= count || apiKeyIndex >= API_KEYS.length) {
      break;
    }
  }
  
  // Check if we got any questions at all
  if (allQuestions.length === 0) {
    console.error(`All attempts to generate questions failed`);
    const finalError = lastError?.message || "Failed to generate AI questions after multiple attempts";

    // Show a more user-friendly error message
    toast.error("AI question generation failed. Please try again in a moment.", {
      description: "Our AI service is experiencing temporary issues. We're working on it!"
    });

    throw new Error(finalError);
  }
  
  // At this point, we have some questions but maybe not as many as requested
  if (allQuestions.length < count) {
    console.warn(`Only generated ${allQuestions.length} questions out of ${count} requested`);
    toast.warning(`Generated ${allQuestions.length} questions (requested ${count})`, {
      description: "We've reached our API limits. Try again later for more questions."
    });
  }
  
  // Store the questions for history
  storeQuestions(allQuestions);
  trackQuestionUsage(examId, allQuestions.map(q => q.id));

  console.log(`Successfully generated ${allQuestions.length} unique questions`);

  return {
    questions: allQuestions,
    source: 'ai',
    warning: allQuestions.length < count ? 
      `Only generated ${allQuestions.length} out of ${count} requested questions due to API limits.` : 
      undefined
  };
};
