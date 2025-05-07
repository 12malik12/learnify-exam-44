
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, Sparkles, Loader2, Lightbulb, Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { subjects } from "@/utils/subjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateUniqueQuestions } from "@/services/questionBankService";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  status?: "loading" | "error" | "success";
}

const AIAssistantDialog = ({ open, onOpenChange }: AIAssistantDialogProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [mode, setMode] = useState<"chat" | "practice">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline, wasOffline } = useNetworkStatus();
  const [apiStatus, setApiStatus] = useState<"untested" | "working" | "failing">("untested");
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage = isOnline 
        ? `${t("ai.welcome")} I'm powered by Groq AI and designed to assist with challenging academic questions based on your curriculum. Select a subject and ask me a question or switch to Practice mode for challenging exercises.`
        : "Welcome! You're currently in offline mode. I won't be able to assist you fully. Please connect to the internet to use all features.";
      
      setMessages([
        {
          role: "assistant",
          content: welcomeMessage
        }
      ]);
    }
  }, [open, messages.length, t, isOnline]);
  
  useEffect(() => {
    if (wasOffline && isOnline && messages.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Your internet connection has been restored! You can now access AI-generated content and practice questions."
        }
      ]);
      
      testAIConnection();
    } else if (!isOnline && messages.length > 1) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "You're currently offline. I need an internet connection to generate responses. Please connect to continue."
        }
      ]);
    }
  }, [isOnline, wasOffline, messages.length]);
  
  const testAIConnection = async () => {
    if (!isOnline) {
      setApiStatus("failing");
      console.log("AI connection test failed: Device is offline");
      return;
    }
    
    try {
      console.log("Testing AI connection...");
      setApiStatus("untested"); // Reset to untested while we're running the test
      
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      const testResult = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          subject: "Mathematics",
          count: 1,
          mode: "question",
          forceFallback: false,
          forceAI: true,
          testCall: true,
          timestamp
        }
      });
      
      console.log("AI test response:", testResult);
      
      if (testResult.error) {
        console.error("AI connection test failed:", testResult.error);
        setApiStatus("failing");
        return;
      }
      
      // Detailed validation of the response
      if (!testResult.data) {
        console.error("AI test returned no data");
        setApiStatus("failing");
        return;
      }
      
      if (!testResult.data.questions || testResult.data.questions.length === 0) {
        console.error("AI test returned no questions");
        setApiStatus("failing");
        return;
      }
      
      const question = testResult.data.questions[0];
      
      // Validate the question format
      const isValidFormat = 
        question.question_text && 
        question.option_a && 
        question.option_b && 
        question.option_c && 
        question.option_d && 
        question.correct_answer;
        
      if (!isValidFormat) {
        console.error("AI test returned a malformed question:", question);
        setApiStatus("failing");
        return;
      }
      
      if (testResult.data.source === 'ai') {
        console.log("AI connection test passed - AI source confirmed");
        setApiStatus("working");
      } else {
        console.warn("AI connection test yielded non-AI questions");
        setApiStatus("failing");
      }
    } catch (error) {
      console.error("Error testing AI connection:", error);
      setApiStatus("failing");
    }
  };
  
  useEffect(() => {
    if (isOnline && open && apiStatus === "untested") {
      testAIConnection();
    }
  }, [isOnline, open, apiStatus]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: "Offline Mode",
        description: "Internet connection required to use the AI assistant."
      });
      return;
    }
    
    setMessages(prev => [...prev, { role: "user", content: query }]);
    
    const userQuery = query;
    setQuery("");
    setLoading(true);
    
    try {
      if (mode === "practice") {
        // Show processing message
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Generating a challenging question about ${selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : "your topic"}...`,
          status: "loading"
        }]);
        
        try {
          const result = await generateUniqueQuestions(
            1, // Just one question for practice
            selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name || "" : "",
            userQuery,
            Date.now().toString()
          );
          
          // Remove the processing message
          setMessages(prev => prev.slice(0, -1));
          
          // Update AI status based on response
          setApiStatus(result.source === 'ai' ? "working" : "failing");
          
          const question = result.questions[0];
          
          const responseContent = `
Here's a challenging question about ${selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : "this topic"}:

**Question:** ${question.question_text}

A. ${question.option_a}
B. ${question.option_b}
C. ${question.option_c}
D. ${question.option_d}

The correct answer is **${question.correct_answer}**.

**Explanation:** ${question.explanation || "No detailed explanation available for this question."}

*This question was generated by our AI powered by Groq.*

Would you like another challenging question or would you like me to explain a concept in more detail?
          `;
          
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: responseContent,
            status: "success"
          }]);
        } catch (error) {
          // Remove the processing message
          setMessages(prev => prev.slice(0, -1));
          
          console.error("Error in practice mode:", error);
          setApiStatus("failing");
          
          const errorMessage = error instanceof Error ? error.message : "Failed to generate AI question";
          
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: `I'm sorry, I couldn't generate a question at this time. ${errorMessage}`,
            status: "error"
          }]);
          
          toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: errorMessage
          });
        }
      } else {
        // Chat mode
        // Show processing message
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Processing your question with Groq LLM...",
          status: "loading"
        }]);
        
        try {
          const result = await supabase.functions.invoke("ai-generate-questions", {
            body: {
              subject: selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name || "" : "",
              mode: "chat",
              query: userQuery,
              context: messages.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join("\n"),
              forceFallback: false,
              forceAI: true,
              userId: user?.id || null
            }
          });
          
          console.log("Chat AI response:", result);
          
          // Remove the processing message
          setMessages(prev => prev.slice(0, -1));
          
          if (result.error) {
            throw new Error(result.error.message);
          }
          
          // Update AI status based on the response
          if (result.data?.error || result.data?.source !== 'ai') {
            console.error("Chat resulted in error or non-AI response:", result.data);
            setApiStatus("failing");
            throw new Error(result.data?.error || "Response was not generated by AI");
          } else {
            setApiStatus("working");
          }
          
          if (result.data?.response) {
            setMessages(prev => [...prev, { 
              role: "assistant", 
              content: result.data.response,
              status: "success"
            }]);
          } else {
            throw new Error("Failed to generate a response.");
          }
        } catch (error) {
          // Remove the processing message
          setMessages(prev => prev.slice(0, -1));
          
          console.error("Error in chat mode:", error);
          setApiStatus("failing");
          
          const errorMessage = error instanceof Error ? error.message : "Failed to generate AI response";
          
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: `I'm sorry, I couldn't generate a response at this time. ${errorMessage}`,
            status: "error"
          }]);
          
          toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: errorMessage
          });
        }
      }
    } catch (error) {
      console.error("General error in AI assistant:", error);
      
      // Remove any processing message if it exists
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === "assistant" && 
            (lastMessage.content === "Processing your question..." || 
             lastMessage.content.includes("Generating a challenging question"))) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      
      // Update API status on error
      setApiStatus("failing");
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate a response: ${errorMessage}`
      });
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `I'm sorry, I couldn't generate a response at this time. ${errorMessage}`,
        status: "error"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.icon : "📚";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-ethiopia-green" />
            {t("ai.title")}
            {!isOnline && <WifiOff className="ml-2 size-4 text-amber-500" aria-label="Offline Mode" />}
            {isOnline && apiStatus === "failing" && 
              <AlertTriangle className="ml-2 size-4 text-amber-500" aria-label="AI Service Issues" />}
            {isOnline && apiStatus === "working" && 
              <CheckCircle className="ml-2 size-4 text-green-500" aria-label="AI Service Working" />}
          </DialogTitle>
          <DialogDescription>
            {!isOnline 
              ? "Offline mode active. Internet connection required for AI features." 
              : apiStatus === "failing"
                ? "AI service has issues. Some features may not work properly."
                : "Powered by Groq for enhanced speed and performance."}
          </DialogDescription>
        </DialogHeader>
        
        {wasOffline && isOnline && (
          <Alert className="mb-4">
            <AlertDescription>
              Your connection has been restored. Full AI features are now available.
            </AlertDescription>
          </Alert>
        )}
        
        {isOnline && apiStatus === "failing" && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center">
              <AlertTriangle className="mr-2 size-4" />
              The AI service is experiencing issues. Some features may not work properly.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={mode} onValueChange={(value) => setMode(value as "chat" | "practice")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center" disabled={!isOnline}>
              <BrainCircuit className="mr-2 size-4" />
              Chat Assistant {!isOnline && <WifiOff className="ml-1 size-3" />}
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center" disabled={!isOnline}>
              <Lightbulb className="mr-2 size-4" />
              Practice Questions {!isOnline && <WifiOff className="ml-1 size-3" />}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mb-4">
          <Label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Select a Subject
          </Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a subject for better answers" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <span className="flex items-center">
                    <span className="mr-2">{subject.icon}</span>
                    {subject.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 overflow-y-auto my-4 p-4 bg-secondary/20 rounded-md min-h-[200px]">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              {mode === "chat" 
                ? (isOnline ? "Ask me anything about your subjects! I'm powered by Groq AI for fast, accurate responses." : "Chat requires an internet connection.") 
                : (isOnline ? "Ask for a challenging practice question in your chosen subject" : "Practice questions require an internet connection.")}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : msg.status === 'error' 
                          ? 'bg-muted border border-destructive/20' 
                          : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center mb-1">
                        {msg.status === 'loading' ? (
                          <Loader2 className="size-3 mr-1 text-muted-foreground animate-spin" />
                        ) : msg.status === 'error' ? (
                          <AlertTriangle className="size-3 mr-1 text-destructive" />
                        ) : (
                          <Sparkles className="size-3 mr-1 text-ethiopia-green" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.status === 'loading' ? 'Processing...' : 'Groq AI'}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "chat"
              ? (isOnline
                ? (selectedSubject 
                  ? `Ask about ${getSubjectIcon(selectedSubject)} ${subjects.find(s => s.id === selectedSubject)?.name}...` 
                  : "Ask me anything, powered by Groq AI...")
                : "Internet connection required for AI features")
              : (isOnline 
                ? "Enter a topic for a challenging practice question..." 
                : "Internet connection required for AI features")}
            className="flex-1"
            disabled={loading || !isOnline}
          />
          <Button type="submit" size="icon" disabled={loading || !isOnline}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
