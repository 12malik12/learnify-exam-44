
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to deploy database helper functions
 */
export const useDatabaseHelpers = () => {
  const [isDeploying, setIsDeploying] = useState(false);

  const deployHelperFunctions = useCallback(async () => {
    setIsDeploying(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-helpers');
      
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

  return {
    isDeploying,
    deployHelperFunctions
  };
};
