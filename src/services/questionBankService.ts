import { supabase } from "@/integrations/supabase/client";

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
 * Generates questions using only the AI service
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

  console.log(`Attempting to generate ${count} AI questions for ${subject || "general"} subject`);

  try {
    // Make up to 3 attempts to get unique questions
    let result;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      result = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          subject: subject || "",
          count: count,
          unitObjective: unitObjective || undefined,
          challengeLevel: "advanced",
          instructionType: "challenging"
        }
      });

      if (result.error) {
        console.error(`Attempt ${attempts}: Error from AI function:`, result.error);
        if (attempts === maxAttempts) {
          throw new Error(`Failed to generate AI questions: ${result.error.message}`);
        }
        continue; // Try again
      }

      if (!result.data?.questions || result.data.questions.length === 0) {
        console.error(`Attempt ${attempts}: AI service returned empty questions`);
        if (attempts === maxAttempts) {
          throw new Error("The AI service failed to generate any questions. Please try again.");
        }
        continue; // Try again
      }

      // If there are some duplicates but we still have enough unique questions, just filter them
      let questions = result.data.questions;
      const hasDupes = hasDuplicateQuestions(questions);
      
      if (hasDupes) {
        console.log(`Attempt ${attempts}: Found duplicate questions, attempting to filter them`);
        questions = filterDuplicateQuestions(questions);
        
        // If after filtering, we still have enough questions, we're good to go
        if (questions.length >= count * 0.8) { // Accept if we have at least 80% of requested count
          console.log(`Filtered to ${questions.length} unique questions out of ${count} requested`);
          result.data.questions = questions;
          break;
        }
        
        // Otherwise, try again if we haven't exhausted our attempts
        if (attempts < maxAttempts) {
          console.log(`Not enough unique questions after filtering (${questions.length}/${count}). Trying again...`);
          continue;
        } else {
          // We'll return what we have on the last attempt, even if it's not perfect
          result.data.questions = questions;
          break;
        }
      } else {
        // No duplicates found, we're good
        break;
      }
    }

    if (!result || !result.data?.questions || result.data.questions.length === 0) {
      throw new Error("Failed to generate unique AI questions after multiple attempts. Please try again.");
    }

    // Ensure each question has a unique ID
    result.data.questions = result.data.questions.map((q, index) => ({
      ...q,
      id: q.id || `generated-${Date.now()}-${index}`
    }));

    // Store the questions for history
    storeQuestions(result.data.questions);
    trackQuestionUsage(examId, result.data.questions.map(q => q.id));
    
    return {
      questions: result.data.questions,
      source: 'ai',
      warning: result.data.error
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate AI questions";
    console.error("AI question generation failed:", errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Check if an array of questions contains duplicates
 */
const hasDuplicateQuestions = (questions: ExamQuestion[]): boolean => {
  // Create a more sophisticated fingerprint by combining multiple features
  const questionFingerprints = questions.map(q => {
    // Use a combination of question text and correct answer to identify uniqueness
    const questionText = (q.question_text || '').trim().toLowerCase().substring(0, 40);
    const correctAnswer = q.correct_answer || '';
    return `${questionText}#${correctAnswer}`;
  });
  
  const uniqueFingerprints = new Set(questionFingerprints);
  return uniqueFingerprints.size < questionFingerprints.length;
};

/**
 * Filter out duplicate questions from an array
 */
const filterDuplicateQuestions = (questions: ExamQuestion[]): ExamQuestion[] => {
  const uniqueQuestions: ExamQuestion[] = [];
  const fingerprintSet = new Set<string>();
  
  questions.forEach(question => {
    const questionText = (question.question_text || '').trim().toLowerCase().substring(0, 40);
    const correctAnswer = question.correct_answer || '';
    const fingerprint = `${questionText}#${correctAnswer}`;
    
    if (!fingerprintSet.has(fingerprint)) {
      fingerprintSet.add(fingerprint);
      uniqueQuestions.push(question);
    }
  });
  
  return uniqueQuestions;
};
