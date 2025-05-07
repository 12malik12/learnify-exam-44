import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

import AIAssistant from "@/pages/AIAssistant";
import AIAssistantDialog from "@/components/AIAssistant/AIAssistantDialog";
import AIAssistantButton from "@/components/AIAssistant/AIAssistantButton";
import { useEffect, useState } from "react";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Subjects from "@/pages/Subjects";
import Exam from "@/pages/Exam";
import TeacherConnect from "@/pages/TeacherConnect";
import Performance from "@/pages/Performance";
import Admin from "@/pages/Admin";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    const currentPath = window.location.pathname;
    // Hide floating button on AI assistant page since it would be redundant
    setShowFloatingButton(currentPath !== "/ai-assistant");

    const handleRouteChange = () => {
      const path = window.location.pathname;
      setShowFloatingButton(path !== "/ai-assistant");
    };

    // Setup listener for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/teacher-connect" element={<TeacherConnect />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Routes>
        {showFloatingButton && (
          <AIAssistantButton onClick={() => setIsDialogOpen(true)} />
        )}
        <AIAssistantDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
        />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
