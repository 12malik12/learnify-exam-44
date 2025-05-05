
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
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Fetch user activities
export const fetchUserActivities = async (limit = 10): Promise<UserActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
    
    return data as UserActivity[];
  } catch (error) {
    console.error('Error in fetchUserActivities:', error);
    return [];
  }
};

// Fetch user subject progress
export const fetchUserSubjectProgress = async (): Promise<UserSubjectProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_subject_progress')
      .select('*')
      .order('last_activity', { ascending: false });
    
    if (error) {
      console.error('Error fetching user subject progress:', error);
      return [];
    }
    
    return data as UserSubjectProgress[];
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
    const { error } = await supabase.from('user_activities').insert({
      activity_type: activityType,
      title,
      subject_id: subjectId,
      details,
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
    // First check if the progress entry exists
    const { data, error: fetchError } = await supabase
      .from('user_subject_progress')
      .select('*')
      .eq('subject_id', subjectId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking subject progress:', fetchError);
      return;
    }
    
    if (data) {
      // Update existing progress
      const { error } = await supabase
        .from('user_subject_progress')
        .update({
          progress,
          study_time: data.study_time + studyTimeMinutes,
          last_activity: new Date().toISOString(),
        })
        .eq('id', data.id);
      
      if (error) {
        console.error('Error updating subject progress:', error);
      }
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('user_subject_progress')
        .insert({
          subject_id: subjectId,
          progress,
          study_time: studyTimeMinutes,
        });
      
      if (error) {
        console.error('Error creating subject progress:', error);
      }
    }
    
    // If study time was added, update the total study time in user profile
    if (studyTimeMinutes > 0) {
      await updateTotalStudyTime(studyTimeMinutes);
    }
  } catch (error) {
    console.error('Error in updateSubjectProgress:', error);
  }
};

// Update total study time
export const updateTotalStudyTime = async (additionalMinutes: number): Promise<void> => {
  try {
    // Get current profile
    const { data, error: fetchError } = await supabase
      .from('user_profiles')
      .select('total_study_time')
      .single();
    
    if (fetchError) {
      console.error('Error fetching total study time:', fetchError);
      return;
    }
    
    // Update total time
    const { error } = await supabase
      .from('user_profiles')
      .update({
        total_study_time: (data?.total_study_time || 0) + additionalMinutes,
      });
    
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
    // Fetch profile, activities, and progress
    const profile = await fetchUserProfile();
    const activities = await fetchUserActivities(100);
    const progress = await fetchUserSubjectProgress();
    
    // Calculate total exams
    const examActivities = activities.filter(a => a.activity_type === 'exam_completed');
    const totalExams = examActivities.length;
    
    // Calculate average score
    const scores = examActivities
      .map(a => a.details?.score || 0)
      .filter(score => score > 0);
    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;
    
    // Get study time
    const studyTime = profile?.total_study_time || 0;
    
    // Find most active subject
    const subjectActivityCount: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.subject_id) {
        subjectActivityCount[activity.subject_id] = (subjectActivityCount[activity.subject_id] || 0) + 1;
      }
    });
    
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
    const overallProgress = progress.length > 0
      ? progress.reduce((sum, p) => sum + p.progress, 0) / progress.length
      : 0;
    
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
