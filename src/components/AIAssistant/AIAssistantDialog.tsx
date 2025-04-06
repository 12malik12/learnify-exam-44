import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, Sparkles, Loader2, Lightbulb, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { subjects } from "@/utils/subjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateUniqueQuestions } from "@/services/questionBankService";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIAssistantDialog = ({ open, onOpenChange }: AIAssistantDialogProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [mode, setMode] = useState<"chat" | "practice">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline, wasOffline } = useNetworkStatus();
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage = isOnline 
        ? t("ai.welcome") + " I'm designed to assist with challenging academic questions based on your curriculum. Select a subject and ask me a question or switch to Practice mode for challenging exercises."
        : "Welcome! You're currently in offline mode. I can provide practice questions from our stored question bank. Select a subject and try Practice mode for challenging exercises.";
      
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
          content: "Your internet connection has been restored! You can now access AI-generated content and fresh practice questions."
        }
      ]);
    } else if (!isOnline && messages.length > 1) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "You're currently offline. I'll use our locally stored question bank to help you with practice exercises."
        }
      ]);
    }
  }, [isOnline, wasOffline, messages.length]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: query }]);
    
    const userQuery = query;
    setQuery("");
    setLoading(true);
    
    try {
      if (mode === "practice") {
        const result = await generateUniqueQuestions(
          1, // Just one question for practice
          selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name || "" : "",
          userQuery,
          Date.now().toString()
        );
        
        if (!result.questions || result.questions.length === 0) {
          throw new Error(isOnline 
            ? "Could not generate a challenging question. Please try again with a different topic."
            : "No matching questions found in the offline question bank. Please try a different topic or connect to the internet for more questions."
          );
        }
        
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

${result.source === 'local' ? "*This question was retrieved from our offline question bank.*" : ""}

Would you like another challenging question or would you like me to explain a concept in more detail?
        `;
        
        setMessages(prev => [...prev, { role: "assistant", content: responseContent }]);
      } else {
        if (!isOnline) {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: "I'm sorry, but the chat feature requires an internet connection to work properly. Please connect to the internet to use this feature, or try using Practice mode which works offline with our stored question bank." 
          }]);
        } else {
          const result = await supabase.functions.invoke("ai-generate-questions", {
            body: {
              subject: selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name || "" : "",
              mode: "chat",
              query: userQuery,
              context: messages.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join("\n")
            }
          });
          
          if (result.error) {
            throw new Error(result.error.message);
          }
          
          if (result.data?.response) {
            setMessages(prev => [...prev, { role: "assistant", content: result.data.response }]);
          } else {
            throw new Error("Failed to generate a response.");
          }
        }
      }
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: isOnline
          ? "Failed to generate a response. Please try again."
          : "This feature requires an internet connection. Please connect to continue or try Practice mode."
      });
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: isOnline
          ? "I'm sorry, I couldn't generate a response at this time. Please try again with a different question or topic."
          : "You're currently offline. I can help with practice questions using our stored question bank, but chat features need an internet connection." 
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
          </DialogTitle>
          <DialogDescription>
            {isOnline ? t("ai.description") : "Offline mode active. Limited features available."}
          </DialogDescription>
        </DialogHeader>
        
        {wasOffline && isOnline && (
          <Alert className="mb-4">
            <AlertDescription>
              Your connection has been restored. Full AI features are now available.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={mode} onValueChange={(value) => setMode(value as "chat" | "practice")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center" disabled={!isOnline}>
              <BrainCircuit className="mr-2 size-4" />
              Chat Assistant {!isOnline && <WifiOff className="ml-1 size-3" />}
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center">
              <Lightbulb className="mr-2 size-4" />
              Practice Questions
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
                ? (isOnline ? t("ai.prompt") : "Chat requires an internet connection.") 
                : "Ask for a challenging practice question in your chosen subject"}
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
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center mb-1">
                        <Sparkles className="size-3 mr-1 text-ethiopia-green" />
                        <span className="text-xs font-medium">AI Assistant</span>
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
                  : t("ai.placeholder"))
                : "Chat unavailable offline")
              : "Enter a topic for a challenging practice question..."
            }
            className="flex-1"
            disabled={loading || (mode === "chat" && !isOnline)}
          />
          <Button type="submit" size="icon" disabled={loading || (mode === "chat" && !isOnline)}>
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
