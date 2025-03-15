
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { subjects } from "@/utils/subjects";
import { supabase } from "@/integrations/supabase/client";

interface UnitObjective {
  id: string;
  title: string;
  description: string;
}

interface QuestionGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsGenerated: (questions: any[]) => void;
}

const QuestionGenerator = ({ 
  open, 
  onOpenChange,
  onQuestionsGenerated 
}: QuestionGeneratorProps) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [unitObjective, setUnitObjective] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState([5]);
  const [unitObjectives, setUnitObjectives] = useState<UnitObjective[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Mock unit objectives - in a real app, these would come from the database
  React.useEffect(() => {
    if (subject) {
      // Mock unit objectives for demonstration
      const mockObjectives = [
        { id: "obj1", title: "Basic Concepts", description: "Understanding fundamental principles" },
        { id: "obj2", title: "Advanced Applications", description: "Applying concepts to complex scenarios" },
        { id: "obj3", title: "Problem Solving", description: "Using critical thinking to solve problems" },
      ];
      
      setUnitObjectives(mockObjectives);
      setUnitObjective(""); // Reset unit selection
    }
  }, [subject]);
  
  const handleGenerateQuestions = async () => {
    if (!subject || !unitObjective || !difficulty) {
      toast({
        title: "Missing Information",
        description: "Please select a subject, unit objective, and difficulty level.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const selectedSubject = subjects.find(s => s.id === subject);
      const selectedObjective = unitObjectives.find(u => u.id === unitObjective);
      
      if (!selectedSubject || !selectedObjective) {
        throw new Error("Invalid subject or unit objective");
      }
      
      // Call the Supabase Edge Function to generate questions
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          subject: selectedSubject.name,
          unitObjective: selectedObjective.description,
          difficulty: difficulty,
          count: questionCount[0]
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Provide the generated questions to the parent component
      onQuestionsGenerated(data.questions);
      
      toast({
        title: "Questions Generated",
        description: `Successfully generated ${data.questions.length} ${difficulty} questions for ${selectedSubject.name}.`
      });
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Exam Questions</DialogTitle>
          <DialogDescription>
            Create custom questions based on subject, unit objective, and difficulty.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={subject}
              onValueChange={setSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit Objective</Label>
            <Select
              value={unitObjective}
              onValueChange={setUnitObjective}
              disabled={!subject || unitObjectives.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={!subject ? "Select a subject first" : "Select a unit objective"} />
              </SelectTrigger>
              <SelectContent>
                {unitObjectives.map((objective) => (
                  <SelectItem key={objective.id} value={objective.id}>
                    {objective.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={difficulty}
              onValueChange={setDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="count">Number of Questions: {questionCount[0]}</Label>
            </div>
            <Slider
              id="count"
              min={1}
              max={20}
              step={1}
              value={questionCount}
              onValueChange={setQuestionCount}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleGenerateQuestions} disabled={loading}>
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionGenerator;
