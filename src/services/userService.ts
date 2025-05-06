
import { supabase } from "@/integrations/supabase/client";
import { subjects } from "@/utils/subjects";

export interface UserProfile {
  id: string;
  display_name: string;
  grade?: string;
  location?: string;
  avatar_url?: string;
  total_study_time: number;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'exam_completed' | 'topic_started' | 'resource_downloaded';
  subject_id?: string;
  title: string;
  details?: any;
  created_at: string;
}

export interface UserSubjectProgress {
  id: string;
  user_id: string;
  subject_id: string;
  progress: number;
  study_time: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

// Fetch user profile
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return null;
    }
    
    // Fetch profile from our new user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return {
      ...data,
      email: userData.user.email,
      display_name: data.display_name || userData.user.email?.split('@')[0] || 'Student'
    } as UserProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Fetch user activities
export const fetchUserActivities = async (limit = 10): Promise<UserActivity[]> => {
  try {
    // Get current user ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return [];
    }
    
    // Use our new user_activities table
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
    
    // Map to our expected format
    return data.map(activity => ({
      id: activity.id,
      user_id: activity.user_id,
      activity_type: mapActivityType(activity.activity_type),
      subject_id: activity.subject_id,
      title: activity.title,
      details: activity.details,
      created_at: activity.created_at
    }));
  } catch (error) {
    console.error('Error in fetchUserActivities:', error);
    return [];
  }
};

// Helper to map activity types between our database and app
const mapActivityType = (dbType: string): 'exam_completed' | 'topic_started' | 'resource_downloaded' => {
  switch (dbType) {
    case 'exam': return 'exam_completed';
    case 'study': return 'topic_started';
    case 'resource_downloaded': return 'resource_downloaded';
    default: return 'topic_started';
  }
};

// Fetch user subject progress
export const fetchUserSubjectProgress = async (): Promise<UserSubjectProgress[]> => {
  try {
    // Get current user ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return [];
    }
    
    // Fetch from our new user_progress table
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error('Error fetching user subject progress:', error);
      return [];
    }
    
    // Get study sessions for study time calculation
    const { data: studyData, error: studyError } = await supabase
      .from('study_sessions')
      .select('subject_id, duration')
      .eq('user_id', userData.user.id);
      
    if (studyError) {
      console.error('Error fetching study sessions:', studyError);
    }
    
    // Calculate study time per subject
    const studyTimeBySubject: Record<string, number> = {};
    if (studyData) {
      studyData.forEach(session => {
        if (!studyTimeBySubject[session.subject_id]) {
          studyTimeBySubject[session.subject_id] = 0;
        }
        studyTimeBySubject[session.subject_id] += session.duration;
      });
    }
    
    // Map to our expected format
    return data.map(progress => ({
      id: progress.id,
      user_id: progress.user_id,
      subject_id: progress.subject_id,
      progress: progress.progress_percentage,
      study_time: studyTimeBySubject[progress.subject_id] || 0,
      last_activity: progress.updated_at,
      created_at: progress.created_at,
      updated_at: progress.updated_at
    }));
  } catch (error) {
    console.error('Error in fetchUserSubjectProgress:', error);
    return [];
  }
};

// Record a new user activity
export const recordUserActivity = async (
  activityType: 'exam_completed' | 'topic_started' | 'resource_downloaded',
  title: string,
  subjectId?: string,
  details?: any
): Promise<void> => {
  try {
    // Map to database activity types
    let dbActivityType: string;
    switch (activityType) {
      case 'exam_completed': dbActivityType = 'exam'; break;
      case 'topic_started': dbActivityType = 'study'; break;
      case 'resource_downloaded': dbActivityType = 'resource_downloaded'; break;
      default: dbActivityType = 'study';
    }
    
    // Insert into our user_activities table
    const { error } = await supabase
      .from('user_activities')
      .insert({
        activity_type: dbActivityType,
        title,
        subject_id: subjectId || 'general',
        details
      });
    
    if (error) {
      console.error('Error recording user activity:', error);
    }
  } catch (error) {
    console.error('Error in recordUserActivity:', error);
  }
};

// Update user subject progress
export const updateSubjectProgress = async (
  subjectId: string,
  progress: number,
  studyTimeMinutes = 0
): Promise<void> => {
  try {
    // Get current user ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error('No authenticated user found when updating subject progress');
      return;
    }
    
    if (studyTimeMinutes > 0) {
      // Record a study session which will trigger our database functions
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          subject_id: subjectId,
          duration: studyTimeMinutes
        });
        
      if (sessionError) {
        console.error('Error recording study session:', sessionError);
      }
    } else {
      // Direct update to user_progress if no study time
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          subject_id: subjectId,
          progress_percentage: progress,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,subject_id'
        });
        
      if (error) {
        console.error('Error updating subject progress:', error);
      }
      
      // Record in history
      const { error: historyError } = await supabase
        .from('progress_history')
        .insert({
          subject_id: subjectId,
          progress_percentage: progress
        });
        
      if (historyError) {
        console.error('Error recording progress history:', historyError);
      }
    }
  } catch (error) {
    console.error('Error in updateSubjectProgress:', error);
  }
};

