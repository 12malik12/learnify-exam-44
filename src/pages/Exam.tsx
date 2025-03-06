
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { subjects } from "@/utils/subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Check, ClipboardList, Clock, BarChart } from "lucide-react";

const EXAM_DURATION = 60; // minutes

const Exam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("practice");
  
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
    // For now, we'll just show a toast
    toast({
      title: "Exam Started",
      description: `You've started a ${examType} exam for ${
        subjects.find((s) => s.id === selectedSubject)?.name
      }`,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
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
              <Tabs defaultValue="practice" onValueChange={setExamType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="practice">Practice Mode</TabsTrigger>
                  <TabsTrigger value="timed">Timed Exam</TabsTrigger>
                </TabsList>
                
                <TabsContent value="practice">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Check className="mr-2 size-5 text-primary" />
                        Practice Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Take your time to answer questions and see explanations for each answer.
                        Great for learning and practicing at your own pace.
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
                            defaultValue="10"
                          >
                            <option value="5">5 questions</option>
                            <option value="10">10 questions</option>
                            <option value="20">20 questions</option>
                            <option value="30">30 questions</option>
                          </select>
                        </div>
                        
                        <Button onClick={handleStartExam} className="mt-2">
                          Start Practice <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="timed">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 size-5 text-primary" />
                        Timed Exam
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Simulate the real exam experience with timed conditions. 
                        You will have {EXAM_DURATION} minutes to complete the exam.
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
                            Exam Type
                          </label>
                          <select
                            className="w-full rounded-md border border-input bg-background p-2"
                            defaultValue="mini"
                          >
                            <option value="mini">Mini Exam (30 min)</option>
                            <option value="full">Full Exam (60 min)</option>
                            <option value="past">Past Paper (2022)</option>
                            <option value="custom">Custom Exam</option>
                          </select>
                        </div>
                        
                        <Button onClick={handleStartExam} className="mt-2">
                          Start Timed Exam <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* Recent Exams */}
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Exam;
