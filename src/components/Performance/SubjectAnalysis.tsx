
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subjects } from "@/utils/subjects";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Legend,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const SubjectAnalysis = () => {
  const { recentExams, subjectProgress } = useAppContext();
  const { t } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState(
    subjects.length > 0 ? subjects[0].id : ""
  );

  // Calculate subject performance data for radar chart
  const subjectsWithExams = subjects.filter((subject) =>
    recentExams.some((exam) => exam.subject === subject.id)
  );

  const radarData = subjectsWithExams.map((subject) => {
    const subjectExams = recentExams.filter((exam) => exam.subject === subject.id);
    const averageScore =
      subjectExams.reduce(
        (acc, exam) => acc + (exam.score / exam.totalQuestions) * 100,
        0
      ) / (subjectExams.length || 1);

    return {
      subject: subject.name,
      score: Math.round(averageScore),
      fullMark: 100,
    };
  });

  // Get exams for the selected subject
  const filteredExams = recentExams
    .filter((exam) => exam.subject === selectedSubject)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Create trend data for the selected subject
  const trendData = filteredExams.map((exam, index) => ({
    name: `Exam ${index + 1}`,
    score: Math.round((exam.score / exam.totalQuestions) * 100),
    date: formatDistanceToNow(new Date(exam.date), { addSuffix: true }),
  }));

  // Calculate statistics for the selected subject
  const examCount = filteredExams.length;
  const averageScore =
    filteredExams.reduce(
      (acc, exam) => acc + (exam.score / exam.totalQuestions) * 100,
      0
    ) / (examCount || 1);
  
  const highestScore = examCount
    ? Math.max(
        ...filteredExams.map((exam) =>
          Math.round((exam.score / exam.totalQuestions) * 100)
        )
      )
    : 0;
  
  const lowestScore = examCount
    ? Math.min(
        ...filteredExams.map((exam) =>
          Math.round((exam.score / exam.totalQuestions) * 100)
        )
      )
    : 0;

  // Get progress for the selected subject
  const progress = subjectProgress[selectedSubject] || 0;

  return (
    <div className="space-y-6">
      {/* Subject selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t("performance.subjectAnalysis.selectSubject")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder={t("performance.subjectAnalysis.selectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics for selected subject */}
      {selectedSubject && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("performance.subjectAnalysis.examsCompleted")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{examCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("performance.subjectAnalysis.averagePerformance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("performance.subjectAnalysis.highestScore")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highestScore}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("performance.subjectAnalysis.lowestScore")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowestScore}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress in the subject */}
          <Card>
            <CardHeader>
              <CardTitle>{t("performance.subjectAnalysis.progress")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("performance.subjectAnalysis.completionRate")}
                  </span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Performance trend for selected subject */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("performance.subjectAnalysis.performanceTrend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        labelFormatter={(value) => {
                          const item = trendData.find((d) => d.name === value);
                          return `${value} (${item?.date})`;
                        }}
                        formatter={(value) => [`${value}%`, t("performance.charts.score")]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name={t("performance.charts.score")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      {t("performance.subjectAnalysis.noExams")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Radar chart for all subjects */}
      <Card>
        <CardHeader>
          <CardTitle>{t("performance.subjectAnalysis.subjectComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name={t("performance.charts.score")}
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, t("performance.charts.score")]} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t("performance.noData")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectAnalysis;
