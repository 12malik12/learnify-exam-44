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
 * Get all locally stored questions
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
 * Save questions to local storage
 */
export const storeQuestions = (questions: ExamQuestion[]): void => {
  try {
    // Get existing questions
    const existingQuestions = getStoredQuestions();
    
    // Create a map of existing question IDs for quick lookup
    const existingIds = new Set(existingQuestions.map(q => q.id));
    
    // Filter out questions that already exist
    const newQuestions = questions.filter(q => !existingIds.has(q.id));
    
    // Combine existing and new questions
    const combinedQuestions = [...existingQuestions, ...newQuestions];
    
    // Only keep the most recent 500 questions to manage storage
    const trimmedQuestions = combinedQuestions.slice(-500);
    
    localStorage.setItem(STORED_QUESTIONS_KEY, JSON.stringify(trimmedQuestions));
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
    
    // Add this exam's questions to the usage tracker
    usage[examId] = questionIds;
    
    // Keep only the 20 most recent exam sessions
    const examIds = Object.keys(usage);
    if (examIds.length > 20) {
      const oldestExams = examIds.slice(0, examIds.length - 20);
      oldestExams.forEach(id => delete usage[id]);
    }
    
    localStorage.setItem(QUESTION_USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error("Error tracking question usage:", error);
  }
};

/**
 * Get previously used questions from recent exams
 */
export const getRecentlyUsedQuestionIds = (): string[] => {
  try {
    const usageJson = localStorage.getItem(QUESTION_USAGE_KEY);
    if (!usageJson) return [];
    
    const usage = JSON.parse(usageJson);
    // Flatten all question IDs from all exams into a single array
    return Object.values(usage).flat() as string[];
  } catch (error) {
    console.error("Error getting recently used questions:", error);
    return [];
  }
};

/**
 * Record the last time we synced with the server
 */
export const updateLastSyncTime = (): void => {
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
};

/**
 * Check if we should sync with the server (every 24 hours)
 */
export const shouldSyncQuestions = (): boolean => {
  const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
  if (!lastSyncStr) return true;
  
  const lastSync = parseInt(lastSyncStr);
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  return lastSync < twentyFourHoursAgo;
};

/**
 * Generate a unique ID for new questions
 */
export const generateQuestionId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

/**
 * Filters questions based on subject and unit objective
 */
export const filterQuestions = (
  questions: ExamQuestion[],
  subject?: string,
  unitObjective?: string
): ExamQuestion[] => {
  return questions.filter(q => {
    // Filter by subject if provided
    if (subject && q.subject && q.subject.toLowerCase() !== subject.toLowerCase()) {
      return false;
    }
    
    // Filter by unit objective if provided
    if (unitObjective && q.unit_objective) {
      const objectiveWords = unitObjective.toLowerCase().split(' ');
      const questionObjective = q.unit_objective.toLowerCase();
      
      // Check if any of the objective words are in the question's objective
      return objectiveWords.some(word => 
        word.length > 3 && questionObjective.includes(word)
      );
    }
    
    return true;
  });
};

/**
 * Fisher-Yates shuffle algorithm for randomizing questions
 */
export const shuffleQuestions = (questions: ExamQuestion[]): ExamQuestion[] => {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Check if an array of questions contains duplicates
 */
export const hasDuplicateQuestions = (questions: ExamQuestion[]): boolean => {
  // Extract first 40 chars of each question text to create a fingerprint
  const questionFingerprints = questions.map(q => q.question_text.substring(0, 40).toLowerCase());
  const uniqueFingerprints = new Set(questionFingerprints);
  
  return uniqueFingerprints.size < questionFingerprints.length;
};

/**
 * Verify questions have necessary fields
 */
export const validateQuestions = (questions: ExamQuestion[]): boolean => {
  return questions.every(q => 
    q.id && 
    q.question_text && 
    q.option_a && 
    q.option_b && 
    q.option_c && 
    q.option_d && 
    q.correct_answer
  );
};

/**
 * Generates a set of unique questions based on criteria
 */
export const generateUniqueQuestions = async (
  count: number,
  subject?: string,
  unitObjective?: string,
  examId: string = Date.now().toString()
): Promise<{questions: ExamQuestion[], source: 'ai' | 'local', warning?: string, error?: string}> => {
  // Check if online
  const online = isOnline();
  
  if (online) {
    try {
      console.log(`Attempting to generate ${count} AI questions for ${subject || "general"} subject`);
      
      // Try to use AI to generate questions
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
        throw new Error(`AI generation failed: ${result.error.message}`);
      }
      
      if (!result.data?.questions || result.data.questions.length === 0) {
        throw new Error("No questions were generated by the AI service");
      }
      
      console.log(`Received ${result.data.questions.length} questions from AI service`);
      
      // Additional logging for stats if available
      if (result.data.stats) {
        console.log(`AI generation stats: ${JSON.stringify(result.data.stats)}`);
      }
      
      // Check for duplicate questions
      if (hasDuplicateQuestions(result.data.questions)) {
        console.warn("Detected duplicate questions in AI response");
      }
      
      // Validate the questions have all required fields
      if (!validateQuestions(result.data.questions)) {
        console.error("Some AI-generated questions are missing required fields");
        throw new Error("Invalid questions returned from AI service");
      }
      
      // Ensure each question has an ID and subject
      const aiQuestions = result.data.questions.map((q: ExamQuestion) => ({
        ...q,
        id: q.id || generateQuestionId(),
        subject: q.subject || subject,
        unit_objective: q.unit_objective || unitObjective,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      // Store the questions for offline use
      storeQuestions(aiQuestions);
      
      // Track the question usage for this exam
      trackQuestionUsage(examId, aiQuestions.map(q => q.id));
      
      // Update the last sync time
      updateLastSyncTime();
      
      // Check if we have any error/warning from the API
      let warning = undefined;
      if (result.data.error) {
        warning = `AI Service Error: ${result.data.error}. ${result.data.fix || ''}`;
      } else if (result.data.stats && result.data.stats.fallbackUsed > 0) {
        warning = `${result.data.stats.fallbackUsed} out of ${count} questions are from the fallback system. The others were AI-generated.`;
      } else if (aiQuestions.length < count) {
        warning = `Only ${aiQuestions.length} questions could be generated by the AI.`;
      }
      
      const source = result.data.source === 'fallback' ? 'local' : 'ai';
      
      return { 
        questions: aiQuestions, 
        source, 
        warning,
        error: result.data.error
      };
    } catch (error) {
      console.error("Error generating questions from AI:", error);
      // Fall back to local questions if AI fails
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        ...getLocalQuestions(count, subject, unitObjective, examId),
        warning: `AI generation failed: ${errorMessage}. Using local question bank instead.`,
        error: errorMessage
      };
    }
  }
  
  // If we're offline or AI generation failed, use local questions
  return getLocalQuestions(count, subject, unitObjective, examId);
};

/**
 * Helper function to get questions from local storage
 */
const getLocalQuestions = (
  count: number,
  subject?: string,
  unitObjective?: string,
  examId: string = Date.now().toString()
): {questions: ExamQuestion[], source: 'local', warning?: string} => {
  const storedQuestions = getStoredQuestions();
  
  // Filter questions by subject and unit objective
  const filteredQuestions = filterQuestions(storedQuestions, subject, unitObjective);
  
  // Get recently used question IDs to avoid repeats
  const recentlyUsedIds = new Set(getRecentlyUsedQuestionIds());
  
  // Prioritize questions that haven't been used recently
  const freshQuestions = filteredQuestions.filter(q => !recentlyUsedIds.has(q.id));
  const reusableQuestions = filteredQuestions.filter(q => recentlyUsedIds.has(q.id));
  
  // Shuffle both arrays to ensure randomness
  const shuffledFresh = shuffleQuestions(freshQuestions);
  const shuffledReusable = shuffleQuestions(reusableQuestions);
  
  // Combine them, prioritizing fresh questions
  let selectedQuestions = [...shuffledFresh];
  
  // If we don't have enough fresh questions, add some reusable ones
  if (selectedQuestions.length < count) {
    selectedQuestions = selectedQuestions.concat(
      shuffledReusable.slice(0, count - selectedQuestions.length)
    );
  }
  
  // Take only the number of questions requested
  const finalQuestions = selectedQuestions.slice(0, count);
  
  // Track the question usage for this exam
  trackQuestionUsage(examId, finalQuestions.map(q => q.id));
  
  // Check if we have enough questions
  let warning: string | undefined;
  if (finalQuestions.length < count) {
    warning = `Only ${finalQuestions.length} unique questions available offline. Connect to the internet to generate more questions.`;
  } else if (freshQuestions.length < count) {
    warning = `Some questions have been reused from previous exams due to limited offline question bank.`;
  }
  
  return { questions: finalQuestions, source: 'local', warning };
};

// Initial seed data with some default questions
export const seedInitialQuestions = (): void => {
  const existingQuestions = getStoredQuestions();
  
  // Only seed if we don't have any questions yet
  if (existingQuestions.length === 0) {
    const seedQuestions: ExamQuestion[] = [
      {
        id: "seed-1",
        question_text: "Which of the following is a correct statement about photosynthesis?",
        option_a: "It only occurs in animal cells",
        option_b: "It converts light energy into chemical energy",
        option_c: "It releases oxygen and consumes carbon dioxide in all plants",
        option_d: "It primarily takes place in the mitochondria",
        correct_answer: "B",
        explanation: "Photosynthesis is the process by which green plants and some other organisms convert light energy into chemical energy. The process consumes carbon dioxide and water and produces glucose and oxygen.",
        subject: "Biology",
        difficulty_level: 3
      },
      {
        id: "seed-2",
        question_text: "What is the value of x in the equation 2x² + 5x - 3 = 0?",
        option_a: "x = -3 or x = 0.5",
        option_b: "x = 3 or x = -0.5",
        option_c: "x = -3 or x = -0.5",
        option_d: "x = 0.5 or x = 3",
        correct_answer: "A",
        explanation: "Using the quadratic formula: x = (-5 ± √(25+24))/4 = (-5 ± √49)/4 = (-5 ± 7)/4. This gives x = -3 or x = 0.5.",
        subject: "Mathematics",
        difficulty_level: 3
      },
      {
        id: "seed-3",
        question_text: "Which of the following best describes the Law of Conservation of Energy?",
        option_a: "Energy can be created but not destroyed",
        option_b: "Energy can be destroyed but not created",
        option_c: "Energy can neither be created nor destroyed, only transformed",
        option_d: "The total amount of energy in a system always increases over time",
        correct_answer: "C",
        explanation: "The Law of Conservation of Energy states that energy cannot be created or destroyed, only converted from one form to another. The total energy in an isolated system remains constant.",
        subject: "Physics",
        difficulty_level: 3
      },
      // Add more seed questions as needed
    ];
    
    storeQuestions(seedQuestions);
  }
};

// Initialize the question bank when this module is first loaded
seedInitialQuestions();
