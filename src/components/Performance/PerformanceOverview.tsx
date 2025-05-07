
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjects } from "@/utils/subjects";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Activity, Trophy, CalendarDays, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface PerformanceOverviewProps {
  userId?: string;
}

const PerformanceOverview = ({ userId }: PerformanceOverviewProps) => {
  const { recentExams } = useAppContext();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // Filter exams to only show those belonging to the current user
  const userExams = React.useMemo(() => {
    return recentExams.filter(exam => {
      // If exam has a user_id, check if it matches current user
      // If exam doesn't have a user_id (legacy data), include it if current user matches userId prop
      return (!exam.user_id && userId === user?.id) || (exam.user_id === userId);
    });
  }, [recentExams, userId, user]);

  // Calculate overall statistics for user-specific exams
  const totalExams = userExams.length;
  const averageScore = totalExams > 0
    ? userExams.reduce((acc, exam) => acc + (exam.score / exam.totalQuestions) * 100, 0) / totalExams
    : 0;
  
  // Format for the exam history chart - user specific
  const examHistoryData = userExams
    .slice(0, 10)
    .map((exam) => {
      const subjectName = subjects.find((s) => s.id === exam.subject)?.name || exam.subject;
      return {
        name: subjectName,
        score: Math.round((exam.score / exam.totalQuestions) * 100),
        fullMark: 100,
        date: formatDistanceToNow(new Date(exam.date), { addSuffix: true }),
      };
    })
    .reverse();

  // Prepare data for subject distribution pie chart - user specific
  const subjectDistribution = userExams.reduce((acc, exam) => {
    acc[exam.subject] = (acc[exam.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(subjectDistribution).map(([subject, count]) => ({
    name: subjects.find((s) => s.id === subject)?.name || subject,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("performance.stats.totalExams")}
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">
              {t("performance.stats.examsTaken")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("performance.stats.averageScore")}
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {t("performance.stats.acrossAllExams")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("performance.stats.highestScore")}
            </CardTitle>
            <Trophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userExams.length > 0
                ? Math.max(
                    ...userExams.map((exam) => Math.round((exam.score / exam.totalQuestions) * 100))
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {t("performance.stats.bestPerformance")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("performance.stats.recentTrend")}
            </CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userExams.length >= 2 
                ? ((userExams[0].score / userExams[0].totalQuestions) > 
                   (userExams[1].score / userExams[1].totalQuestions)
                    ? "↗️" : "↘️") 
                : "―"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("performance.stats.comparedToLast")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exam history chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t("performance.charts.examHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {examHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value}%`,
                      t("performance.charts.score"),
                    ]}
                    labelFormatter={(value) => {
                      const item = examHistoryData.find((d) => d.name === value);
                      return `${value} (${item?.date})`;
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="#8884d8"
                    animationDuration={1000}
                    name={t("performance.charts.score")}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t("performance.noData")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("performance.charts.subjectDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        value,
                        t("performance.charts.exams"),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">{t("performance.noData")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("performance.recentExams.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {userExams.length > 0 ? (
                userExams.map((exam) => {
                  const subjectName = subjects.find((s) => s.id === exam.subject)?.name || exam.subject;
                  const scorePercentage = Math.round((exam.score / exam.totalQuestions) * 100);
                  
                  return (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{subjectName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(exam.date), { addSuffix: true })}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        scorePercentage >= 80
                          ? "text-green-500"
                          : scorePercentage >= 60
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}>
                        {scorePercentage}%
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("performance.noExams")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceOverview;
