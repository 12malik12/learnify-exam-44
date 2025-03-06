
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { useAppContext } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceOverview from "@/components/Performance/PerformanceOverview";
import SubjectAnalysis from "@/components/Performance/SubjectAnalysis";
import StudyRecommendations from "@/components/Performance/StudyRecommendations";
import { BookText, Activity, Lightbulb } from "lucide-react";

const Performance = () => {
  const { recentExams, subjectProgress } = useAppContext();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect to exams page if no exam history
  React.useEffect(() => {
    if (recentExams.length === 0) {
      navigate("/exam");
    }
  }, [recentExams, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <Activity className="mr-1 size-3.5" />
                <span>{t("performance.title")}</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                {t("performance.heading")}
              </h1>

              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                {t("performance.subtitle")}
              </p>
            </div>

            <Tabs defaultValue="overview" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center justify-center gap-2">
                  <Activity className="size-4" />
                  <span className="hidden sm:inline">{t("performance.tabs.overview")}</span>
                </TabsTrigger>
                <TabsTrigger value="subjects" className="flex items-center justify-center gap-2">
                  <BookText className="size-4" />
                  <span className="hidden sm:inline">{t("performance.tabs.subjects")}</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center justify-center gap-2">
                  <Lightbulb className="size-4" />
                  <span className="hidden sm:inline">{t("performance.tabs.recommendations")}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <PerformanceOverview />
              </TabsContent>

              <TabsContent value="subjects" className="mt-6">
                <SubjectAnalysis />
              </TabsContent>

              <TabsContent value="recommendations" className="mt-6">
                <StudyRecommendations />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Performance;
