
import { getQuestionsBySubject, getAllQuestions, getQuestionCountBySubject } from "./questionBank";

export interface GenerateQuestionsParams {
  subject: string;
  count: number;
  unitObjective?: string;
}

export interface GenerateQuestionsResult {
  questions: any[];
  warning?: string;
}

// Generate unique questions for an exam session
export const generateQuestions = ({ 
  subject, 
  count,
  unitObjective
}: GenerateQuestionsParams): GenerateQuestionsResult => {
  // Get questions from the subject or all questions if no subject specified
  const availableQuestions = subject 
    ? getQuestionsBySubject(subject)
    : getAllQuestions();
  
  // Filter by unit objective if provided
  const filteredQuestions = unitObjective
    ? availableQuestions.filter(q => 
        q.unit_objective?.toLowerCase().includes(unitObjective.toLowerCase()) ||
        q.question_text.toLowerCase().includes(unitObjective.toLowerCase())
      )
    : availableQuestions;
  
  let warning = "";
  
  // Check if we have enough questions
  if (filteredQuestions.length < count) {
    warning = `Only ${filteredQuestions.length} questions are available for the selected criteria. Using all available questions.`;
    
    // If we don't have enough questions for the subject and objective, get more from the subject
    if (subject && filteredQuestions.length < count && unitObjective) {
      const subjectQuestions = getQuestionsBySubject(subject);
      
      // Add additional questions from the subject (that weren't already included)
      const additionalQuestions = subjectQuestions.filter(
        q => !filteredQuestions.some(fq => fq.id === q.id)
      );
      
      // Add as many as needed to reach the count or all if not enough
      const neededCount = Math.min(count - filteredQuestions.length, additionalQuestions.length);
      filteredQuestions.push(...additionalQuestions.slice(0, neededCount));
      
      if (filteredQuestions.length < count) {
        // Still not enough, get questions from other subjects
        const otherQuestions = getAllQuestions().filter(
          q => !filteredQuestions.some(fq => fq.id === q.id)
        );
        
        // Add as many as needed to reach the count
        const stillNeededCount = Math.min(count - filteredQuestions.length, otherQuestions.length);
        filteredQuestions.push(...otherQuestions.slice(0, stillNeededCount));
      }
    }
  }
  
  // Randomly select questions to avoid getting the same set every time
  const selectedQuestions = shuffleArray(filteredQuestions)
    .slice(0, Math.min(count, filteredQuestions.length));

  // Add unique IDs and make sure the format matches what the UI expects
  const formattedQuestions = selectedQuestions.map((q, index) => ({
    ...q,
    id: `${q.id}-${Date.now()}-${index}` // Ensure unique IDs even with repeated questions
  }));
  
  return {
    questions: formattedQuestions,
    warning: warning || undefined
  };
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
