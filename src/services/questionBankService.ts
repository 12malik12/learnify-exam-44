
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
 * Generates questions using Groq AI service with multi-API key support
 * Handles rate limits by automatically switching to backup API keys
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

  let lastError: Error | null = null;
  let finalQuestions: ExamQuestion[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Generation attempt ${attempt}/${maxAttempts}`);

      // Inform user of retry attempts
      if (attempt > 1) {
        toast.info(`Retrying AI question generation (attempt ${attempt}/${maxAttempts})...`);
      }

      // Add significant randomization to the prompts to get different results on retries
      const randomSeed = Math.floor(Math.random() * 1000000) + Date.now() % 10000;
      const challengeVariations = ["challenging", "advanced", "complex", "difficult", "analytical"];
      const selectedChallenge = challengeVariations[attempt % challengeVariations.length];
      const uniqueRequestId = `${Date.now()}-${attempt}-${randomSeed}`;

      // Call the edge function with information about API key usage
      const result = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          subject: subject || "",
          count: count,
          unitObjective: unitObjective || undefined,
          challengeLevel: selectedChallenge,
          instructionType: selectedChallenge,
          randomSeed: randomSeed,
          attempt: attempt,
          uniqueRequestId: uniqueRequestId,
          timestamp: Date.now()
        }
      });

      console.log(`AI function response (attempt ${attempt}):`, result);

      if (result.error) {
        console.error(`Error from AI function (attempt ${attempt}):`, result.error);
        lastError = new Error(`API error: ${result.error.message || "Unknown error"}`);

        // Wait before retrying
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000); // Exponential backoff, max 15 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!result.data?.questions || result.data.questions.length === 0) {
        console.error(`AI service returned empty questions (attempt ${attempt})`);
        lastError = new Error("The AI service failed to generate any questions");

        // Wait before retrying
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Add questions from this batch to our accumulated questions
      const questionsFromThisAttempt = result.data.questions;
      finalQuestions = [...finalQuestions, ...questionsFromThisAttempt];

      // Show API key usage information if available
      if (result.data.stats?.apiKeysAvailable) {
        const keysUsed = result.data.stats.apiKeysUsed?.length || 0;
        const keysAvailable = result.data.stats.apiKeysAvailable || 0;
        console.log(`Question generation used ${keysUsed} API keys out of ${keysAvailable} available keys`);
        
        if (keysUsed > 0 && keysAvailable > 0) {
          const keysUsedText = result.data.stats.apiKeysUsed?.join(", ") || "primary key";
          console.log(`Keys used: ${keysUsedText}`);
        }
      }

      // If we've now reached our desired count, we can stop making further attempts
      if (finalQuestions.length >= count) {
        console.log(`Successfully generated ${finalQuestions.length} questions, meeting the requested count of ${count}`);
        break;
      }

      // If we didn't get enough questions but the attempt succeeded, try again
      // immediately to get the remaining questions
      if (finalQuestions.length < count) {
        console.log(`Generated ${finalQuestions.length}/${count} questions. Requesting ${count - finalQuestions.length} more...`);
        continue;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Attempt ${attempt}: AI question generation failed:`, errorMessage);
      lastError = error instanceof Error ? error : new Error(errorMessage);

      // Only retry if it's not a network error or another critical issue
      if (errorMessage.includes("internet") || errorMessage.includes("network") || errorMessage.includes("connection")) {
        throw lastError; // Don't retry network errors
      }

      // Wait before retrying
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we have at least some questions but not enough, log this but proceed
  if (finalQuestions.length > 0 && finalQuestions.length < count) {
    console.warn(`Could only generate ${finalQuestions.length} questions out of ${count} requested`);
    toast.warning(`Only generated ${finalQuestions.length} out of ${count} questions. You may want to try again later for better results.`);
  }

  // If we have no questions at all, that's a complete failure
  if (finalQuestions.length === 0) {
    console.error(`All ${maxAttempts} attempts to generate questions failed`);
    const finalError = lastError?.message || "Failed to generate AI questions after multiple attempts";

    // Show a more user-friendly error message
    toast.error("AI question generation failed. Please try again in a moment.", {
      description: "Our AI service is experiencing temporary issues. We're working on it!"
    });

    throw new Error(finalError);
  }

  // Filter out duplicate questions by question_text and options (basic deduping)
  const unique = new Map<string, ExamQuestion>();
  for (const q of finalQuestions) {
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
  
  let questions = Array.from(unique.values());

  // Ensure each question has a unique ID (if missing)
  questions = questions.map((q: ExamQuestion, index: number) => ({
    ...q,
    id: q.id || `generated-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`
  }));

  // Store the questions for history
  storeQuestions(questions);
  trackQuestionUsage(examId, questions.map(q => q.id));

  console.log(`Successfully generated ${questions.length} unique questions after ${maxAttempts} attempts`);

  // If we have information about AI vs fallback questions, show it as a toast
  if (questions.length > 0) {
    const aiGenerated = questions.filter(q => q.isAIGenerated !== false).length;
    const fallbackCount = questions.length - aiGenerated;
    
    if (fallbackCount > 0) {
      toast.info(`Generated ${aiGenerated} AI questions and ${fallbackCount} fallback questions`, {
        description: "Some questions were generated using fallback templates due to API limitations."
      });
    }
  }

  // If we have information about API key usage, show it as a toast
  if (questions.length > 0 && questions.length < count) {
    toast.warning(`Only generated ${questions.length} out of the requested ${count} questions`, {
      description: "Our AI service may be experiencing high demand. Try again later for better results."
    });
  }

  return {
    questions: questions.slice(0, count), // Ensure we only return up to the requested count
    source: 'ai',
    warning: lastError?.message
  };
};
