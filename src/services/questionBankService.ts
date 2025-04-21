
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
 * Generates questions using Groq AI service with robust error handling and retries
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
      
      // Add some randomization to the prompts to get different results on retries
      const randomSeed = Math.floor(Math.random() * 1000);
      const challengeVariations = ["challenging", "advanced", "complex", "difficult"];
      const selectedChallenge = challengeVariations[attempt % challengeVariations.length];
      
      const result = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          subject: subject || "",
          count: count,
          unitObjective: unitObjective || undefined,
          challengeLevel: "advanced",
          instructionType: selectedChallenge,
          randomSeed: randomSeed,
          attempt: attempt
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

      // Inspect the format of each question for validity
      const validQuestions = result.data.questions.filter(q => {
        return q.question_text && q.option_a && q.option_b && 
               q.option_c && q.option_d && q.correct_answer;
      });

      if (validQuestions.length === 0) {
        console.error(`AI generated ${result.data.questions.length} questions but none were valid (attempt ${attempt})`);
        lastError = new Error("The AI service generated malformed questions");
        
        // Wait before retrying
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Check for duplicates
      let questions = result.data.questions;
      const hasDupes = hasDuplicateQuestions(questions);
      
      if (hasDupes) {
        console.log(`Found duplicate questions in attempt ${attempt}, filtering them`);
        questions = filterDuplicateQuestions(questions);
        
        // If after filtering, we still have enough questions, we're good to go
        if (questions.length >= Math.max(count * 0.8, 2)) { // Accept if we have at least 80% of requested count or at least 2
          console.log(`Filtered to ${questions.length} unique questions out of ${count} requested`);
          result.data.questions = questions;
        } else {
          console.log(`Not enough unique questions after filtering (${questions.length}/${count}). Trying again...`);
          lastError = new Error(`AI service generated too many duplicate questions (${questions.length}/${count} unique)`);
          
          // Wait before retrying
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Success! Ensure each question has a unique ID
      result.data.questions = result.data.questions.map((q, index) => ({
        ...q,
        id: q.id || `generated-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`
      }));

      // Store the questions for history
      storeQuestions(result.data.questions);
      trackQuestionUsage(examId, result.data.questions.map(q => q.id));
      
      console.log(`Successfully generated ${result.data.questions.length} questions after ${attempt} attempts`);
      
      return {
        questions: result.data.questions,
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

/**
 * Improved duplicate question detection with better fingerprinting
 */
const hasDuplicateQuestions = (questions: ExamQuestion[]): boolean => {
  // Create a more sophisticated fingerprint by combining multiple features
  const questionFingerprints = questions.map(q => {
    // Use a combination of question text and correct answer to identify uniqueness
    // Strip whitespace and normalize case for more accurate comparison
    const questionText = (q.question_text || '').trim().toLowerCase().substring(0, 80);
    const correctAnswer = (q.correct_answer || '').trim();
    return `${questionText}#${correctAnswer}`;
  });
  
  const uniqueFingerprints = new Set(questionFingerprints);
  return uniqueFingerprints.size < questionFingerprints.length;
};

/**
 * Enhanced duplicate question filtering
 */
const filterDuplicateQuestions = (questions: ExamQuestion[]): ExamQuestion[] => {
  const uniqueQuestions: ExamQuestion[] = [];
  const fingerprintSet = new Set<string>();
  
  questions.forEach(question => {
    // Create a consistent fingerprint for comparison
    const questionText = (question.question_text || '').trim().toLowerCase().substring(0, 80);
    const correctAnswer = (question.correct_answer || '').trim();
    const fingerprint = `${questionText}#${correctAnswer}`;
    
    if (!fingerprintSet.has(fingerprint)) {
      fingerprintSet.add(fingerprint);
      uniqueQuestions.push(question);
    }
  });
  
  return uniqueQuestions;
};
