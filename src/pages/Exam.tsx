import React, { useState } from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { subjects } from "@/utils/subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, ClipboardList, Clock, BarChart, ChevronLeft, ChevronRight, Brain } from "lucide-react";
import QuestionGenerator from "@/components/Exam/QuestionGenerator";
import ExamQuestion from "@/components/Exam/ExamQuestion";
import AIAssistantButton from "@/components/AIAssistant/AIAssistantButton";
import AIAssistantDialog from "@/components/AIAssistant/AIAssistantDialog";

const EXAM_DURATION = 60; // minutes

const Exam = () => {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("practice");
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examCompleted, setExamCompleted] = useState(false);
  
  // AI Assistant
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  const handleStartExam = () => {
    if (!selectedSubject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject to continue",
        variant: "destructive",
      });
      return;
    }
    
    // For a real app, this would navigate to the exam page
    // For now, we'll open the question generator
    setGeneratorOpen(true);
  };
  
  const handleQuestionsGenerated = (questions: any[]) => {
    setExamQuestions(questions);
    setExamStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setExamCompleted(false);
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
      // On last question, finish the exam
      handleFinishExam();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleFinishExam = () => {
    // Calculate score
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
    
    setExamCompleted(true);
  };
  
  const currentQuestion = examQuestions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {!examStarted ? (
          // Exam setup screen
          <section className="py-10 md:py-16 bg-secondary/30">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                  <ClipboardList className="mr-1 size-3.5" />
                  <span>Test Your Knowledge</span>
                </div>
                
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                  Mock Exams
                </h1>
                
                <p className="max-w-[700px] text-muted-foreground md:text-lg">
                  Practice with realistic exams based on past national exam questions.
                  Test your knowledge and track your progress.
                </p>
              </div>
              
              <div className="mx-auto max-w-3xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {examType === "practice" ? (
                        <>
                          <Check className="mr-2 size-5 text-primary" />
                          Practice Mode
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 size-5 text-primary" />
                          Timed Exam
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {examType === "practice" 
                        ? "Take your time to answer questions and see explanations for each answer. Great for learning and practicing at your own pace."
                        : `Simulate the real exam experience with timed conditions. You will have ${EXAM_DURATION} minutes to complete the exam.`
                      }
                    </p>
                    
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Select Subject
                        </label>
                        <select
                          className="w-full rounded-md border border-input bg-background p-2"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                          <option value="">Select a subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Number of Questions
                        </label>
                        <select
                          className="w-full rounded-md border border-input bg-background p-2"
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Number(e.target.value))}
                        >
                          <option value="5">5 questions</option>
                          <option value="10">10 questions</option>
                          <option value="15">15 questions</option>
                          <option value="20">20 questions</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="space-x-2">
                          <button
                            className={`px-3 py-1 rounded-full ${examType === "practice" ? "bg-primary text-white" : "bg-secondary"}`}
                            onClick={() => setExamType("practice")}
                          >
                            Practice
                          </button>
                          <button
                            className={`px-3 py-1 rounded-full ${examType === "timed" ? "bg-primary text-white" : "bg-secondary"}`}
                            onClick={() => setExamType("timed")}
                          >
                            Timed
                          </button>
                        </div>
                      </div>
                      
                      <Button onClick={handleStartExam} className="mt-2">
                        Generate Questions <Brain className="ml-2 size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        ) : (
          // Exam in progress
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
                
                {currentQuestion && (
                  <ExamQuestion
                    question={currentQuestion}
                    selectedAnswer={answers[currentQuestion.id] || null}
                    onSelectAnswer={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
                    showCorrectAnswer={examCompleted}
                    questionNumber={currentQuestionIndex + 1}
                  />
                )}
                
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
                      onClick={() => setExamStarted(false)}
                      variant="default"
                    >
                      Back to Exams
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Recent Exams section - only show when not in an active exam */}
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
                {/* If there were real exam data, we'd map over it here */}
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
      <QuestionGenerator 
        open={generatorOpen} 
        onOpenChange={setGeneratorOpen}
        onQuestionsGenerated={handleQuestionsGenerated}
        questionCount={questionCount}
      />
      
      <Footer />
    </div>
  );
};

export default Exam;
