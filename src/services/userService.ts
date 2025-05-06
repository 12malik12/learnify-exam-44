
import { supabase } from "@/integrations/supabase/client";
import { subjects } from "@/utils/subjects";

// Constants for API access
const SUPABASE_URL = "https://toigsarjwwediuelpxvi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvaWdzYXJqd3dlZGl1ZWxweHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjEyNTUsImV4cCI6MjA1NzA5NzI1NX0.FRc7qqt5Q76k1EPGAdYAQh51Wbmg2wzED2uLJVuhaas";

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
    
    // Using REST API call directly to avoid TypeScript type issues
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userData.user.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    const data = await response.json();
    const profileData = data[0] || null;
    
    if (!profileData) {
      return null;
    }
    
    return {
      ...profileData,
      email: userData.user.email,
      display_name: profileData.display_name || userData.user.email?.split('@')[0] || 'Student',
      total_study_time: profileData.total_study_time || 0
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
    
    // Using REST API call directly to avoid TypeScript type issues
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_activities?user_id=eq.${userData.user.id}&order=created_at.desc&limit=${limit}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    
    const data = await response.json();
    
    // Map to our expected format
    return data.map((activity: any) => ({
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
    
    // Using REST API call directly to avoid TypeScript type issues
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${userData.user.id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    
    const data = await response.json();
    
    // Get study sessions for study time calculation
    const studyResponse = await fetch(`${SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.${userData.user.id}&select=subject_id,duration`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    let studyData: any[] = [];
    if (studyResponse.ok) {
      studyData = await studyResponse.json();
    }
    
    // Calculate study time per subject
    const studyTimeBySubject: Record<string, number> = {};
    if (studyData && studyData.length > 0) {
      studyData.forEach(session => {
        if (!studyTimeBySubject[session.subject_id]) {
          studyTimeBySubject[session.subject_id] = 0;
        }
        studyTimeBySubject[session.subject_id] += session.duration;
      });
    }
    
    // Map to our expected format
    return data.map((progress: any) => ({
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
    
    // Use edge function to handle the operation
    await supabase.functions.invoke("insert_user_activity", {
      body: {
        p_activity_type: dbActivityType,
        p_subject_id: subjectId || 'general',
        p_title: title,
        p_details: details || {}
      }
    });
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
      // Record a study session using our edge function
      await supabase.functions.invoke("insert_study_session", {
        body: {
          p_subject_id: subjectId,
          p_duration: studyTimeMinutes
        }
      });
    } else {
      // Direct REST API call to update user_progress if no study time
      const response = await fetch(`${SUPABASE_URL}/rest/v1/user_progress`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          subject_id: subjectId,
          progress_percentage: progress,
          updated_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.error('Error updating subject progress:', await response.text());
      }
      
      // Record in history
      const historyResponse = await fetch(`${SUPABASE_URL}/rest/v1/progress_history`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          subject_id: subjectId,
          progress_percentage: progress
        })
      });
      
      if (!historyResponse.ok) {
        console.error('Error recording progress history:', await historyResponse.text());
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
    
    if (additionalMinutes <= 0) {
      return;
    }

    // REST API call to update the total study time in user profile
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userData.user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        total_study_time: parseInt(String(additionalMinutes), 10),
        updated_at: new Date().toISOString()
      })
    });
      
    if (!response.ok) {
      console.error('Error updating total study time:', await response.text());
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
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userData.user.id}&select=total_study_time`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    let profileData: any = null;
    if (profileResponse.ok) {
      const profileArray = await profileResponse.json();
      profileData = profileArray[0];
    }
    
    // Fetch exams data
    const examsResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_exams?user_id=eq.${userData.user.id}&select=score,total_questions,subject_id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    let examsData: any[] = [];
    if (examsResponse.ok) {
      examsData = await examsResponse.json();
    }
    
    // Fetch progress data
    const progressResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_progress?user_id=eq.${userData.user.id}&select=subject_id,progress_percentage`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    let progressData: any[] = [];
    if (progressResponse.ok) {
      progressData = await progressResponse.json();
    }
    
    // Fetch activities for most active subject
    const activitiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_activities?user_id=eq.${userData.user.id}&select=subject_id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    let activitiesData: any[] = [];
    if (activitiesResponse.ok) {
      activitiesData = await activitiesResponse.json();
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
    const studyTime = (profileData?.total_study_time) || 0;
    
    // Find most active subject by counting activities
    const subjectActivityCount: Record<string, number> = {};
    if (activitiesData && activitiesData.length > 0) {
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
      
      // Use edge function to insert the exam
      await supabase.functions.invoke("insert_user_exam", {
        body: { 
          p_subject_id: exam.subject,
          p_score: score,
          p_total_questions: totalQuestions,
          id: exam.id  // Pass the local ID to avoid duplicates
        }
      });
    }
  } catch (error) {
    console.error('Error syncing exams to database:', error);
  }
};
