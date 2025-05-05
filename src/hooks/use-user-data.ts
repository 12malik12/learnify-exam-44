
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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

export const useUserData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [progress, setProgress] = useState<UserSubjectProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch user data in parallel
        const [profileData, activitiesData, progressData, statsData] = await Promise.all([
          fetchUserProfile(),
          fetchUserActivities(),
          fetchUserSubjectProgress(),
          calculateUserStats()
        ]);

        // Ensure profile has email if available
        if (profileData && !profileData.email && user.email) {
          profileData.email = user.email;
        }

        setProfile(profileData);
        setActivities(activitiesData);
        setProgress(progressData);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  return {
    isLoading,
    profile,
    activities,
    progress,
    stats,
    error,
    refreshData: async () => {
      setIsLoading(true);
      try {
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
      } catch (err) {
        console.error('Error refreshing user data:', err);
        setError('Failed to refresh user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
};
