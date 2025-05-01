
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, BookOpen, Book, Brain, BarChart, CheckCircle, XCircle } from "lucide-react";
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
  
  examQuestions.forEach(question => {
    if (studentAnswers[question.id] === question.correct_answer) {
      correctAnswers++;
    }
  });
  
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Parse the analysis into sections for display
  const parseAnalysis = () => {
    if (!analysis) return {
      summary: "",
      weakAreas: "",
      conceptsToReview: "",
      studyTips: ""
    };
    
    const sections = analysis.split(/\n\s*\n/);
    
    // Try to extract sections by looking for headers
    let summary = "", weakAreas = "", conceptsToReview = "", studyTips = "";
    
    for (const section of sections) {
      const lowerSection = section.toLowerCase();
      
      if (lowerSection.includes("performance summary") || lowerSection.includes("summary")) {
        summary = section;
      } else if (lowerSection.includes("knowledge gap") || lowerSection.includes("weak area")) {
        weakAreas = section;
      } else if (lowerSection.includes("concept") && lowerSection.includes("review")) {
        conceptsToReview = section;
      } else if (lowerSection.includes("study") || lowerSection.includes("recommend") || lowerSection.includes("strategy")) {
        studyTips = section;
      }
    }
    
    // If we couldn't find sections by headers, divide it roughly
    if (!summary && !weakAreas && !conceptsToReview && !studyTips && sections.length >= 3) {
      summary = sections[0];
      weakAreas = sections[1];
      conceptsToReview = sections[2];
      if (sections.length > 3) {
        studyTips = sections[3];
      }
    }
    
    return { summary, weakAreas, conceptsToReview, studyTips };
  };
  
  const analysisContent = parseAnalysis();

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
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <BarChart className="size-4" /> Summary
            </TabsTrigger>
            <TabsTrigger value="weakAreas" className="flex items-center gap-1">
              <XCircle className="size-4" /> Weak Areas
            </TabsTrigger>
            <TabsTrigger value="concepts" className="flex items-center gap-1">
              <Book className="size-4" /> Concepts
            </TabsTrigger>
            <TabsTrigger value="studyTips" className="flex items-center gap-1">
              <Lightbulb className="size-4" /> Study Tips
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="size-5" /> Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line">
                {analysisContent.summary || (
                  <p>
                    You scored {score}% ({correctAnswers} out of {totalQuestions} questions correct).
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weakAreas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="size-5" /> Knowledge Gaps Identified
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line">
                {analysisContent.weakAreas || "No specific weak areas identified."}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="concepts" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="size-5" /> Concepts to Review
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line">
                {analysisContent.conceptsToReview || "No specific concepts identified for review."}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="studyTips" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="size-5" /> Recommended Study Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line">
                {analysisContent.studyTips || "No specific study recommendations provided."}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
