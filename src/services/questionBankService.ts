
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
 * Generates questions using Groq AI service directly (through your Supabase edge function)
 * Restores in-app duplicate question checking.
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

      const result = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          subject: subject || "",
          count: count,
          unitObjective: unitObjective || undefined,
          challengeLevel: "advanced",
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
        lastError = new Error(`API error: ${result.error.message}`);

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

      // =========== RESTORED DUPLICATE QUESTION CHECKER HERE ================
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
      let questions = Array.from(unique.values());

      // If not enough unique, just use as many as we have (do NOT pad with old ones)
      // Ensure each question has a unique ID (if missing)
      questions = questions.map((q: ExamQuestion, index: number) => ({
        ...q,
        id: q.id || `generated-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`
      }));

      // Store the questions for history
      storeQuestions(questions);
      trackQuestionUsage(examId, questions.map(q => q.id));

      console.log(`Successfully generated ${questions.length} unique questions after ${attempt} attempts`);

      return {
        questions,
        source: 'ai',
        warning: result.data.error
      };
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

  // If we get here, all attempts failed
  console.error(`All ${maxAttempts} attempts to generate questions failed`);
  const finalError = lastError?.message || "Failed to generate AI questions after multiple attempts";

  // Show a more user-friendly error message
  toast.error("AI question generation failed. Please try again in a moment.", {
    description: "Our AI service is experiencing temporary issues. We're working on it!"
  });

  throw new Error(finalError);
};

// No more duplicate question checking here.

