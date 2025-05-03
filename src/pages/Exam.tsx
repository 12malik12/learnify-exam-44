import React, { useState, useEffect } from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { subjects } from "@/utils/subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, Check, ClipboardList, Clock, BarChart, ChevronLeft, 
  ChevronRight, Brain, Sparkles, Wifi, WifiOff, AlertCircle 
} from "lucide-react";
import ExamQuestion from "@/components/Exam/ExamQuestion";
import ExamAnalysis from "@/components/Exam/ExamAnalysis";
import AIAssistantButton from "@/components/AIAssistant/AIAssistantButton";
import AIAssistantDialog from "@/components/AIAssistant/AIAssistantDialog";
import { useAppContext } from "@/context/AppContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generateUniqueQuestions, ExamQuestion as ExamQuestionType } from "@/services/questionBankService";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const EXAM_DURATION = 60; // minutes

const Exam = () => {
  const { toast } = useToast();
  const { addExamResult } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("practice");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [unitObjective, setUnitObjective] = useState("");
  
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examCompleted, setExamCompleted] = useState(false);
  const [examId, setExamId] = useState("");
  const [questionSource, setQuestionSource] = useState<'ai'>('ai');
  
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const { isOnline, wasOffline } = useNetworkStatus();

  const selectedSubjectObj = subjects.find(s => s.id === selectedSubject);
  
  const handleGenerateExam = async () => {
    if (!selectedSubject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (!isOnline) {
      toast({
        title: "Internet Connection Required",
        description: "This feature requires an internet connection to generate AI questions.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setGenerationError(null);
    
    try {
      const newExamId = Date.now().toString();
      setExamId(newExamId);
      
      toast({
        title: "Generating Questions",
        description: "AI is crafting challenging questions for you...",
      });
      
      const result = await generateUniqueQuestions(
        questionCount,
        selectedSubjectObj?.name || "",
        unitObjective.trim() || undefined,
        newExamId
      );
      
      // Verify we have questions before proceeding
      if (!result.questions || result.questions.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }
      
      setExamQuestions(result.questions);
      setQuestionSource(result.source);
      setExamStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setExamCompleted(false);
      
      toast({
        title: `Exam Ready - AI-Generated Questions`,
        description: `${result.questions.length} challenging questions have been prepared for you by our AI. Good luck!`
      });
      
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Store the error for display
      setGenerationError(error instanceof Error ? error.message : "Failed to generate AI questions");
      
      // Show a detailed error message to the user
      toast({
        title: "AI Question Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate AI questions. Please try again.",
        variant: "destructive",
      });
      
      // Show additional debugging info in the console
      console.debug("Details for error:", {
        subject: selectedSubjectObj?.name,
        questionCount,
        unitObjective: unitObjective.trim() || "undefined",
        online: isOnline,
        errorObj: error
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishExam();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleFinishExam = async () => {
    let correctCount = 0;
    examQuestions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / examQuestions.length) * 100);
    
    toast({
      title: "Exam Completed",
      description: `Your score: ${score}% (${correctCount}/${examQuestions.length})`,
    });
    
    if (selectedSubject) {
      addExamResult(selectedSubject, score, examQuestions.length);
    }
    
    // Set exam as completed
    setExamCompleted(true);
    
    // Check if we should generate analysis
    if (isOnline && examQuestions.length > 0) {
      await generateExamAnalysis();
    }
  };
  
  // New function to generate exam analysis using GROQ
  const generateExamAnalysis = async () => {
    if (!isOnline) {
      toast({
        title: "Internet Connection Required",
        description: "Analysis requires an internet connection.",
        variant: "destructive",
      });
      return;
    }
    
    setAnalysisLoading(true);
    setShowAnalysis(true);
    
    try {
      // Prepare the questions with student answers
      const questionsWithAnswers = examQuestions.map(q => ({
        ...q,
        student_answer: answers[q.id] || null
      }));
      
      toast({
        title: "Analyzing Exam Results",
        description: "AI is analyzing your performance...",
      });
      
      // Call the edge function to analyze the results
      const { data, error } = await supabase.functions.invoke('analyze-exam-results', {
        body: { examData: questionsWithAnswers }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.success && data.analysis) {
        setAnalysisData(data.analysis);
        
        toast({
          title: "Analysis Complete",
          description: "Your personalized learning recommendations are ready.",
        });
      } else {
        throw new Error("Failed to generate analysis");
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze exam results",
        variant: "destructive",
      });
      
      setAnalysisData(null);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  const handleStartNewExam = () => {
    // Reset all exam-related state
    setExamStarted(false);
    setExamQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setExamCompleted(false);
    setShowAnalysis(false);
    setAnalysisData(null);
  };
  
  const handleReviewQuestions = () => {
    setShowAnalysis(false);
  };
  
  // Reset error when changing subject
  useEffect(() => {
    setGenerationError(null);
  }, [selectedSubject, questionCount, unitObjective]);
  
  const currentQuestion = examQuestions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {!examStarted ? (
          <section className="py-10 md:py-16 bg-secondary/30">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                  <ClipboardList className="mr-1 size-3.5" />
                  <span>Test Your Knowledge</span>
                </div>
                
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                  Advanced AI Exams
                </h1>
                
                <p className="max-w-[700px] text-muted-foreground md:text-lg">
                  Practice with dynamically generated challenging questions created by our 
                  AI specifically for your selected subject and learning objectives.
                </p>
                
                <div className="flex items-center mt-2 text-sm font-medium">
                  {isOnline ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="mr-1 size-4" />
                      <span>Online Mode: AI-powered question generation ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <WifiOff className="mr-1 size-4" />
                      <span>Offline Mode: Internet connection required for AI questions</span>
                    </div>
                  )}
                </div>
                
                {!isOnline && (
                  <Alert variant="destructive" className="mt-4 max-w-[700px]">
                    <AlertDescription>
                      This feature requires an internet connection to generate AI questions. Please connect to the internet and try again.
                    </AlertDescription>
                  </Alert>
                )}
                
                {wasOffline && isOnline && (
                  <Alert className="mt-4 max-w-[700px]">
                    <AlertDescription>
                      Your connection has been restored. You can now generate AI questions.
                    </AlertDescription>
                  </Alert>
                )}
                
                {generationError && isOnline && (
                  <Alert variant="destructive" className="mt-4 max-w-[700px]">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      {generationError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="mx-auto max-w-3xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Generate Your AI Exam {isOnline && <Sparkles className="ml-2 size-4 text-yellow-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div>
                        <Label className="block text-sm font-medium mb-2">
                          Exam Type
                        </Label>
                        <div className="flex space-x-4">
                          <div 
                            className={`flex items-center justify-center px-4 py-2 rounded-md cursor-pointer border transition-colors ${examType === "practice" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent hover:text-accent-foreground"}`}
                            onClick={() => setExamType("practice")}
                          >
                            <Check className="mr-2 size-4" />
                            <span>Practice Mode</span>
                          </div>
                          <div 
                            className={`flex items-center justify-center px-4 py-2 rounded-md cursor-pointer border transition-colors ${examType === "timed" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent hover:text-accent-foreground"}`}
                            onClick={() => setExamType("timed")}
                          >
                            <Clock className="mr-2 size-4" />
                            <span>Timed Exam</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {examType === "practice" 
                            ? "Take your time to answer challenging questions and see explanations for each answer."
                            : `Simulate the real exam experience with timed conditions (${EXAM_DURATION} minutes).`
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Subject
                        </Label>
                        <Select
                          value={selectedSubject}
                          onValueChange={setSelectedSubject}
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
                      
                      <div>
                        <Label htmlFor="unitObjective" className="block text-sm font-medium mb-2">
                          Learning Objective (Optional)
                        </Label>
                        <Input
                          id="unitObjective"
                          placeholder="E.g., Understand photosynthesis process in plants"
                          value={unitObjective}
                          onChange={(e) => setUnitObjective(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Specify what you want to learn to get more targeted challenging questions
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="questionCount" className="block text-sm font-medium mb-2">
                          Number of Questions
                        </Label>
                        <Select
                          value={questionCount.toString()}
                          onValueChange={(value) => setQuestionCount(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select question count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 questions</SelectItem>
                            <SelectItem value="10">10 questions</SelectItem>
                            <SelectItem value="15">15 questions</SelectItem>
                            <SelectItem value="20">20 questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateExam} 
                        className="mt-2 w-full"
                        disabled={loading || !isOnline}
                      >
                        {loading ? (
                          "AI Generating Questions..."
                        ) : (
                          <>Start AI Exam <Sparkles className="ml-2 size-4 text-yellow-500" /><ArrowRight className="ml-2 size-4" /></>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-10">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                  <Button variant="outline" onClick={() => setExamStarted(false)} className="mb-4">
                    <ChevronLeft className="mr-2 size-4" /> Back to Setup
                  </Button>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                      {examType === "practice" ? "Practice Exam" : "Timed Exam"}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {examQuestions.length}
                    </div>
                  </div>
                  
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${((currentQuestionIndex + 1) / examQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {examCompleted && showAnalysis ? (
                  <ExamAnalysis 
                    examQuestions={examQuestions}
                    studentAnswers={answers}
                    analysis={analysisData}
                    isLoading={analysisLoading}
                    onReviewQuestions={handleReviewQuestions}
                    onNewExam={handleStartNewExam}
                  />
                ) : currentQuestion ? (
                  <ExamQuestion
                    question={currentQuestion}
                    selectedAnswer={answers[currentQuestion.id] || null}
                    onSelectAnswer={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
                    showCorrectAnswer={examCompleted}
                    questionNumber={currentQuestionIndex + 1}
                    source={questionSource}
                  />
                ) : null}
                
                {!showAnalysis && (
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="mr-2 size-4" /> Previous
                    </Button>
                    
                    {!examCompleted ? (
                      <Button 
                        onClick={handleNextQuestion}
                        disabled={!answers[currentQuestion?.id]}
                      >
                        {currentQuestionIndex < examQuestions.length - 1 ? (
                          <>Next <ChevronRight className="ml-2 size-4" /></>
                        ) : (
                          <>Finish Exam <Check className="ml-2 size-4" /></>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStartNewExam}
                        variant="default"
                      >
                        Back to Exams
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        
        {!examStarted && (
          <section className="py-12">
            <div className="container px-4 md:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Exams</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      Mathematics
                    </span>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Practice Exam</h3>
                    <div className="flex items-center">
                      <BarChart className="mr-1 size-3.5 text-primary" />
                      <span className="font-medium">70%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Review Answers
                  </Button>
                </div>
                
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      Biology
                    </span>
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Timed Exam</h3>
                    <div className="flex items-center">
                      <BarChart className="mr-1 size-3.5 text-primary" />
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Review Answers
                  </Button>
                </div>
                
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                      Chemistry
                    </span>
                    <span className="text-sm text-muted-foreground">2 weeks ago</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Past Paper (2022)</h3>
                    <div className="flex items-center">
                      <BarChart className="mr-1 size-3.5 text-primary" />
                      <span className="font-medium">65%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Review Answers
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <AIAssistantButton onClick={() => setAiDialogOpen(true)} />
      <AIAssistantDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
      
      <Footer />
    </div>
  );
};

export default Exam;
