
import React from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface AIAssistantButtonProps {
  onClick: () => void;
}

const AIAssistantButton = ({ onClick }: AIAssistantButtonProps) => {
  const { t } = useLanguage();
  
  return (
    <Button 
      onClick={onClick}
      className="fixed bottom-6 right-6 shadow-lg z-40 rounded-full h-14 w-14 p-0 flex items-center justify-center"
      variant="ethiopia"
    >
      <BrainCircuit className="size-6" />
      <span className="sr-only">{t("ai.open") || "Open AI Assistant"}</span>
    </Button>
  );
};

export default AIAssistantButton;
