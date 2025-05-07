import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Subjects from "./pages/Subjects";
import Auth from "./pages/Auth";
import Exam from "./pages/Exam";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/Mobile/SplashScreen";
import Performance from "./pages/Performance";
import AIAssistant from "./pages/AIAssistant";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, Database } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import SubjectResources from "./pages/SubjectResources";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import Unauthorized from "./pages/Unauthorized";
import Admin from "./pages/Admin";
import { useDatabaseHelpers } from "./hooks/use-database-helpers";
import { Button } from "./components/ui/button";
import { useAuth } from "./context/AuthContext";
import TeacherConnect from "./pages/TeacherConnect";

// Custom error handler function
const errorHandler = (error: Error) => {
  console.error('Query error:', error);
};

// Configure the query client to handle offline mode and improve retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry network errors when offline
        if (error?.message?.includes('network') && !navigator.onLine) {
          return false;
        }
        return failureCount < 3;  // Increase max retries
      },
      // Cache data for longer when offline
      staleTime: navigator.onLine ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min online, 1 hour offline
      gcTime: navigator.onLine ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000, // 10 min online, 24 hours offline
      // Handle failure through meta configuration
      meta: {
        errorHandler: errorHandler
      }
    },
    mutations: {
      retry: 2,  // Add retries for mutations 
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

const BackButtonHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleBackButton = () => {
      navigate(-1);
      return true;
    };
    
    document.addEventListener('backbutton', handleBackButton);
    return () => {
      document.removeEventListener('backbutton', handleBackButton);
    };
  }, [navigate]);
  
  return null;
};

const NetworkStatusBanner = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else if (wasOffline) {
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);
  
  if (!showBanner) return null;
  
  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4">
      <Alert variant={isOnline ? "default" : "destructive"} className="shadow-md">
        <AlertDescription className="flex items-center justify-center">
          {isOnline ? (
            <>
              <Wifi className="mr-2 size-4 text-green-500" />
              Connection restored. Full features are now available.
            </>
          ) : (
            <>
              <WifiOff className="mr-2 size-4" />
              You're offline. AI features require an internet connection.
            </>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Helper functions setup component
const DatabaseHelperSetup = () => {
  const { user } = useAuth();
  const { isDeploying, deployHelperFunctions } = useDatabaseHelpers();
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        size="sm" 
        variant="outline"
        onClick={deployHelperFunctions}
        disabled={isDeploying}
        className="bg-white/80 backdrop-blur-sm shadow-md"
      >
        <Database className="mr-2 h-4 w-4" />
        {isDeploying ? 'Deploying...' : 'Setup Database Helpers'}
      </Button>
    </div>
  );
};

// Wrap the app content in a function component to ensure React context is available
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    const handleOnlineStatus = () => {
      console.log(`Network status changed: ${navigator.onLine ? 'Online' : 'Offline'}`);
      
      // Force query client to refetch when coming back online
      if (navigator.onLine) {
        queryClient.invalidateQueries();
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <BrowserRouter>
          <BackButtonHandler />
          <NetworkStatusBanner />
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/subjects/:subjectId" element={<Subjects />} />
              <Route path="/subjects/:subjectId/resources" element={<SubjectResources />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/teacher-connect" element={<TeacherConnect />} />
            </Route>
            
            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DatabaseHelperSetup />
        </BrowserRouter>
      )}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </LanguageProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
