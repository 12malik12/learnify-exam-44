
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated AI response for demonstration purposes. In a real application, this would be powered by an actual AI service that can help with your studies.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container py-6 px-4 md:py-12 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="size-6 text-ethiopia-green" />
            <h1 className="text-2xl font-bold">{t("ai.title")}</h1>
          </div>

          <p className="text-muted-foreground mb-6">
            {t("ai.description")}
          </p>

          <Separator className="my-6" />

          <div className="bg-card rounded-lg border shadow-sm p-4 mb-6 min-h-[50vh] max-h-[60vh] overflow-y-auto">
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
          </div>

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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistant;
