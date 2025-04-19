
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setWasOffline(prevState => !isOnline ? true : prevState);
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  // Reset the wasOffline state after 10 seconds
  useEffect(() => {
    if (wasOffline) {
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
