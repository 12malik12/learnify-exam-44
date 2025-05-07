
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, User, Loader2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "loading" | "error" | "success";
}

const AIAssistant = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Welcome to your AI assistant powered by Groq! How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Test Groq API connection on component mount
  useEffect(() => {
    if (!initialized) {
      testGroqConnection();
      setInitialized(true);
    }
  }, [initialized]);

  const testGroqConnection = async () => {
    try {
      const testResponse = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          mode: "chat",
          query: "Quick test of system functionality",
          testCall: true
        }
      });
      
      if (testResponse.error) {
        console.error("Test connection error:", testResponse.error);
        toast({
          variant: "destructive",
          title: "AI System Connection Issue",
          description: "There was a problem connecting to the AI service. Some features may be limited."
        });
      } else {
        console.log("Groq API connection successful");
      }
    } catch (error) {
      console.error("Error testing Groq connection:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    setLoading(true);

    // Add temporary loading message
    const loadingMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev, 
      {
        id: loadingMsgId,
        content: "Processing your question with Groq...",
        sender: "ai",
        timestamp: new Date(),
        status: "loading"
      }
    ]);

    try {
      // Call the Groq-powered edge function
      const response = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          mode: "chat",
          query: userMessage.content,
          context: messages.slice(-5).map(msg => `${msg.sender}: ${msg.content}`).join("\n"),
          userId: user?.id || null
        }
      });

      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== loadingMsgId));

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.response) {
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: response.data.response,
          sender: "ai",
          timestamp: new Date(),
          status: "success"
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Failed to generate a response");
      }
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== loadingMsgId));
      
      console.error("Error in AI response:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        variant: "destructive",
        title: "AI Response Error",
        description: "Could not generate a response. Please try again later."
      });

      const aiErrorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `I'm sorry, I encountered an error while processing your request. ${errorMsg}`,
        sender: "ai",
        timestamp: new Date(),
        status: "error"
      };
      
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container py-6 px-4 md:py-12 md:px-6 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="size-6 text-ethiopia-green" />
            <h1 className="text-2xl font-bold">{t("ai.title")}</h1>
          </div>

          <p className="text-muted-foreground mb-6">
            Ask questions about your studies, get help with challenging concepts, or generate practice problems - powered by Groq AI.
          </p>

          <Separator className="my-6" />

          <div 
            id="message-container"
            className="bg-card rounded-lg border shadow-sm p-4 mb-6 min-h-[50vh] max-h-[60vh] overflow-y-auto"
          >
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`mb-4 ${message.sender === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}`}
              >
                <div className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${message.sender === "user" ? "bg-primary" : "bg-muted"}`}>
                    {message.sender === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : message.status === "loading" ? (
                      <Loader2 className="h-4 w-4 text-foreground animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-ethiopia-green" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-3 text-sm ${
                    message.sender === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : message.status === "error"
                        ? "bg-muted border border-destructive/20"
                        : "bg-muted"
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" variant="ethiopia" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistant;
