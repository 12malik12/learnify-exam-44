
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subjects } from "@/utils/subjects";
import { ArrowRight, BookOpen, Brain, Clock, AlertTriangle, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Define proper types for recommendations
interface Recommendation {
  id: string;
  type: "critical" | "improvement" | "general" | "mastery";
  subject?: string;
  subjectName?: string;
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  action: string;
  priority: number;
  color: string;
}

const StudyRecommendations = () => {
  const { recentExams } = useAppContext();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing and loading of recommendations
    const timer = setTimeout(() => {
      generateRecommendations();
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [recentExams]);

  const generateRecommendations = () => {
    // Group exams by subject
    const examsBySubject: Record<string, typeof recentExams> = {};
    recentExams.forEach((exam) => {
      if (!examsBySubject[exam.subject]) {
        examsBySubject[exam.subject] = [];
      }
      examsBySubject[exam.subject].push(exam);
    });

    // Calculate average scores by subject
    const subjectScores: Record<string, number> = {};
    Object.entries(examsBySubject).forEach(([subjectId, exams]) => {
      const totalScore = exams.reduce(
        (acc, exam) => acc + (exam.score / exam.totalQuestions) * 100,
        0
      );
      subjectScores[subjectId] = totalScore / exams.length;
    });

    // Sort subjects by score (ascending) to prioritize weak areas
    const sortedSubjects = Object.entries(subjectScores)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .map(([subjectId, score]) => ({
        id: subjectId,
        name: subjects.find((s) => s.id === subjectId)?.name || subjectId,
        score,
      }));

    // Generate recommendations based on performance
    const newRecommendations: Recommendation[] = [];

    // 1. Weak subjects that need immediate attention
    const weakSubjects = sortedSubjects.filter((s) => s.score < 60);
    if (weakSubjects.length > 0) {
      weakSubjects.forEach((subject) => {
        newRecommendations.push({
          id: `weak-${subject.id}`,
          type: "critical",
          subject: subject.id,
          subjectName: subject.name,
          title: t("performance.recommendations.weakSubject.title", { subject: subject.name }),
          description: t("performance.recommendations.weakSubject.description", {
            score: Math.round(subject.score),
          }),
          icon: AlertTriangle,
          action: t("performance.recommendations.weakSubject.action"),
          priority: 1,
          color: "red",
        });
      });
    }

    // 2. Subjects that need improvement
    const improvementSubjects = sortedSubjects.filter(
      (s) => s.score >= 60 && s.score < 80
    );
    if (improvementSubjects.length > 0) {
      improvementSubjects.forEach((subject) => {
        newRecommendations.push({
          id: `improve-${subject.id}`,
          type: "improvement",
          subject: subject.id,
          subjectName: subject.name,
          title: t("performance.recommendations.improvementNeeded.title", {
            subject: subject.name,
          }),
          description: t("performance.recommendations.improvementNeeded.description", {
            score: Math.round(subject.score),
          }),
          icon: BarChart,
          action: t("performance.recommendations.improvementNeeded.action"),
          priority: 2,
          color: "yellow",
        });
      });
    }

    // 3. General practice recommendation
    newRecommendations.push({
      id: "general-practice",
      type: "general",
      title: t("performance.recommendations.regularPractice.title"),
      description: t("performance.recommendations.regularPractice.description"),
      icon: Clock,
      action: t("performance.recommendations.regularPractice.action"),
      priority: 3,
      color: "blue",
    });

    // 4. Study all subjects
    newRecommendations.push({
      id: "all-subjects",
      type: "general",
      title: t("performance.recommendations.allSubjects.title"),
      description: t("performance.recommendations.allSubjects.description"),
      icon: BookOpen,
      action: t("performance.recommendations.allSubjects.action"),
      priority: 4,
      color: "green",
    });

    // If user has good performance overall, add a mastery recommendation
    const goodPerformer = sortedSubjects.every((s) => s.score >= 80);
    if (goodPerformer && sortedSubjects.length > 0) {
      newRecommendations.push({
        id: "mastery",
        type: "mastery",
        title: t("performance.recommendations.mastery.title"),
        description: t("performance.recommendations.mastery.description"),
        icon: Brain,
        action: t("performance.recommendations.mastery.action"),
        priority: 0,
        color: "purple",
      });
    }

    // Sort by priority
    newRecommendations.sort((a, b) => a.priority - b.priority);
    setRecommendations(newRecommendations);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("performance.recommendations.title")}</CardTitle>
          <CardDescription>
            {t("performance.recommendations.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="w-full h-32 animate-pulse bg-muted" />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const Icon = rec.icon;
                return (
                  <Card key={rec.id} className="border-l-4" style={{ borderLeftColor: `var(--${rec.color}-500)` }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center">
                            <Icon className="mr-2 size-5" style={{ color: `var(--${rec.color}-500)` }} />
                            {rec.title}
                          </CardTitle>
                          {rec.type !== "general" && (
                            <Badge variant="outline" className="ml-7">
                              {rec.subjectName}
                            </Badge>
                          )}
                        </div>
                        {rec.type === "critical" && (
                          <Badge variant="destructive">
                            {t("performance.recommendations.priority")}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </CardContent>
                    <CardFooter>
                      {rec.subject ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          asChild
                        >
                          <Link to={`/exam?subject=${rec.subject}`}>
                            {rec.action} <ArrowRight className="ml-2 size-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          asChild
                        >
                          <Link to="/exam">
                            {rec.action} <ArrowRight className="ml-2 size-4" />
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("performance.noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyRecommendations;
