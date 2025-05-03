
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, BookOpen, Book, Brain, BarChart, CheckCircle, XCircle, Calendar, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ExamQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  student_answer?: string;
}

interface ExamAnalysisProps {
  examQuestions: ExamQuestion[];
  studentAnswers: Record<string, string>;
  analysis: string | null;
  isLoading: boolean;
  onReviewQuestions: () => void;
  onNewExam: () => void;
}

const ExamAnalysis = ({ 
  examQuestions, 
  studentAnswers, 
  analysis, 
  isLoading, 
  onReviewQuestions, 
  onNewExam 
}: ExamAnalysisProps) => {
  // Calculate basic stats
  const totalQuestions = examQuestions.length;
  let correctAnswers = 0;
  const incorrectQuestions: ExamQuestion[] = [];
  
  examQuestions.forEach(question => {
    if (studentAnswers[question.id] === question.correct_answer) {
      correctAnswers++;
    } else {
      incorrectQuestions.push(question);
    }
  });
  
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // We'll now display the analysis as a more personalized, unified view
  // rather than splitting it into arbitrary sections
  
  // Helper to create a performance descriptor based on score
  const getPerformanceDescriptor = () => {
    if (score >= 90) return "excellent";
    if (score >= 80) return "very good";
    if (score >= 70) return "good";
    if (score >= 60) return "satisfactory";
    if (score >= 50) return "fair";
    return "needs improvement";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exam Analysis</h2>
        <Badge 
          variant={score < 50 ? "destructive" : "default"} 
          className={cn("px-3 py-1 text-base", 
            score >= 70 && "bg-green-500 hover:bg-green-600",
            score >= 50 && score < 70 && "bg-amber-500 hover:bg-amber-600"
          )}
        >
          Score: {score}%
        </Badge>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5" /> Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                <span className="text-sm text-muted-foreground">Performance Level</span>
                <span className="font-medium text-lg capitalize">{getPerformanceDescriptor()}</span>
              </div>
              <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                <span className="text-sm text-muted-foreground">Questions</span>
                <span className="font-medium text-lg">{correctAnswers} correct of {totalQuestions} total</span>
              </div>
            </div>
            
            {analysis ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-line">
                  {/* Render the analysis as paragraphs with proper spacing */}
                  {analysis.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>
                  Your score of {score}% ({correctAnswers} out of {totalQuestions} questions correct) shows a {getPerformanceDescriptor()} understanding of the material.
                </p>
                
                {incorrectQuestions.length > 0 ? (
                  <>
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 mb-4">
                      <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">Focus on these areas</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        You missed {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''}.
                        Try reviewing these topics again.
                      </p>
                    </div>
                    
                    <p>Based on your answers, it would be beneficial to focus on improving your understanding of the concepts related to the questions you missed. Try revisiting these topics in your study materials and practice additional problems.</p>
                  </>
                ) : (
                  <p>Great job! You've demonstrated strong understanding across all topics covered in this exam. Keep up the excellent work!</p>
                )}
                
                <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3 mb-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Study suggestions</h4>
                  <ul className="list-disc text-sm text-blue-800 dark:text-blue-300 ml-4 space-y-1">
                    <li>Review your incorrect answers carefully to understand where you went wrong</li>
                    <li>Try solving similar problems to reinforce your understanding</li>
                    <li>Consider creating flashcards for key concepts you struggled with</li>
                  </ul>
                </div>
                
                <p>Remember that learning is a journey. Each exam is an opportunity to identify areas for growth. With focused practice on the topics you found challenging, you'll continue to improve your understanding and performance.</p>
              </div>
            )}
            
            {/* Topic breakdown */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Question Topic Breakdown</h4>
              <div className="space-y-2">
                {incorrectQuestions.length > 0 ? (
                  incorrectQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <XCircle className="size-4 text-red-500" />
                      <span className="line-clamp-1">{question.question_text}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">All questions answered correctly!</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button onClick={onReviewQuestions} variant="outline" className="flex-1">
          <BookOpen className="mr-2 size-4" /> Review Questions
        </Button>
        <Button onClick={onNewExam} className="flex-1">
          <Brain className="mr-2 size-4" /> Take Another Exam
        </Button>
      </div>
    </div>
  );
};

export default ExamAnalysis;
