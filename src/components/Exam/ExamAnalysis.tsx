
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
  const incorrectQuestions: ExamQuestion[] = [];
  
  examQuestions.forEach(question => {
    if (studentAnswers[question.id] === question.correct_answer) {
      correctAnswers++;
    } else {
      incorrectQuestions.push(question);
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
      } else if (lowerSection.includes("knowledge gap") || lowerSection.includes("weak area") || lowerSection.includes("identified")) {
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
  
  // Helper to create a performance descriptor based on score
  const getPerformanceDescriptor = () => {
    if (score >= 90) return "excellent";
    if (score >= 80) return "very good";
    if (score >= 70) return "good";
    if (score >= 60) return "satisfactory";
    if (score >= 50) return "fair";
    return "needs improvement";
  };
  
  // Generate missed topics from incorrect questions
  const getMissedTopics = () => {
    if (incorrectQuestions.length === 0) return "None";
    
    // Extract keywords from incorrect questions
    const keywords: string[] = [];
    incorrectQuestions.forEach(q => {
      // Simple extraction of keywords based on question text
      const text = q.question_text.toLowerCase();
      if (text.includes("equation")) keywords.push("Equations");
      if (text.includes("formula")) keywords.push("Formulas");
      if (text.includes("graph")) keywords.push("Graphical Analysis");
      if (text.includes("calculate")) keywords.push("Calculations");
      if (text.includes("theory")) keywords.push("Theoretical Concepts");
      if (text.includes("application")) keywords.push("Practical Applications");
    });
    
    // Deduplicate
    return [...new Set(keywords)].join(", ") || "Various topics";
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
              <CardContent className="space-y-4">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                      <span className="text-sm text-muted-foreground">Performance Level</span>
                      <span className="font-medium text-lg capitalize">{getPerformanceDescriptor()}</span>
                    </div>
                    <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                      <span className="text-sm text-muted-foreground">Time Efficiency</span>
                      <span className="font-medium text-lg">
                        {correctAnswers > totalQuestions * 0.7 ? "Efficient" : "Review Needed"}
                      </span>
                    </div>
                    <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                      <span className="text-sm text-muted-foreground">Questions Correct</span>
                      <span className="font-medium text-lg">{correctAnswers} of {totalQuestions} ({score}%)</span>
                    </div>
                    <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                      <span className="text-sm text-muted-foreground">Missed Topics</span>
                      <span className="font-medium text-lg">{getMissedTopics()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Analysis</h4>
                    <div className="whitespace-pre-line text-muted-foreground">
                      {analysisContent.summary || (
                        <p>
                          Your score of {score}% ({correctAnswers} out of {totalQuestions} questions correct) shows a {getPerformanceDescriptor()} understanding of the material.
                          {score >= 70 ? 
                            " You have demonstrated solid knowledge in most areas covered by this exam. Focus on the few topics you missed to achieve mastery." : 
                            " With additional focused study on the concepts identified in this analysis, you can significantly improve your understanding and performance."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
              <CardContent className="space-y-4">
                {incorrectQuestions.length > 0 ? (
                  <>
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 mb-3">
                      <h4 className="font-medium text-amber-900 mb-1">Questions Requiring Attention</h4>
                      <p className="text-sm text-amber-800">
                        You had difficulty with {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''}.
                        Focus your review on these specific areas to improve your understanding.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {incorrectQuestions.slice(0, 3).map((question, idx) => (
                        <div key={question.id} className="border rounded-md p-3">
                          <p className="font-medium mb-1">Topic {idx + 1}: Question {idx + 1} of the exam</p>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{question.question_text}</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Your answer: {question.student_answer}
                            </Badge>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Correct: {question.correct_answer}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
                
                <div className="mt-4 whitespace-pre-line">
                  {analysisContent.weakAreas || (
                    incorrectQuestions.length > 0 ? (
                      <p>Based on your answers, you should focus on improving your understanding of the concepts related to the questions you missed.</p>
                    ) : (
                      <p>Great job! You've demonstrated strong understanding across all topics covered in this exam. Keep up the excellent work!</p>
                    )
                  )}
                </div>
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
              <CardContent className="space-y-4">
                {incorrectQuestions.length > 0 ? (
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3 mb-3">
                    <h4 className="font-medium text-blue-900 mb-1">Focus Areas</h4>
                    <p className="text-sm text-blue-800">
                      These are specific concepts from the exam that would benefit from additional review.
                    </p>
                  </div>
                ) : null}
                
                <div className="whitespace-pre-line">
                  {analysisContent.conceptsToReview || (
                    incorrectQuestions.length > 0 ? (
                      <div className="space-y-4">
                        <p>Based on your exam performance, consider reviewing these key concepts:</p>
                        <ul className="list-disc pl-5 space-y-2">
                          {incorrectQuestions.slice(0, 3).map((q, idx) => (
                            <li key={idx}>
                              <span className="font-medium">Concept {idx + 1}:</span> {q.question_text.split(".")[0]}...
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p>You've shown mastery of the concepts covered in this exam. To further deepen your understanding, you might explore more advanced topics in this subject area.</p>
                    )
                  )}
                </div>
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
              <CardContent className="space-y-4">
                <div className="rounded-md bg-green-50 border border-green-200 p-3 mb-3">
                  <h4 className="font-medium text-green-900 mb-1">Personalized Learning Path</h4>
                  <p className="text-sm text-green-800">
                    {score >= 70 
                      ? "You're doing well! These recommendations will help you achieve mastery." 
                      : "Don't worry! With focused study using these strategies, you'll see improvement quickly."}
                  </p>
                </div>
                
                <div className="whitespace-pre-line">
                  {analysisContent.studyTips || (
                    <div className="space-y-4">
                      <p>Based on your performance, here are personalized study recommendations:</p>
                      
                      <div className="space-y-3">
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <BookOpen className="size-4" /> Active Recall Practice
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Spend 20-30 minutes daily testing yourself on key concepts. Create flashcards for terms and formulas you struggled with in this exam.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <Brain className="size-4" /> Concept Mapping
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Draw connections between related concepts to strengthen your understanding of the bigger picture. This helps identify patterns across topics.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <CheckCircle className="size-4" /> Practice Problems
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Complete at least 5 practice problems for each concept you missed on this exam. Focus on understanding the process rather than just getting the right answer.
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm italic">
                        Remember: Regular, focused practice is more effective than cramming. Schedule short, frequent study sessions for best results!
                      </p>
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
