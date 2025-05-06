import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import {
  fetchUserProfile,
  fetchUserActivities,
  fetchUserSubjectProgress,
  calculateUserStats,
  UserProfile,
  UserActivity,
  UserSubjectProgress,
  UserStats
} from '@/services/userService';
import { subjects } from '@/utils/subjects';

export const useUserData = () => {
  const { user } = useAuth();
  const { recentExams, subjectProgress: localSubjectProgress } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [progress, setProgress] = useState<UserSubjectProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useLocalData, setUseLocalData] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Attempt to fetch user data from Supabase
        const [profileData, activitiesData, progressData, statsData] = await Promise.all([
          fetchUserProfile(),
          fetchUserActivities(),
          fetchUserSubjectProgress(),
          calculateUserStats()
        ]);

        if (!profileData) {
          // If no profile data, use local storage data instead
          setUseLocalData(true);
          
          // Create a profile from user data
          const localProfile: UserProfile = {
            id: user.id,
            display_name: '',
            total_study_time: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: user.email || '',
          };
          
          // Map recent exams to activity format - only for current user
          const localActivities: UserActivity[] = recentExams
            .filter(exam => exam.userId === user.id) // Filter by current user ID
            .map(exam => ({
              id: exam.id,
              user_id: user.id,
              activity_type: 'exam_completed',
              subject_id: exam.subject,
              title: `${subjects.find(s => s.id === exam.subject)?.name || 'Unknown'} Exam`,
              details: {
                score: exam.score,
                totalQuestions: exam.totalQuestions
              },
              created_at: exam.date
            }));
          
          // Map local subject progress to progress format - only for current user
          const localProgressData: UserSubjectProgress[] = Object.entries(localSubjectProgress)
            .filter(([_, __]) => true) // We don't have user ID in local progress, assuming all belong to current user
            .map(([subjectId, progress]) => ({
              id: subjectId,
              user_id: user.id,
              subject_id: subjectId,
              progress: progress,
              study_time: 0,
              last_activity: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
          
          // Calculate local stats - using filtered data
          const localStats: UserStats = {
            totalExams: localActivities.length,
            averageScore: localActivities.length > 0 
              ? localActivities.reduce((sum, exam) => sum + (exam.details?.score || 0), 0) / localActivities.length 
              : 0,
            studyTime: 0, // We don't track this in local storage
            mostActiveSubject: { 
              id: '', 
              name: 'None' 
            },
            overallProgress: localProgressData.length > 0
              ? localProgressData.reduce((sum, p) => sum + p.progress, 0) / localProgressData.length
              : 0
          };
          
          // Find most active subject based on exam count - filtered by user
          if (localActivities.length > 0) {
            const subjectCounts: Record<string, number> = {};
            localActivities.forEach(activity => {
              if (activity.subject_id) {
                subjectCounts[activity.subject_id] = (subjectCounts[activity.subject_id] || 0) + 1;
              }
            });
            
            let maxCount = 0;
            let maxSubjectId = '';
            
            Object.entries(subjectCounts).forEach(([subjectId, count]) => {
              if (count > maxCount) {
                maxCount = count;
                maxSubjectId = subjectId;
              }
            });
            
            if (maxSubjectId) {
              localStats.mostActiveSubject = {
                id: maxSubjectId,
                name: subjects.find(s => s.id === maxSubjectId)?.name || 'Unknown'
              };
            }
          }
          
          setProfile(localProfile);
          setActivities(localActivities);
          setProgress(localProgressData);
          setStats(localStats);
        } else {
          // Use Supabase data - already filtered by user ID in the service functions
          if (profileData && !profileData.email && user.email) {
            profileData.email = user.email;
          }

          setProfile(profileData);
          setActivities(activitiesData);
          setProgress(progressData);
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Using local data instead.');
        setUseLocalData(true);
        
        // Fall back to local data - filtered by current user
        const localProfile: UserProfile = {
          id: user.id,
          display_name: '',
          total_study_time: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user.email || '',
        };
        
        // Filter by current user ID
        const localActivities: UserActivity[] = recentExams
          .filter(exam => exam.userId === user.id)
          .map(exam => ({
            id: exam.id,
            user_id: user.id,
            activity_type: 'exam_completed',
            subject_id: exam.subject,
            title: `${subjects.find(s => s.id === exam.subject)?.name || 'Unknown'} Exam`,
            details: {
              score: exam.score,
              totalQuestions: exam.totalQuestions
            },
            created_at: exam.date
          }));
        
        const localProgressData: UserSubjectProgress[] = Object.entries(localSubjectProgress)
          .filter(([_, __]) => true) // We don't have user ID in local progress, assuming all belong to current user
          .map(([subjectId, progress]) => ({
            id: subjectId,
            user_id: user.id,
            subject_id: subjectId,
            progress: progress,
            study_time: 0,
            last_activity: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
        
        const localStats: UserStats = {
          totalExams: localActivities.length,
          averageScore: localActivities.length > 0 
            ? localActivities.reduce((sum, act) => sum + (act.details?.score || 0), 0) / localActivities.length 
            : 0,
          studyTime: 0,
          mostActiveSubject: { 
            id: '', 
            name: 'None' 
          },
          overallProgress: Object.values(localSubjectProgress).length > 0
            ? Object.values(localSubjectProgress).reduce((sum, p) => sum + p, 0) / Object.values(localSubjectProgress).length
            : 0
        };
        
        // Find most active subject - filtered by user
        if (localActivities.length > 0) {
          const subjectCounts: Record<string, number> = {};
          localActivities.forEach(activity => {
            if (activity.subject_id) {
              subjectCounts[activity.subject_id] = (subjectCounts[activity.subject_id] || 0) + 1;
            }
          });
          
          let maxCount = 0;
          let maxSubjectId = '';
          
          Object.entries(subjectCounts).forEach(([subjectId, count]) => {
            if (count > maxCount) {
              maxCount = count;
              maxSubjectId = subjectId;
            }
          });
          
          if (maxSubjectId) {
            localStats.mostActiveSubject = {
              id: maxSubjectId,
              name: subjects.find(s => s.id === maxSubjectId)?.name || 'Unknown'
            };
          }
        }
        
        setProfile(localProfile);
        setActivities(localActivities);
        setProgress(localProgressData);
        setStats(localStats);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, recentExams, localSubjectProgress]);

  return {
    isLoading,
    profile,
    activities,
    progress,
    stats,
    error,
    isUsingLocalData: useLocalData,
    refreshData: async () => {
      setIsLoading(true);
      try {
        if (useLocalData) {
          // If using local data, just refresh using the latest local data
          const localProfile: UserProfile = {
            id: user?.id || '',
            display_name: '',
            total_study_time: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: user?.email || '',
          };
          
          // Filter by current user ID
          const localActivities: UserActivity[] = recentExams
            .filter(exam => exam.userId === user?.id)
            .map(exam => ({
              id: exam.id,
              user_id: user?.id || '',
              activity_type: 'exam_completed',
              subject_id: exam.subject,
              title: `${subjects.find(s => s.id === exam.subject)?.name || 'Unknown'} Exam`,
              details: {
                score: exam.score,
                totalQuestions: exam.totalQuestions
              },
              created_at: exam.date
            }));
          
          const localProgressData: UserSubjectProgress[] = Object.entries(localSubjectProgress).map(([subjectId, progress]) => ({
            id: subjectId,
            user_id: user?.id || '',
            subject_id: subjectId,
            progress: progress,
            study_time: 0,
            last_activity: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          const localStats: UserStats = {
            totalExams: localActivities.length,
            averageScore: localActivities.length > 0 
              ? localActivities.reduce((sum, act) => sum + (act.details?.score || 0), 0) / localActivities.length 
              : 0,
            studyTime: 0,
            mostActiveSubject: { 
              id: '', 
              name: 'None' 
            },
            overallProgress: Object.values(localSubjectProgress).length > 0
              ? Object.values(localSubjectProgress).reduce((sum, p) => sum + p, 0) / Object.values(localSubjectProgress).length
              : 0
          };
          
          // Find most active subject - filtered by user
          if (localActivities.length > 0) {
            const subjectCounts: Record<string, number> = {};
            localActivities.forEach(activity => {
              if (activity.subject_id) {
                subjectCounts[activity.subject_id] = (subjectCounts[activity.subject_id] || 0) + 1;
              }
            });
            
            let maxCount = 0;
            let maxSubjectId = '';
            
            Object.entries(subjectCounts).forEach(([subjectId, count]) => {
              if (count > maxCount) {
                maxCount = count;
                maxSubjectId = subjectId;
              }
            });
            
            if (maxSubjectId) {
              localStats.mostActiveSubject = {
                id: maxSubjectId,
                name: subjects.find(s => s.id === maxSubjectId)?.name || 'Unknown'
              };
            }
          }
          
          setProfile(localProfile);
          setActivities(localActivities);
          setProgress(localProgressData);
          setStats(localStats);
          setError(null);
        } else {
          // Try using Supabase data - already filtered by user ID in the service functions
          const [profileData, activitiesData, progressData, statsData] = await Promise.all([
            fetchUserProfile(),
            fetchUserActivities(),
            fetchUserSubjectProgress(),
            calculateUserStats()
          ]);

          // Ensure profile has email if available
          if (profileData && !profileData.email && user?.email) {
            profileData.email = user.email;
          }

          setProfile(profileData);
          setActivities(activitiesData);
          setProgress(progressData);
          setStats(statsData);
          setError(null);
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
        setError('Failed to refresh user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
};
