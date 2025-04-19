
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
    const result = await supabase.functions.invoke("ai-generate-questions", {
      body: {
        subject: subject || "",
        count: count,
        unitObjective: unitObjective || undefined,
        challengeLevel: "advanced",
        instructionType: "challenging"
      }
    });

    if (result.error) {
      console.error("Error from AI function:", result.error);
      throw new Error(`Failed to generate AI questions: ${result.error.message}`);
    }

    if (!result.data?.questions || result.data.questions.length === 0) {
      throw new Error("The AI service failed to generate any questions. Please try again.");
    }

    if (hasDuplicateQuestions(result.data.questions)) {
      throw new Error("The AI service generated duplicate questions. Please try again.");
    }

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
  const questionFingerprints = questions.map(q => q.question_text.substring(0, 40).toLowerCase());
  const uniqueFingerprints = new Set(questionFingerprints);
  return uniqueFingerprints.size < questionFingerprints.length;
};

