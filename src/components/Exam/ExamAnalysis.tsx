
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
  
  // Parse the analysis into sections for display
  const parseAnalysis = () => {
    if (!analysis) return {
      summary: "",
      weakAreas: "",
      studyPlan: "",
      motivation: ""
    };
    
    // Try to find sections by common headings in the analysis
    const sections = analysis.split(/\n\s*\n/);
    const fullText = analysis.toLowerCase();
    
    let summary = "", weakAreas = "", studyPlan = "", motivation = "";
    
    // First try to find sections by standard headings
    if (fullText.includes("performance summary") || fullText.includes("exam insights")) {
      // Find the performance summary section
      const summaryStart = analysis.search(/performance summary|exam insights/i);
      if (summaryStart !== -1) {
        const nextSectionStart = analysis.substring(summaryStart + 20).search(/areas to strengthen|personalized study|study plan|motivational|conclusion/i);
        if (nextSectionStart !== -1) {
          summary = analysis.substring(summaryStart, summaryStart + 20 + nextSectionStart).trim();
        }
      }
    }
    
    if (fullText.includes("areas to strengthen") || fullText.includes("weak areas") || fullText.includes("improvement areas")) {
      // Find the weak areas section
      const weakAreasStart = analysis.search(/areas to strengthen|weak areas|improvement areas/i);
      if (weakAreasStart !== -1) {
        const nextSectionStart = analysis.substring(weakAreasStart + 20).search(/personalized study|study plan|motivational|conclusion/i);
        if (nextSectionStart !== -1) {
          weakAreas = analysis.substring(weakAreasStart, weakAreasStart + 20 + nextSectionStart).trim();
        }
      }
    }
    
    if (fullText.includes("personalized study plan") || fullText.includes("study plan") || fullText.includes("recommended study")) {
      // Find the study plan section
      const studyPlanStart = analysis.search(/personalized study plan|study plan|recommended study/i);
      if (studyPlanStart !== -1) {
        const nextSectionStart = analysis.substring(studyPlanStart + 20).search(/motivational|conclusion|final thoughts/i);
        if (nextSectionStart !== -1) {
          studyPlan = analysis.substring(studyPlanStart, studyPlanStart + 20 + nextSectionStart).trim();
        } else {
          // If no next section found, take until the end or next 800 chars max
          studyPlan = analysis.substring(studyPlanStart).trim();
        }
      }
    }
    
    if (fullText.includes("motivational") || fullText.includes("next steps") || fullText.includes("conclusion")) {
      // Find the motivational closing
      const motivationStart = analysis.search(/motivational|next steps|conclusion|final thoughts/i);
      if (motivationStart !== -1) {
        motivation = analysis.substring(motivationStart).trim();
      }
    }
    
    // If we couldn't extract sections properly, fall back to a simpler approach
    if (!summary && !weakAreas && !studyPlan && sections.length >= 3) {
      const sectionCount = sections.length;
      // Simple approach: divide into quarters if we have enough sections
      if (sectionCount >= 4) {
        const quarterSize = Math.floor(sectionCount / 4);
        summary = sections.slice(0, quarterSize).join("\n\n");
        weakAreas = sections.slice(quarterSize, quarterSize * 2).join("\n\n");
        studyPlan = sections.slice(quarterSize * 2, quarterSize * 3).join("\n\n");
        motivation = sections.slice(quarterSize * 3).join("\n\n");
      } else {
        // With fewer sections, just divide roughly
        summary = sections[0];
        weakAreas = sections.length > 1 ? sections[1] : "";
        studyPlan = sections.length > 2 ? sections[2] : "";
        motivation = sections.length > 3 ? sections[3] : "";
      }
    }
    
    // For any missing sections, provide some generic content based on score
    if (!summary) {
      summary = `Performance Summary\n\nYou scored ${score}% on this exam, answering ${correctAnswers} out of ${totalQuestions} questions correctly. This shows ${score >= 70 ? "good" : "some"} understanding of the material.`;
    }
    
    if (!weakAreas && incorrectQuestions.length > 0) {
      weakAreas = "Areas to Strengthen\n\nFocus on improving your understanding of the topics related to the questions you missed in this exam.";
    }
    
    if (!studyPlan) {
      studyPlan = "Personalized Study Plan\n\nReview the concepts from the questions you missed. Practice similar problems to reinforce your understanding. Consider seeking additional resources or help for difficult topics.";
    }
    
    if (!motivation) {
      motivation = "Keep going! With targeted study and practice, you can improve your understanding and performance on future exams.";
    }
    
    return { summary, weakAreas, studyPlan, motivation };
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
              <Award className="size-4" /> Performance
            </TabsTrigger>
            <TabsTrigger value="weakAreas" className="flex items-center gap-1">
              <Target className="size-4" /> Improvement
            </TabsTrigger>
            <TabsTrigger value="studyPlan" className="flex items-center gap-1">
              <Calendar className="size-4" /> Study Plan
            </TabsTrigger>
            <TabsTrigger value="motivation" className="flex items-center gap-1">
              <Lightbulb className="size-4" /> Next Steps
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5" /> Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                  {analysisContent.summary ? (
                    <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: analysisContent.summary.replace(/performance summary/i, "").replace(/^#+\s*/g, "") }} />
                  ) : (
                    <p>
                      Your score of {score}% ({correctAnswers} out of {totalQuestions} questions correct) shows a {getPerformanceDescriptor()} understanding of the material.
                      {score >= 70 ? 
                        " You have demonstrated solid knowledge in most areas covered by this exam. Focus on the few topics you missed to achieve mastery." : 
                        " With additional focused study on the concepts identified in this analysis, you can significantly improve your understanding and performance."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weakAreas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5" /> Areas to Strengthen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incorrectQuestions.length > 0 ? (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 mb-4">
                    <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">Focus on these areas</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      You missed {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''}.
                      The analysis below identifies specific topics to focus on.
                    </p>
                  </div>
                ) : null}
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysisContent.weakAreas ? (
                    <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: analysisContent.weakAreas.replace(/areas to strengthen|weak areas|improvement areas/i, "").replace(/^#+\s*/g, "") }} />
                  ) : (
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
          
          <TabsContent value="studyPlan" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" /> Personalized Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incorrectQuestions.length > 0 && (
                  <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3 mb-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Your 7-Day Study Plan</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Follow this personalized plan to improve your understanding of the topics you struggled with.
                    </p>
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysisContent.studyPlan ? (
                    <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: analysisContent.studyPlan.replace(/personalized study plan|study plan|recommended study/i, "").replace(/^#+\s*/g, "") }} />
                  ) : (
                    <div className="space-y-4">
                      <p>Based on your exam performance, here's a personalized study plan:</p>
                      
                      <div className="space-y-3">
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <BookOpen className="size-4" /> Step 1: Review Concepts
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Spend 1-2 days reviewing the fundamental concepts related to the questions you missed.
                            Take detailed notes and create a summary of key formulas, definitions, and examples.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <Brain className="size-4" /> Step 2: Practice Problems
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Dedicate 2-3 days to solving practice problems related to your weak areas.
                            Start with simpler problems and gradually increase difficulty. Analyze mistakes carefully.
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <CheckCircle className="size-4" /> Step 3: Self-Assessment
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Take a practice quiz on the topics you've studied to measure your improvement.
                            Identify any remaining gaps in your understanding and revisit those areas.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="motivation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="size-5" /> Next Steps & Motivation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3 mb-4">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-1">You've got this!</h4>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Remember that every study session brings you closer to mastery.
                  </p>
                </div>
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysisContent.motivation ? (
                    <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: analysisContent.motivation.replace(/motivational|next steps|conclusion|final thoughts/i, "").replace(/^#+\s*/g, "") }} />
                  ) : (
                    <div>
                      <p className="text-lg font-medium mb-2">You're on the right track!</p>
                      <p>
                        Remember that learning is a journey with ups and downs. By following your personalized study plan and focusing on your areas for improvement, you'll see significant progress.
                      </p>
                      <p className="mt-2">
                        Set aside regular study time each day, even if it's just 20-30 minutes. Consistent practice is more effective than cramming.
                      </p>
                      <p className="mt-2">
                        Don't hesitate to ask for help when you need it. Whether it's from a teacher, classmate, or online resources, getting another perspective can make a big difference.
                      </p>
                      <blockquote className="border-l-4 border-primary pl-4 italic mt-4">
                        "The expert in anything was once a beginner. Keep going!"
                      </blockquote>
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
