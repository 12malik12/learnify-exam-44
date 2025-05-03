
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
  
  // Helper to create a performance descriptor based on score
  const getPerformanceDescriptor = () => {
    if (score >= 90) return "excellent";
    if (score >= 80) return "very good";
    if (score >= 70) return "good";
    if (score >= 60) return "satisfactory";
    if (score >= 50) return "fair";
    return "needs improvement";
  };

  // Helper to extract sections from the analysis when available
  const extractAnalysisSections = (analysisText: string | null) => {
    if (!analysisText) return { overview: '', strengths: '', weaknesses: '', recommendations: '' };
    
    // We don't want to actually split the analysis on headings since that would be unnatural
    // Instead, we'll present the full text in a structured way in the UI
    const paragraphs = analysisText.split('\n\n');
    
    // Return a simple structure with meaningful paragraphs
    return {
      overview: paragraphs.length > 0 ? paragraphs[0] : '',
      strengths: paragraphs.length > 1 ? paragraphs[1] : '',
      weaknesses: paragraphs.length > 2 ? paragraphs[2] : '',
      recommendations: paragraphs.slice(3).join('\n\n'),
    };
  };
  
  const analysisSections = analysis ? extractAnalysisSections(analysis) : null;

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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Award className="size-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="strengths" className="flex items-center gap-1">
              <CheckCircle className="size-4" /> Strengths
            </TabsTrigger>
            <TabsTrigger value="weaknesses" className="flex items-center gap-1">
              <Target className="size-4" /> Areas to Improve
            </TabsTrigger>
            <TabsTrigger value="next-steps" className="flex items-center gap-1">
              <Lightbulb className="size-4" /> Next Steps
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
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
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <p>{analysisSections?.overview}</p>
                  ) : (
                    <p>
                      Your score of {score}% ({correctAnswers} out of {totalQuestions} questions correct) shows a {getPerformanceDescriptor()} understanding of the material. Take some time to review the other tabs for more specific feedback on your strengths and areas that need attention.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle>Your Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <p>{analysisSections?.strengths}</p>
                  ) : (
                    <div>
                      {correctAnswers === totalQuestions ? (
                        <p>Excellent work! You've demonstrated strong understanding across all topics covered in this exam. Your performance shows mastery of the subject matter.</p>
                      ) : correctAnswers > 0 ? (
                        <p>You demonstrated good understanding in several areas, particularly on questions {totalQuestions - incorrectQuestions.length > 1 ? 'numbers' : 'number'} {examQuestions
                          .filter((_, index) => !incorrectQuestions.includes(examQuestions[index]))
                          .map((_, index) => index + 1)
                          .join(', ')}. Continue to build on these strengths.</p>
                      ) : (
                        <p>This exam was challenging for you, but don't worry. Everyone has different starting points, and with targeted practice, you'll see improvement next time.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weaknesses">
            <Card>
              <CardHeader>
                <CardTitle>Areas to Focus On</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <p>{analysisSections?.weaknesses}</p>
                  ) : incorrectQuestions.length > 0 ? (
                    <div>
                      <p>
                        You missed {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''}. 
                        Focus on improving your understanding of these topics:
                      </p>
                      <ul className="mt-2 list-disc pl-5 space-y-1">
                        {incorrectQuestions.map((question, index) => (
                          <li key={index} className="text-sm">
                            Question {examQuestions.findIndex(q => q.id === question.id) + 1}: {question.question_text.length > 60 ? `${question.question_text.substring(0, 60)}...` : question.question_text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>Outstanding! You answered all questions correctly. This is an excellent result and shows you have a strong grasp of the material. Keep up the great work!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="next-steps">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <div className="whitespace-pre-line">
                      {analysisSections?.recommendations}
                    </div>
                  ) : (
                    <div>
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3 mb-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Study suggestions</h4>
                        <ul className="list-disc text-sm text-blue-800 dark:text-blue-300 ml-4 space-y-1">
                          <li>Review your incorrect answers carefully to understand where you went wrong</li>
                          <li>Try solving similar problems to reinforce your understanding</li>
                          <li>Consider creating flashcards for key concepts you struggled with</li>
                          {incorrectQuestions.length > 0 && (
                            <li>Focus particularly on the topics from questions {incorrectQuestions.map((q, i) => examQuestions.findIndex(eq => eq.id === q.id) + 1).join(', ')}</li>
                          )}
                        </ul>
                      </div>
                      
                      <p>
                        Remember that learning is a journey. Each exam is an opportunity to identify areas for growth. 
                        With focused practice on the topics you found challenging, you'll continue to improve your understanding and performance.
                      </p>
                      
                      <p className="mt-3">
                        I believe in your ability to master these concepts! Set aside regular study time in the coming week, 
                        and don't hesitate to ask for help when needed. You've got this!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Topic breakdown now moved to a separate tab within the Tabs component */}
      
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
