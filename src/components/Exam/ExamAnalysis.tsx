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
  let correctCount = 0;
  const incorrectQuestions: ExamQuestion[] = [];
  examQuestions.forEach(question => {
    if (studentAnswers[question.id] === question.correct_answer) {
      correctCount++;
    } else {
      incorrectQuestions.push({
        ...question,
        student_answer: studentAnswers[question.id]
      });
    }
  });
  const score = totalQuestions > 0 ? Math.round(correctCount / totalQuestions * 100) : 0;

  // Helper to create a performance descriptor based on score
  const getPerformanceDescriptor = () => {
    if (score >= 90) return "excellent";
    if (score >= 80) return "very good";
    if (score >= 70) return "good";
    if (score >= 60) return "satisfactory";
    if (score >= 50) return "fair";
    return "needs improvement";
  };

  // Group incorrect questions by topic/subject if available
  const incorrectByTopic: Record<string, ExamQuestion[]> = {};
  incorrectQuestions.forEach(q => {
    const topic = q.subject || "General";
    if (!incorrectByTopic[topic]) {
      incorrectByTopic[topic] = [];
    }
    incorrectByTopic[topic].push(q);
  });

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
    let strengthsIndex = paragraphs.findIndex(p => p.toLowerCase().includes('strength') || p.toLowerCase().includes('did well') || p.toLowerCase().includes('excellent') || p.toLowerCase().includes('good job'));
    if (strengthsIndex === -1) strengthsIndex = 1; // Default to second paragraph

    // Look for weaknesses-related paragraphs (typically mentions areas to improve)
    let weaknessesIndex = paragraphs.findIndex(p => p.toLowerCase().includes('improve') || p.toLowerCase().includes('challenging') || p.toLowerCase().includes('struggled') || p.toLowerCase().includes('difficult'));
    if (weaknessesIndex === -1) weaknessesIndex = 2; // Default to third paragraph

    // Ensure we don't have duplicate indices
    if (weaknessesIndex === strengthsIndex) weaknessesIndex++;

    // Find recommendations section (typically toward the end)
    let recommendationsIndex = paragraphs.findIndex(p => p.toLowerCase().includes('recommend') || p.toLowerCase().includes('suggest') || p.toLowerCase().includes('try') || p.toLowerCase().includes('next step'));
    if (recommendationsIndex === -1) recommendationsIndex = Math.max(3, paragraphs.length - 1);

    // Ensure we have unique sections
    const indices = [0, strengthsIndex, weaknessesIndex, recommendationsIndex].sort((a, b) => a - b);
    return {
      overview: paragraphs.slice(indices[0], indices[1]).join('\n\n'),
      strengths: paragraphs.slice(indices[1], indices[2]).join('\n\n'),
      weaknesses: paragraphs.slice(indices[2], indices[3]).join('\n\n'),
      recommendations: paragraphs.slice(indices[3]).join('\n\n')
    };
  };
  const analysisSections = analysis ? extractAnalysisSections(analysis) : null;
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exam Analysis</h2>
        <Badge variant={score < 50 ? "destructive" : "default"} className={cn("px-3 py-1 text-base", score >= 70 && "bg-green-500 hover:bg-green-600", score >= 50 && score < 70 && "bg-amber-500 hover:bg-amber-600")}>
          Score: {score}%
        </Badge>
      </div>
      
      {isLoading ? <Card>
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
        </Card> : <Tabs defaultValue="overview" className="w-full">
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
                    <span className="font-medium text-lg">{correctCount} of {totalQuestions} ({score}%)</span>
                  </div>
                  
                </div>
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {analysis ? <div className="whitespace-pre-line">
                      {analysisSections?.overview}
                    </div> : <div>
                      <p>
                        Your score of {score}% ({correctCount} out of {totalQuestions} questions correct) shows a {getPerformanceDescriptor()} understanding of the material.
                      </p>
                      
                      <p className="mt-4">
                        This exam covered various topics, and your performance provides valuable insights into your strengths and areas for improvement. Your results indicate that you have a solid foundation in some concepts while others may require more focused attention.
                      </p>
                      
                      <p className="mt-4">
                        You performed particularly well on {correctCount > 0 ? correctCount : 'some'} questions, demonstrating good comprehension of those topics. However, there {incorrectQuestions.length === 1 ? 'is' : 'are'} {incorrectQuestions.length} {incorrectQuestions.length === 1 ? 'area' : 'areas'} where additional practice would be beneficial.
                      </p>
                      
                      <p className="mt-4">
                        The detailed breakdown in the other tabs will help you understand your performance patterns and provide targeted strategies to strengthen your knowledge in specific areas.
                      </p>
                    </div>}
                </div>
                
                {/* Additional performance patterns */}
                {!analysis && incorrectQuestions.length > 0 && <div className="mt-6">
                    <h4 className="font-medium text-lg mb-3">Performance Patterns</h4>
                    <div className="rounded-md border p-4">
                      <h5 className="font-medium mb-2">Topic Distribution of Incorrect Answers</h5>
                      <div className="space-y-2">
                        {Object.entries(incorrectByTopic).map(([topic, questions]) => <div key={topic} className="flex items-center justify-between">
                            <span>{topic}</span>
                            <div className="flex items-center">
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                              </span>
                            </div>
                          </div>)}
                      </div>
                    </div>
                  </div>}
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
                  {analysis ? <div className="whitespace-pre-line">
                      {analysisSections?.strengths}
                    </div> : <div>
                      {correctCount === totalQuestions ? <p>Excellent work! You've demonstrated strong understanding across all topics covered in this exam. Your performance shows mastery of the subject matter.</p> : correctCount > 0 ? <>
                          <p>You demonstrated good understanding in several areas, particularly on questions {totalQuestions - incorrectQuestions.length > 1 ? 'numbers' : 'number'} {examQuestions.filter(q => studentAnswers[q.id] === q.correct_answer).map((_, index) => index + 1).join(', ')}. Continue to build on these strengths.</p>
                          
                          <div className="mt-4 space-y-4">
                            {examQuestions.filter(q => studentAnswers[q.id] === q.correct_answer).map((question, index) => {
                      const questionNumber = examQuestions.findIndex(q => q.id === question.id) + 1;
                      return <div key={index} className="rounded-lg border p-4">
                                    <div className="flex items-start gap-2">
                                      <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 size-6 flex items-center justify-center rounded-full flex-shrink-0">
                                        <CheckCircle className="size-4" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">Question {questionNumber}: {question.subject || 'General Topic'}</h4>
                                        <p className="text-sm mb-2">{question.question_text}</p>
                                        
                                        {question.explanation && <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm">
                                            <span className="font-medium">Key Concept Mastered:</span> {question.explanation}
                                          </div>}
                                      </div>
                                    </div>
                                  </div>;
                    })}
                          </div>
                        </> : <p>This exam was challenging for you, but don't worry. Everyone has different starting points, and with targeted practice, you'll see improvement next time.</p>}
                    </div>}
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
                  {analysis ? <div className="whitespace-pre-line">
                      {analysisSections?.weaknesses}
                    </div> : incorrectQuestions.length > 0 ? <div>
                      <p>
                        You missed {incorrectQuestions.length} question{incorrectQuestions.length !== 1 ? 's' : ''}. 
                        Let's examine each one to understand the specific concepts that need improvement:
                      </p>
                      
                      <div className="mt-4 space-y-4">
                        {incorrectQuestions.map((question, index) => {
                    const questionNumber = examQuestions.findIndex(q => q.id === question.id) + 1;
                    return <div key={index} className="rounded-lg border p-4">
                              <div className="flex items-start gap-2">
                                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 size-6 flex items-center justify-center rounded-full flex-shrink-0">
                                  <XCircle className="size-4" />
                                </div>
                                <div className="w-full">
                                  <div className="flex justify-between items-start w-full">
                                    <h4 className="font-medium mb-1">Question {questionNumber}:</h4>
                                    {question.subject && <Badge variant="outline" className="ml-auto">
                                        Topic: {question.subject}
                                      </Badge>}
                                  </div>
                                  <p className="text-sm mb-2">{question.question_text}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                                      <span className="font-medium text-red-700 dark:text-red-400">Your answer:</span> Option {question.student_answer} ({question[`option_${question.student_answer?.toLowerCase()}`]})
                                    </div>
                                    <div className="p-2 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                                      <span className="font-medium text-green-700 dark:text-green-400">Correct answer:</span> Option {question.correct_answer} ({question[`option_${question.correct_answer.toLowerCase()}`]})
                                    </div>
                                  </div>
                                  
                                  {question.explanation && <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                                      <span className="font-medium">Explanation:</span> {question.explanation}
                                    </div>}
                                  
                                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-sm">
                                    <span className="font-medium">Why this concept is challenging:</span> This question tests your understanding of {question.subject || 'fundamental concepts'}. The incorrect answer suggests you may need to review {question.subject ? `key principles in ${question.subject}` : 'this area'}, particularly how to {question.explanation ? question.explanation.split('.')[0].toLowerCase() : 'apply these concepts correctly'}.
                                  </div>
                                </div>
                              </div>
                            </div>;
                  })}
                      </div>
                    </div> : <p>Outstanding! You answered all questions correctly. This is an excellent result and shows you have a strong grasp of the material. Keep up the great work!</p>}
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
                  {analysis ? <div className="whitespace-pre-line">
                      {analysisSections?.recommendations}
                    </div> : <div>
                      {incorrectQuestions.length > 0 ? <>
                          <p>Based on your performance, here are targeted strategies to help you improve in the specific areas where you faced challenges:</p>
                          
                          <div className="mt-4 space-y-4">
                            {Object.entries(incorrectByTopic).map(([topic, questions]) => <div key={topic} className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                                  Strategies for {topic}
                                </h4>
                                <ul className="list-disc text-sm text-blue-800 dark:text-blue-300 ml-4 space-y-2">
                                  <li>
                                    <strong>Focused concept review:</strong> Revisit the fundamental principles of {topic}, paying special attention to the areas covered in questions {questions.map((_, i) => examQuestions.findIndex(q => q.id === questions[i].id) + 1).join(', ')}.
                                  </li>
                                  <li>
                                    <strong>Practice with similar problems:</strong> Solve additional problems that test the same concepts to reinforce your understanding and identify any recurring patterns in your approach.
                                  </li>
                                  <li>
                                    <strong>Visual learning technique:</strong> Create concept maps or diagrams that illustrate the relationships between key ideas in {topic} to strengthen your conceptual framework.
                                  </li>
                                  <li>
                                    <strong>Apply active recall:</strong> After studying, test yourself by explaining the concepts out loud or writing explanations without referring to your notes.
                                  </li>
                                </ul>
                              </div>)}
                            
                            <div className="rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 p-4">
                              <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">General Study Techniques</h4>
                              <ul className="list-disc text-sm text-purple-800 dark:text-purple-300 ml-4 space-y-1">
                                <li><strong>Spaced repetition:</strong> Review the challenging concepts at increasing intervals (1 day, 3 days, 1 week) to build long-term retention.</li>
                                <li><strong>Teaching method:</strong> Explain the concepts you struggled with to someone else, which will highlight gaps in your understanding.</li>
                                <li><strong>Problem-solving journal:</strong> Keep a record of mistakes and their corrections to identify patterns and prevent similar errors in the future.</li>
                                <li><strong>Study group participation:</strong> Discuss challenging concepts with peers to gain different perspectives and deepen your understanding.</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                            <p className="font-medium">
                              Remember that mastering these concepts takes time and consistent effort. Your current challenges are stepping stones to deeper understanding. With targeted practice and the strategies above, you'll see significant improvement in your next assessment. Keep going—each study session brings you closer to mastery!
                            </p>
                          </div>
                        </> : <div>
                          <p>
                            Your performance was exceptional! To continue building on this success, consider exploring more advanced 
                            topics in this subject area or helping others understand these concepts, which will further solidify your own mastery.
                          </p>
                          
                          <div className="mt-4 space-y-4">
                            <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Next Level Strategies</h4>
                              <ul className="list-disc text-sm text-green-800 dark:text-green-300 ml-4 space-y-2">
                                <li>
                                  <strong>Challenge yourself:</strong> Seek out more advanced problems or compete in subject-related competitions to push your boundaries.
                                </li>
                                <li>
                                  <strong>Interdisciplinary connections:</strong> Explore how these concepts connect to other subjects or real-world applications.
                                </li>
                                <li>
                                  <strong>Mentoring others:</strong> Consider tutoring peers who are struggling with these concepts, which will deepen your own understanding.
                                </li>
                              </ul>
                            </div>
                            
                            <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                              <p className="font-medium">
                                Your excellent performance demonstrates strong mastery of the material. Continue to nurture your curiosity and explore these topics more deeply. Your understanding and dedication will serve you well in future academic and professional pursuits!
                              </p>
                            </div>
                          </div>
                        </div>}
                    </div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>}
      
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button onClick={onReviewQuestions} variant="outline" className="flex-1">
          <BookOpen className="mr-2 size-4" /> Review Questions
        </Button>
        <Button onClick={onNewExam} className="flex-1">
          <Brain className="mr-2 size-4" /> Take Another Exam
        </Button>
      </div>
    </div>;
};
export default ExamAnalysis;