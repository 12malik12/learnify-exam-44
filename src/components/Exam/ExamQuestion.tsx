import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Enhanced MathJax for LaTeX rendering with more comprehensive replacement patterns
const renderMathContent = (text: string) => {
  if (!text) return "";

  // Enhanced LaTeX rendering - in a real app, you would integrate a proper LaTeX library
  return text
  // Basic inline math expressions
  .replace(/\$(.+?)\$/g, '<span class="math-formula">$1</span>')
  // Fractions
  .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '<span class="math-fraction">$1/$2</span>')
  // Square roots
  .replace(/\\sqrt\{([^}]*)\}/g, '<span class="math-sqrt">√($1)</span>')
  // Plain text within math
  .replace(/\\text\{([^}]*)\}/g, '$1')
  // Superscripts
  .replace(/\^(\d+|{[^}]*})/g, '<sup>$1</sup>'.replace(/{|}/g, ''))
  // Subscripts
  .replace(/\_(\d+|{[^}]*})/g, '<sub>$1</sub>'.replace(/{|}/g, ''))
  // Common math symbols
  .replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\pm/g, '±').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥').replace(/\\neq/g, '≠').replace(/\\approx/g, '≈').replace(/\\infty/g, '∞').replace(/\\partial/g, '∂').replace(/\\nabla/g, '∇').replace(/\\ldots/g, '...').replace(/\\cdot/g, '·').replace(/\\circ/g, '°').replace(/\\gt\b/g, '>').replace(/\\lt\b/g, '<');
};
interface ExamQuestionProps {
  question: {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer?: string;
    explanation?: string;
    difficulty_level?: number;
    subject?: string;
    isAIGenerated?: boolean;
  };
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showCorrectAnswer?: boolean;
  questionNumber: number;
  source?: 'ai' | 'local';
}
const ExamQuestion = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer = false,
  questionNumber,
  source
}: ExamQuestionProps) => {
  // Parse LaTeX in question and options
  const questionHtml = {
    __html: renderMathContent(question.question_text)
  };
  const optionAHtml = {
    __html: renderMathContent(question.option_a)
  };
  const optionBHtml = {
    __html: renderMathContent(question.option_b)
  };
  const optionCHtml = {
    __html: renderMathContent(question.option_c)
  };
  const optionDHtml = {
    __html: renderMathContent(question.option_d)
  };
  const explanationHtml = question.explanation ? {
    __html: renderMathContent(question.explanation)
  } : null;
  const isCorrect = (option: string) => {
    if (!showCorrectAnswer) return false;
    return option === question.correct_answer;
  };
  const isIncorrect = (option: string) => {
    if (!showCorrectAnswer) return false;
    return selectedAnswer === option && option !== question.correct_answer;
  };
  return <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {questionNumber}
            </span>
            <div className="text-lg font-medium flex-1">
              {question.subject && <span className="inline-block mr-2 text-sm font-medium text-muted-foreground">
                  {question.subject}
                </span>}
              {question.difficulty_level}
              <div className="mt-1" dangerouslySetInnerHTML={questionHtml} />
            </div>
          </div>
        </div>
        
        <RadioGroup value={selectedAnswer || ""} onValueChange={onSelectAnswer} className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option, index) => {
          const optionText = {
            A: optionAHtml,
            B: optionBHtml,
            C: optionCHtml,
            D: optionDHtml
          }[option];
          return <div key={option} className={cn("flex items-start space-x-2 rounded-md border p-3", isCorrect(option) && "border-green-500 bg-green-50 dark:bg-green-950/30", isIncorrect(option) && "border-red-500 bg-red-50 dark:bg-red-950/30")}>
                <RadioGroupItem value={option} id={`option-${question.id}-${option}`} />
                <Label htmlFor={`option-${question.id}-${option}`} className="flex grow cursor-pointer items-center gap-2 font-normal">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border">
                    {option}
                  </span>
                  <span dangerouslySetInnerHTML={optionText} className="flex-1" />
                </Label>
              </div>;
        })}
        </RadioGroup>
        
        {showCorrectAnswer && explanationHtml && <div className="mt-4 p-3 bg-secondary/20 rounded-md">
            <div className="font-semibold mb-1">Explanation:</div>
            <div className="text-sm" dangerouslySetInnerHTML={explanationHtml} />
            {selectedAnswer && !isCorrect(selectedAnswer) && <div className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                You selected option {selectedAnswer}, but the correct answer is option {question.correct_answer}.
              </div>}
            {selectedAnswer && isCorrect(selectedAnswer) && <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                Correct! You selected the right answer.
              </div>}
          </div>}
        
        {source && <div className="mt-3 text-xs text-muted-foreground text-right">
            Source: {source === 'ai' ? 'AI-Generated' : 'Question Bank'}
          </div>}
      </CardContent>
    </Card>;
};
export default ExamQuestion;