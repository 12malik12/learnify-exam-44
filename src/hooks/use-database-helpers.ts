
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to deploy database helper functions
 */
export const useDatabaseHelpers = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const deployHelperFunctions = useCallback(async () => {
    setIsDeploying(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-helpers', {
        body: { action: 'deploy' }
      });
      
      if (error) {
        console.error('Failed to deploy database helpers:', error);
        toast({
          title: 'Error',
          description: 'Failed to deploy database helper functions',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'Database helper functions deployed successfully',
      });
      return true;
    } catch (error) {
      console.error('Error deploying database helpers:', error);
      toast({
        title: 'Error',
        description: 'Failed to deploy database helper functions',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeploying(false);
    }
  }, []);

  const resetUserProfile = useCallback(async () => {
    setIsResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-helpers', {
        body: { action: 'reset_profile' }
      });
      
      if (error) {
        console.error('Failed to reset user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to reset user profile data',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'User profile has been reset successfully',
      });
      return true;
    } catch (error) {
      console.error('Error resetting user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset user profile data',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  }, []);

  return {
    isDeploying,
    deployHelperFunctions,
    isResetting,
    resetUserProfile
  };
};
