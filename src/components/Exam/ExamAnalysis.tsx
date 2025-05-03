
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
  subject?: string;
  difficulty_level?: number;
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

  // Enhanced extraction of analysis sections with improved parsing logic
  const extractAnalysisSections = (analysisText: string | null) => {
    if (!analysisText) return { 
      overview: '', 
      strengths: '', 
      weaknesses: '', 
      recommendations: '' 
    };
    
    // Split the text into paragraphs
    const paragraphs = analysisText.split('\n\n').filter(p => p.trim() !== '');
    
    // More sophisticated section detection based on content patterns
    // Usually the first paragraph contains overall assessment
    const overview = paragraphs[0] || '';
    
    // Look for strengths-related paragraphs (typically mentions positive aspects)
    let strengthsIndex = paragraphs.findIndex(p => 
      p.toLowerCase().includes('strength') || 
      p.toLowerCase().includes('did well') ||
      p.toLowerCase().includes('excellent') ||
      p.toLowerCase().includes('good job')
    );
    
    if (strengthsIndex === -1) strengthsIndex = 1; // Default to second paragraph
    
    // Look for weaknesses-related paragraphs (typically mentions areas to improve)
    let weaknessesIndex = paragraphs.findIndex(p => 
      p.toLowerCase().includes('improve') || 
      p.toLowerCase().includes('challenging') ||
      p.toLowerCase().includes('struggled') ||
      p.toLowerCase().includes('difficult')
    );
    
    if (weaknessesIndex === -1) weaknessesIndex = 2; // Default to third paragraph
    
    // Ensure we don't have duplicate indices
    if (weaknessesIndex === strengthsIndex) weaknessesIndex++;
    
    // Find recommendations section (typically toward the end)
    let recommendationsIndex = paragraphs.findIndex(p => 
      p.toLowerCase().includes('recommend') || 
      p.toLowerCase().includes('suggest') ||
      p.toLowerCase().includes('try') ||
      p.toLowerCase().includes('next step')
    );
    
    if (recommendationsIndex === -1) recommendationsIndex = Math.max(3, paragraphs.length - 1);
    
    // Ensure we have unique sections
    const indices = [0, strengthsIndex, weaknessesIndex, recommendationsIndex].sort((a, b) => a - b);
    
    return {
      overview: paragraphs.slice(indices[0], indices[1]).join('\n\n'),
      strengths: paragraphs.slice(indices[1], indices[2]).join('\n\n'),
      weaknesses: paragraphs.slice(indices[2], indices[3]).join('\n\n'),
      recommendations: paragraphs.slice(indices[3]).join('\n\n'),
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
            <TabsTrigger value="areas-to-improve" className="flex items-center gap-1">
              <Target className="size-4" /> Areas to Improve
            </TabsTrigger>
            <TabsTrigger value="next-steps" className="flex items-center gap-1">
              <Lightbulb className="size-4" /> Next Steps
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                    <span className="text-sm text-muted-foreground">Performance Level</span>
                    <span className="font-medium text-lg capitalize">{getPerformanceDescriptor()}</span>
                  </div>
                  <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                    <span className="text-sm text-muted-foreground">Correct Answers</span>
                    <span className="font-medium text-lg">{correctAnswers} of {totalQuestions} ({score}%)</span>
                  </div>
                  <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                    <span className="text-sm text-muted-foreground">Difficulty Level</span>
                    <span className="font-medium text-lg">
                      {Math.max(...examQuestions.map(q => q.difficulty_level || 1))} / 5
                    </span>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <div className="whitespace-pre-line">
                      {analysisSections?.overview}
                    </div>
                  ) : (
                    <div>
                      <p>
                        Your score of {score}% ({correctAnswers} out of {totalQuestions} questions correct) shows a {getPerformanceDescriptor()} understanding of the material. 
                      </p>
                      <p>
                        This exam covered several important concepts and tested your ability to apply them to complex problems. 
                        Your performance indicates that you have a solid foundation in some areas, while others may require more attention.
                      </p>
                      <p>
                        Take some time to review the other tabs for more specific feedback on your strengths and areas that need attention.
                      </p>
                    </div>
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
                    <div className="whitespace-pre-line">
                      {analysisSections?.strengths}
                    </div>
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
          
          <TabsContent value="areas-to-improve">
            <Card>
              <CardHeader>
                <CardTitle>Questions That Need Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <div className="whitespace-pre-line">
                      {analysisSections?.weaknesses}
                    </div>
                  ) : incorrectQuestions.length > 0 ? (
                    <div>
                      <p>
                        You missed {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''}. 
                        Let's look at each one in detail:
                      </p>
                      
                      <div className="mt-4 space-y-4">
                        {incorrectQuestions.map((question, index) => {
                          const questionNumber = examQuestions.findIndex(q => q.id === question.id) + 1;
                          return (
                            <div key={index} className="rounded-lg border p-4">
                              <div className="flex items-start gap-2">
                                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 size-6 flex items-center justify-center rounded-full flex-shrink-0">
                                  <XCircle className="size-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">Question {questionNumber}:</h4>
                                  <p className="text-sm mb-2">{question.question_text}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                                      <span className="font-medium text-red-700 dark:text-red-400">Your answer:</span> Option {studentAnswers[question.id]} ({question[`option_${studentAnswers[question.id].toLowerCase()}`]})
                                    </div>
                                    <div className="p-2 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                                      <span className="font-medium text-green-700 dark:text-green-400">Correct answer:</span> Option {question.correct_answer} ({question[`option_${question.correct_answer.toLowerCase()}`]})
                                    </div>
                                  </div>
                                  
                                  {question.explanation && (
                                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                                      <span className="font-medium">Explanation:</span> {question.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                <CardTitle>Strategies to Overcome Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? (
                    <div className="whitespace-pre-line">
                      {analysisSections?.recommendations}
                    </div>
                  ) : (
                    <div>
                      {incorrectQuestions.length > 0 ? (
                        <>
                          <p>Based on your performance, here are targeted strategies to help you improve in the areas where you faced challenges:</p>
                          
                          <div className="mt-4 space-y-4">
                            {/* Group questions by conceptual areas if possible */}
                            <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Specific Learning Strategies</h4>
                              <ul className="list-disc text-sm text-blue-800 dark:text-blue-300 ml-4 space-y-2">
                                <li>
                                  <strong>Active problem solving:</strong> Don't just review theory—practice solving problems step by step, writing out your reasoning for each step.
                                </li>
                                <li>
                                  <strong>Concept mapping:</strong> Create visual connections between related concepts to strengthen your understanding of how they interact.
                                </li>
                                <li>
                                  <strong>Spaced repetition:</strong> Review these challenging concepts at increasing intervals (1 day, 3 days, 1 week) to build long-term retention.
                                </li>
                                <li>
                                  <strong>Teach the concepts:</strong> Explain the topics you struggled with to someone else, which will reveal gaps in your understanding.
                                </li>
                              </ul>
                            </div>
                            
                            <div className="rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 p-4">
                              <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Resource Recommendations</h4>
                              <ul className="list-disc text-sm text-purple-800 dark:text-purple-300 ml-4 space-y-1">
                                <li>Review the explanations provided for each incorrect answer carefully</li>
                                <li>Complete practice exercises that specifically target your weak areas</li>
                                <li>Consider finding video tutorials that walk through similar problems step by step</li>
                                <li>Schedule a brief review session every few days to reinforce these concepts</li>
                              </ul>
                            </div>
                          </div>
                          
                          <p className="mt-4">
                            Remember that mastering these concepts is an achievable goal with focused practice. 
                            By addressing each specific area of difficulty with targeted strategies, 
                            you'll develop a more comprehensive understanding of the material.
                          </p>
                        </>
                      ) : (
                        <p>
                          Your performance was exceptional! To continue building on this success, consider exploring more advanced 
                          topics in this subject area or helping others understand these concepts, which will further solidify your own mastery.
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
