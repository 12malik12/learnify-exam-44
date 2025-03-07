
import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, User, Bot, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIAssistant = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const aiResponses = [
        "I can help you study for your exams by creating practice questions based on your subjects.",
        "Would you like me to explain any particular concept from your curriculum?",
        "I can create a personalized study plan based on your strengths and weaknesses.",
        "Let me know if you need help with a specific subject or topic, and I'll provide detailed explanations.",
        "I can quiz you on topics you're struggling with to help reinforce your learning.",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  };

  const suggestionTopics = [
    "How do I solve quadratic equations?",
    "Explain photosynthesis in simple terms",
    "Help me understand Newton's laws of motion",
    "What are the key events of World War II?",
    "Can you explain the structure of an atom?"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container py-6 px-4 md:py-12 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="size-8 text-ethiopia-green" />
            <h1 className="text-3xl font-bold">{t("ai.title")}</h1>
          </div>

          <p className="text-muted-foreground mb-6 max-w-2xl">
            {t("ai.description")}
          </p>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="size-4" />
                {t("ai.tabs.chat")}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Sparkles className="size-4" />
                {t("ai.tabs.suggestions")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="w-full">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="bg-card rounded-lg min-h-[50vh] max-h-[60vh] overflow-y-auto">
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
                </CardContent>
              </Card>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("ai.placeholder")}
                  className="flex-1"
                />
                <Button type="submit" variant="ethiopia">
                  <Send className="size-4" />
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="suggestions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestionTopics.map((topic, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSuggestionClick(topic)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{topic}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t("ai.suggestion.click")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistant;
