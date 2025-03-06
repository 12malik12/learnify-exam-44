
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

const queryClient = new QueryClient();

// Handle hardware back button for mobile
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

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  
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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
