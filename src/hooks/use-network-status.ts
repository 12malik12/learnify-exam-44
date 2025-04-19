
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastStatusChange, setLastStatusChange] = useState(Date.now());

  useEffect(() => {
    const handleOnline = () => {
      console.log("Network status changed: Online");
      setLastStatusChange(Date.now());
      setWasOffline(prevState => !isOnline ? true : prevState);
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("Network status changed: Offline");
      setLastStatusChange(Date.now());
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also check connection status periodically
    const checkInterval = setInterval(() => {
      const currentOnlineStatus = navigator.onLine;
      if (currentOnlineStatus !== isOnline) {
        console.log(`Detected network status change via polling: ${currentOnlineStatus ? 'Online' : 'Offline'}`);
        if (currentOnlineStatus) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    };
  }, [isOnline]);

  // Reset the wasOffline state after 15 seconds
  useEffect(() => {
    if (wasOffline && isOnline) {
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  return { 
    isOnline, 
    wasOffline,
    lastStatusChange 
  };
}
