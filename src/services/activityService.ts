
import { supabase } from "@/integrations/supabase/client";
import { recordUserActivity, updateSubjectProgress, updateTotalStudyTime } from "./userService";

// Record exam completion
export const recordExamCompletion = async (
  subjectId: string,
  score: number,
  totalQuestions: number,
  examTitle: string
) => {
  try {
    // Calculate score percentage
    const scorePercentage = Math.round((score / totalQuestions) * 100);
    
    // Record the activity
    await recordUserActivity(
      'exam_completed',
      examTitle,
      subjectId,
      { 
        score: scorePercentage, 
        totalQuestions,
        completed: true
      }
    );
    
    // Update subject progress
    // For simplicity, we'll update progress based on exam score
    // A more complex algorithm could be implemented based on requirements
    await updateSubjectProgress(subjectId, scorePercentage, 30); // Assuming 30 minutes per exam
    
    return true;
  } catch (error) {
    console.error('Error recording exam completion:', error);
    return false;
  }
};

// Record topic started
export const recordTopicStarted = async (
  subjectId: string,
  topicTitle: string
) => {
  try {
    // Record the activity
    await recordUserActivity(
      'topic_started',
      topicTitle,
      subjectId,
      { started: true }
    );
    
    // Update study time
    await updateTotalStudyTime(5); // Add 5 minutes for starting a topic
    
    return true;
  } catch (error) {
    console.error('Error recording topic started:', error);
    return false;
  }
};

// Record resource downloaded
export const recordResourceDownloaded = async (
  subjectId: string,
  resourceTitle: string,
  resourceType: string
) => {
  try {
    // Record the activity
    await recordUserActivity(
      'resource_downloaded',
      resourceTitle,
      subjectId,
      { type: resourceType }
    );
    
    return true;
  } catch (error) {
    console.error('Error recording resource downloaded:', error);
    return false;
  }
};

// Record study session
export const recordStudySession = async (
  subjectId: string,
  durationMinutes: number
) => {
  try {
    // Update subject progress
    await updateSubjectProgress(subjectId, 0, durationMinutes);
    
    return true;
  } catch (error) {
    console.error('Error recording study session:', error);
    return false;
  }
};
