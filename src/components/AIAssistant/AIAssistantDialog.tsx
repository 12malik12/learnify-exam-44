
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { subjects } from "@/utils/subjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateQuestions } from "@/utils/offlineQuestionGenerator";

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
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: t("ai.welcome") + " I can help with practice questions based on your curriculum. Select a subject and ask me a question or switch to Practice mode for practice exercises."
        }
      ]);
    }
  }, [open, messages.length, t]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: query }]);
    
    const userQuery = query;
    setQuery("");
    setLoading(true);
    
    try {
      if (mode === "practice") {
        // Generate a single practice question using our offline generator
        const subjectId = selectedSubject || subjects[0]?.id || "";
        const subject = subjects.find(s => s.id === subjectId);
        
        const result = generateQuestions({
          subject: subjectId,
          count: 1,
          unitObjective: userQuery
        });
        
        if (result.questions.length === 0) {
          throw new Error("Could not find a question matching your criteria. Please try a different topic.");
        }
        
        const question = result.questions[0];
        const responseContent = `
Here's a practice question about ${subject ? subject.name : "this topic"}:

**Question:** ${question.question_text}

A. ${question.option_a}
B. ${question.option_b}
C. ${question.option_c}
D. ${question.option_d}

The correct answer is **${question.correct_answer}**.

**Explanation:** ${question.explanation}

Would you like another practice question or would you like me to explain a concept in more detail?
        `;
        
        setMessages(prev => [...prev, { role: "assistant", content: responseContent }]);
      } else {
        // In a real app, this would use a more sophisticated offline response system
        // For now, we'll provide simple predefined responses
        const chatResponse = getOfflineChatResponse(userQuery, selectedSubject);
        setMessages(prev => [...prev, { role: "assistant", content: chatResponse }]);
      }
      
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate a response. Please try again."
      });
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I couldn't generate a response at this time. Please try again with a different question or topic." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Simple function to provide predefined responses for common questions
  // In a real app, this would be much more sophisticated
  const getOfflineChatResponse = (query: string, subjectId: string): string => {
    const lowerQuery = query.toLowerCase();
    const subject = subjects.find(s => s.id === subjectId);
    
    // Check for common question patterns
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      return "Hello! How can I help you with your studies today?";
    }
    
    if (lowerQuery.includes("how are you")) {
      return "I'm just a program, but I'm ready to help you with your academic questions!";
    }
    
    if (lowerQuery.includes("thanks") || lowerQuery.includes("thank you")) {
      return "You're welcome! Feel free to ask if you have more questions.";
    }
    
    // Subject-specific responses
    if (subject) {
      if (lowerQuery.includes("study tips") || lowerQuery.includes("how to study")) {
        return `For ${subject.name}, I recommend: 1) Break down complex topics into smaller parts, 2) Use flashcards for key terms, 3) Practice regularly with problems, and 4) Connect new information to what you already know.`;
      }
      
      if (lowerQuery.includes("difficult") || lowerQuery.includes("hard") || lowerQuery.includes("struggling")) {
        return `Many students find ${subject.name} challenging at first. Try to focus on understanding the fundamentals before moving to more complex topics. Consider forming a study group with classmates to discuss difficult concepts.`;
      }
    }
    
    // Default response
    return "I'm currently operating in offline mode with limited functionality. For specific academic questions, try using the Practice mode to test your knowledge with questions from our database.";
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
          </DialogTitle>
          <DialogDescription>
            {t("ai.description")}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(value) => setMode(value as "chat" | "practice")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center">
              <BrainCircuit className="mr-2 size-4" />
              Chat Assistant
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
                ? t("ai.prompt") 
                : "Ask for a practice question in your chosen subject"}
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
                        <span className="text-xs font-medium">Assistant</span>
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
              ? (selectedSubject 
                ? `Ask about ${getSubjectIcon(selectedSubject)} ${subjects.find(s => s.id === selectedSubject)?.name}...` 
                : t("ai.placeholder"))
              : "Enter a topic for a practice question..."
            }
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading}>
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
