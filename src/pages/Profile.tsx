
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Loader2,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { subjects } from "@/utils/subjects";
import { useUserData } from "@/hooks/use-user-data";
import { formatDistanceToNow } from "date-fns";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    isLoading, 
    profile, 
    activities, 
    progress: subjectProgress, 
    stats,
    error,
    refreshData
  } = useUserData();
  
  const handleRefresh = async () => {
    toast.promise(refreshData(), {
      loading: "Refreshing your profile data...",
      success: "Profile data updated successfully",
      error: "Failed to refresh data"
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your profile data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                Error Loading Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <Button onClick={refreshData}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get initials for avatar
  const getInitials = () => {
    if (!profile?.display_name) {
      // If no display name, use email initials if available
      if (user?.email) {
        return user.email.substring(0, 2).toUpperCase();
      }
      return "U";
    }
    return profile.display_name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Calculate stats
  const overallProgress = stats?.overallProgress || 0;
  const mostActiveSubjectName = stats?.mostActiveSubject?.name || "None";
  const timeSpent = stats?.studyTime || 0; // hours
  const completedExams = stats?.totalExams || 0;
  
  // Format study time
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  
  // Get display name - use email if no display name is set
  const displayName = profile?.display_name || user?.email || "Student";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={displayName} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
                  <p className="text-muted-foreground">{profile?.grade || "Grade 12"} • {profile?.location || "Addis Ababa"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 w-4 h-4" /> Refresh Data
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="w-4 h-4" />
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
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{mostActiveSubjectName}</div>
                  <p className="text-xs text-muted-foreground">Most Active Subject</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{formatStudyTime(timeSpent)}</div>
                  <p className="text-xs text-muted-foreground">Study Time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
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
                      {subjectProgress.length > 0 ? (
                        subjectProgress.slice(0, 5).map((subjectData) => {
                          const subject = subjects.find(s => s.id === subjectData.subject_id);
                          if (!subject) return null;
                          
                          return (
                            <div key={subjectData.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{subject.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {subjectData.progress}%
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{
                                    width: `${subjectData.progress}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No progress data yet. Start studying to track your progress!</p>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate("/performance")}>
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
                      {activities.length > 0 ? (
                        activities.slice(0, 3).map((activity) => {
                          const subject = activity.subject_id ? 
                            subjects.find(s => s.id === activity.subject_id)?.name : 
                            null;
                          
                          let icon = BookOpen;
                          if (activity.activity_type === 'exam_completed') {
                            icon = Award;
                          } else if (activity.activity_type === 'resource_downloaded') {
                            icon = Download;
                          }
                          
                          const Icon = icon;
                          
                          return (
                            <div key={activity.id} className="flex items-start gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {activity.activity_type === 'exam_completed' ? 'Completed Exam' : 
                                   activity.activity_type === 'topic_started' ? 'Started New Topic' :
                                   'Downloaded Resource'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No activities yet. Start studying!</p>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate("/performance")}>
                      <RefreshCw className="mr-2 h-3.5 w-3.5" /> View All Activities
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
                      <Bell className="h-5 w-5 text-muted-foreground" />
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
                      <Download className="h-5 w-5 text-muted-foreground" />
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
                      <User className="h-5 w-5 text-muted-foreground" />
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
