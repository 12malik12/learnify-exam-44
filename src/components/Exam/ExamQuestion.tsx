
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Use MathJax for LaTeX rendering
const renderMathContent = (text: string) => {
  if (!text) return "";
  
  // This is a simple placeholder - in a real app, you would use a LaTeX rendering library
  // like KaTeX or MathJax. For now, we'll just identify LaTeX content and add a class to it.
  return text.replace(/\$(.+?)\$/g, '<span class="math-formula">$1</span>');
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
  };
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showCorrectAnswer?: boolean;
  questionNumber: number;
}

const ExamQuestion = ({ 
  question, 
  selectedAnswer, 
  onSelectAnswer,
  showCorrectAnswer = false,
  questionNumber
}: ExamQuestionProps) => {
  // Parse LaTeX in question and options
  const questionHtml = { __html: renderMathContent(question.question_text) };
  const optionAHtml = { __html: renderMathContent(question.option_a) };
  const optionBHtml = { __html: renderMathContent(question.option_b) };
  const optionCHtml = { __html: renderMathContent(question.option_c) };
  const optionDHtml = { __html: renderMathContent(question.option_d) };
  const explanationHtml = question.explanation 
    ? { __html: renderMathContent(question.explanation) } 
    : null;
  
  const isCorrect = (option: string) => {
    if (!showCorrectAnswer) return false;
    return option === question.correct_answer;
  };
  
  const isIncorrect = (option: string) => {
    if (!showCorrectAnswer) return false;
    return selectedAnswer === option && option !== question.correct_answer;
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {questionNumber}
            </span>
            <div 
              className="text-lg font-medium flex-1" 
              dangerouslySetInnerHTML={questionHtml}
            />
          </div>
        </div>
        
        <RadioGroup 
          value={selectedAnswer || ""} 
          onValueChange={onSelectAnswer}
          className="space-y-3"
        >
          {['A', 'B', 'C', 'D'].map((option, index) => {
            const optionText = { 
              A: optionAHtml, 
              B: optionBHtml, 
              C: optionCHtml, 
              D: optionDHtml 
            }[option];
            
            return (
              <div 
                key={option} 
                className={cn(
                  "flex items-start space-x-2 rounded-md border p-3",
                  isCorrect(option) && "border-green-500 bg-green-50",
                  isIncorrect(option) && "border-red-500 bg-red-50"
                )}
              >
                <RadioGroupItem value={option} id={`option-${question.id}-${option}`} />
                <Label 
                  htmlFor={`option-${question.id}-${option}`}
                  className="flex grow cursor-pointer items-center gap-2 font-normal"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border">
                    {option}
                  </span>
                  <span dangerouslySetInnerHTML={optionText} className="flex-1" />
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        
        {showCorrectAnswer && explanationHtml && (
          <div className="mt-4 p-3 bg-secondary/20 rounded-md">
            <div className="font-semibold mb-1">Explanation:</div>
            <div dangerouslySetInnerHTML={explanationHtml} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamQuestion;
