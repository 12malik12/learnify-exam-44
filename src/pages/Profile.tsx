
import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import {
  BarChart3,
  Award,
  Clock,
  BookOpen,
  Settings,
  Download,
  Upload,
  Bell,
  RefreshCw,
  User,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { subjects } from "@/utils/subjects";

const Profile = () => {
  const { subjectProgress, recentExams } = useAppContext();
  
  // Calculate overall progress
  const overallProgress = Object.values(subjectProgress).reduce(
    (acc, progress) => acc + progress,
    0
  ) / Object.values(subjectProgress).length;
  
  // Calculate most active subject
  const mostActiveSubject = Object.entries(subjectProgress).reduce(
    (max, [id, progress]) => (progress > max.progress ? { id, progress } : max),
    { id: "", progress: 0 }
  );
  
  const mostActiveSubjectName = subjects.find(
    (s) => s.id === mostActiveSubject.id
  )?.name || "None";
  
  // Mock data for demonstration
  const timeSpent = 24; // hours
  const completedExams = recentExams.length || 5;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="size-16 md:size-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    SE
                  </div>
                  <div className="absolute bottom-0 right-0 size-5 rounded-full bg-ethiopia-green text-white flex items-center justify-center">
                    <Check className="size-3" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Student Explorer</h1>
                  <p className="text-muted-foreground">Grade 12 • Addis Ababa</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  <Upload className="mr-2 size-4" /> Export Data
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Overview */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="size-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="size-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{mostActiveSubjectName}</div>
                  <p className="text-xs text-muted-foreground">Most Active Subject</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="size-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{timeSpent}h</div>
                  <p className="text-xs text-muted-foreground">Study Time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Award className="size-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{completedExams}</div>
                  <p className="text-xs text-muted-foreground">Exams Completed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Recent Activity & Subject Progress */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subject Progress */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Subject Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subjects.slice(0, 5).map((subject) => (
                        <div key={subject.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{subject.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {subjectProgress[subject.id] || 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${subjectProgress[subject.id] || 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      View All Subjects
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                          <Award className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Completed Exam</p>
                          <p className="text-xs text-muted-foreground">
                            Physics Timed Exam - 80%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Today, 10:30 AM
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                          <BookOpen className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Started New Topic</p>
                          <p className="text-xs text-muted-foreground">
                            Chemistry - Organic Compounds
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Yesterday, 3:15 PM
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                          <Download className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Downloaded Resource</p>
                          <p className="text-xs text-muted-foreground">
                            Math Formula Sheet PDF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2 days ago, 5:45 PM
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <RefreshCw className="mr-2 size-3.5" /> Load More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Settings & Preferences */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Settings & Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="size-5 text-muted-foreground" />
                      <span>Notifications</span>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="notifications"
                        defaultChecked
                        className="h-4 w-4 rounded border-muted-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="size-5 text-muted-foreground" />
                      <span>Offline Access</span>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        id="offline"
                        defaultChecked
                        className="h-4 w-4 rounded border-muted-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-5 text-muted-foreground" />
                      <span>Account Information</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Profile;
