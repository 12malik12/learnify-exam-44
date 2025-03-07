
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit } from "lucide-react";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIAssistantDialog = ({ open, onOpenChange }: AIAssistantDialogProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = React.useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the query to an AI endpoint
    console.log("AI query:", query);
    setQuery("");
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
          {/* AI conversation would appear here */}
          <div className="text-center text-muted-foreground">
            {t("ai.prompt")}
          </div>
        </div>
        
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
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
