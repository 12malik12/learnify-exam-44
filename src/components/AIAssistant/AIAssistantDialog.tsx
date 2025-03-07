
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, User } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIAssistantDialog = ({ open, onOpenChange }: AIAssistantDialogProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: t("ai.prompt"),
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsTyping(true);

    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "For a more comprehensive experience, please use the full AI Assistant page.",
        sender: "ai",
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-ethiopia-green" />
            {t("ai.title")}
          </DialogTitle>
          <DialogDescription>
            {t("ai.description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto my-4 p-4 bg-secondary/20 rounded-md min-h-[200px]">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 ${message.sender === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}`}
            >
              <div className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${message.sender === "user" ? "bg-primary" : "bg-muted"}`}>
                  {message.sender === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <BrainCircuit className="h-4 w-4 text-foreground" />
                  )}
                </div>
                <div className={`rounded-lg px-4 py-3 text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-4 mr-auto max-w-[80%]">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
                  <BrainCircuit className="h-4 w-4 text-foreground" />
                </div>
                <div className="rounded-lg px-4 py-3 text-sm bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ai.placeholder")}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="size-4" />
            </Button>
          </form>
          
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to="/ai-assistant" onClick={() => onOpenChange(false)}>
              {t("ai.tabs.chat")}
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
