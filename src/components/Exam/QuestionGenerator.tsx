
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  questionCount?: number;
}

// Subject-specific difficulty descriptions
const DIFFICULTY_DESCRIPTIONS: Record<string, Record<string, string>> = {
  mathematics: {
    easy: "Direct recall of mathematical formulas and simple calculations",
    medium: "Application of concepts to solve mathematical problems",
    hard: "Complex, multi-step problems requiring advanced mathematical reasoning"
  },
  physics: {
    easy: "Basic physics laws and simple problem-solving",
    medium: "Application of physics formulas in different contexts",
    hard: "Complex physics scenarios requiring multiple concepts and formulas"
  },
  chemistry: {
    easy: "Basic chemical concepts, formulas, and properties",
    medium: "Chemical reactions, balancing equations, and mid-level applications",
    hard: "Complex reaction mechanisms, multistep synthesis, and advanced concepts"
  },
  biology: {
    easy: "Recall of biological terms, structures, and basic processes",
    medium: "Understanding biological mechanisms and ecosystem relationships",
    hard: "Complex biological processes and integrating different systems"
  },
  english: {
    easy: "Basic grammar, vocabulary, and simple text comprehension",
    medium: "Literary analysis, interpretation, and contextual meaning",
    hard: "Complex literary criticism, advanced rhetorical analysis, and composition"
  },
  history: {
    easy: "Historical facts, dates, events, and key figures",
    medium: "Connecting historical events and understanding cause-effect relationships",
    hard: "Historical analysis, evaluating multiple perspectives, and historiography"
  },
  geography: {
    easy: "Basic geographical features, locations, and terminology",
    medium: "Understanding geographical patterns, relationships, and processes",
    hard: "Complex geographical analysis, interdependent systems, and global impacts"
  },
  default: {
    easy: "Direct recall or basic conceptual questions",
    medium: "Application-based or slightly tricky problems",
    hard: "Complex, multi-step problem-solving questions"
  }
};

const QuestionGenerator = ({ 
  open, 
  onOpenChange,
  onQuestionsGenerated,
  questionCount = 10
}: QuestionGeneratorProps) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [unitObjective, setUnitObjective] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [unitObjectives, setUnitObjectives] = useState<UnitObjective[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Get the selected subject object
  const selectedSubject = subjects.find(s => s.id === subject);
  
  // Get the subject key for difficulty descriptions - use the subject ID or default
  const subjectKey = selectedSubject?.id || "default";
  
  // Get the difficulty descriptions for the selected subject
  const difficultyDescriptions = DIFFICULTY_DESCRIPTIONS[subjectKey] || DIFFICULTY_DESCRIPTIONS.default;
  
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
          count: questionCount
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
            <RadioGroup
              value={difficulty}
              onValueChange={setDifficulty}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-start space-x-2 rounded-md border p-3">
                <RadioGroupItem value="easy" id="easy" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="easy" className="font-medium cursor-pointer">
                    Easy
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {difficultyDescriptions.easy}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 rounded-md border p-3">
                <RadioGroupItem value="medium" id="medium" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="medium" className="font-medium cursor-pointer">
                    Medium
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {difficultyDescriptions.medium}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 rounded-md border p-3">
                <RadioGroupItem value="hard" id="hard" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="hard" className="font-medium cursor-pointer">
                    Hard
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {difficultyDescriptions.hard}
                  </p>
                </div>
              </div>
            </RadioGroup>
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