// Update total study time directly (usually handled by triggers now)
export const updateTotalStudyTime = async (additionalMinutes: number): Promise<void> => {
  try {
    // Get current user ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return;
    }
    
    // Update the total study time in user profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        total_study_time: additionalMinutes > 0 ? supabase.rpc('increment', { 
          x: additionalMinutes, 
          column_name: 'total_study_time', 
          table_name: 'user_profiles' 
        }) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user.id);
      
    if (error) {
      console.error('Error updating total study time:', error);
    }
  } catch (error) {
    console.error('Error in updateTotalStudyTime:', error);
  }
};

// Calculate stats for the dashboard
export interface UserStats {
  totalExams: number;
  averageScore: number;
  studyTime: number;
  mostActiveSubject: {
    id: string;
    name: string;
  };
  overallProgress: number;
}

export const calculateUserStats = async (): Promise<UserStats> => {
  try {
    // Get current user ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('No authenticated user found');
    }
    
    // Fetch profile for total study time
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('total_study_time')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Fetch exams data
    const { data: examsData, error: examsError } = await supabase
      .from('user_exams')
      .select('score, total_questions, subject_id')
      .eq('user_id', userData.user.id);
      
    if (examsError) {
      console.error('Error fetching exams:', examsError);
    }
    
    // Fetch progress data
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('subject_id, progress_percentage')
      .eq('user_id', userData.user.id);
      
    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }
    
    // Fetch activities for most active subject
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('user_activities')
      .select('subject_id')
      .eq('user_id', userData.user.id);
      
    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }
    
    // Calculate stats
    const totalExams = examsData?.length || 0;
    
    // Calculate average score
    let averageScore = 0;
    if (examsData && examsData.length > 0) {
      const totalScore = examsData.reduce((sum, exam) => {
        if (exam.total_questions > 0) {
          return sum + ((exam.score / exam.total_questions) * 100);
        }
        return sum;
      }, 0);
      averageScore = totalScore / examsData.length;
    }
    
    // Get study time
    const studyTime = profileData?.total_study_time || 0;
    
    // Find most active subject by counting activities
    const subjectActivityCount: Record<string, number> = {};
    if (activitiesData) {
      activitiesData.forEach(activity => {
        if (activity.subject_id) {
          subjectActivityCount[activity.subject_id] = (subjectActivityCount[activity.subject_id] || 0) + 1;
        }
      });
    }
    
    let mostActiveSubjectId = '';
    let maxCount = 0;
    
    Object.entries(subjectActivityCount).forEach(([subjectId, count]) => {
      if (count > maxCount) {
        mostActiveSubjectId = subjectId;
        maxCount = count;
      }
    });
    
    const mostActiveSubject = {
      id: mostActiveSubjectId,
      name: subjects.find(s => s.id === mostActiveSubjectId)?.name || 'Unknown'
    };
    
    // Calculate overall progress
    let overallProgress = 0;
    if (progressData && progressData.length > 0) {
      overallProgress = progressData.reduce((sum, p) => sum + p.progress_percentage, 0) / progressData.length;
    }
    
    return {
      totalExams,
      averageScore,
      studyTime,
      mostActiveSubject,
      overallProgress
    };
  } catch (error) {
    console.error('Error in calculateUserStats:', error);
    return {
      totalExams: 0,
      averageScore: 0,
      studyTime: 0,
      mostActiveSubject: { id: '', name: 'None' },
      overallProgress: 0
    };
  }
};

// Helper function to seed exam data from AppContext to actual database
export const syncExamsToDatabase = async (exams: any[]): Promise<void> => {
  try {
    // Get current user ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return;
    }
    
    // Filter to only this user's exams
    const userExams = exams.filter(exam => (!exam.user_id) || exam.user_id === userData.user.id);
    
    // Insert each exam if not already in database
    for (const exam of userExams) {
      const score = typeof exam.score === 'number' ? exam.score : 0;
      const totalQuestions = typeof exam.totalQuestions === 'number' ? exam.totalQuestions : 0;
      
      // Check if exam exists by its local ID
      const { data: existingExam } = await supabase
        .from('user_exams')
        .select('id')
        .eq('id', exam.id)
        .maybeSingle();
        
      if (!existingExam) {
        // Insert into user_exams table
        await supabase
          .from('user_exams')
          .insert({
            id: exam.id,  // Use the same ID to avoid duplicates
            user_id: userData.user.id,
            subject_id: exam.subject,
            score: score,
            total_questions: totalQuestions,
            completed_at: exam.date || new Date().toISOString()
          })
          .select();
      }
    }
  } catch (error) {
    console.error('Error syncing exams to database:', error);
  }
};
