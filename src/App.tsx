
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Subjects from "./pages/Subjects";
import Exam from "./pages/Exam";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/Mobile/SplashScreen";
import Performance from "./pages/Performance";
import AIAssistant from "./pages/AIAssistant";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";

// Custom error handler function
const errorHandler = (error: Error) => {
  console.error('Query error:', error);
};

// Configure the query client to handle offline mode
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry network errors when offline
        if (error?.message?.includes('network') && !navigator.onLine) {
          return false;
        }
        return failureCount < 2;
      },
      // Cache data for longer when offline
      staleTime: navigator.onLine ? 5 * 60 * 1000 : 60 * 60 * 1000, // 5 min online, 1 hour offline
      gcTime: navigator.onLine ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000, // 10 min online, 24 hours offline
      // Handle failure through meta configuration
      meta: {
        errorHandler: errorHandler
      }
    },
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

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Initialize the question bank service
  useEffect(() => {
    // Import must be done inside useEffect to avoid issues with SSR
    const initializeQuestionBank = async () => {
      const { seedInitialQuestions } = await import('./services/questionBankService');
      seedInitialQuestions();
    };
    initializeQuestionBank();
  }, []);
  
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <BackButtonHandler />
              <NetworkStatusBanner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
