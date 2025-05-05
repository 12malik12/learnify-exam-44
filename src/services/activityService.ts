
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
    try {
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
    } catch (error) {
      console.log('Failed to record activity in Supabase, will use local storage');
      // The AppContext will handle storing in localStorage
    }
    
    // Update subject progress
    try {
      // For simplicity, we'll update progress based on exam score
      await updateSubjectProgress(subjectId, scorePercentage, 30); // Assuming 30 minutes per exam
    } catch (error) {
      console.log('Failed to update progress in Supabase, will use local storage');
      // The AppContext will handle storing in localStorage
    }
    
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
    try {
      await recordUserActivity(
        'topic_started',
        topicTitle,
        subjectId,
        { started: true }
      );
    } catch (error) {
      console.log('Failed to record topic activity in Supabase, will use local storage');
      // The AppContext will handle storing in localStorage
    }
    
    // Update study time
    try {
      await updateTotalStudyTime(5); // Add 5 minutes for starting a topic
    } catch (error) {
      console.log('Failed to update study time in Supabase, will use local storage');
    }
    
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
    try {
      await recordUserActivity(
        'resource_downloaded',
        resourceTitle,
        subjectId,
        { type: resourceType }
      );
    } catch (error) {
      console.log('Failed to record resource download in Supabase, will use local storage');
    }
    
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
    try {
      await updateSubjectProgress(subjectId, 0, durationMinutes);
    } catch (error) {
      console.log('Failed to record study session in Supabase, will use local storage');
    }
    
    return true;
  } catch (error) {
    console.error('Error recording study session:', error);
    return false;
  }
};
