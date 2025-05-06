
import React, { createContext, useContext, useState, useEffect } from "react";
import { subjects, Subject } from "@/utils/subjects";
import { useAuth } from "@/context/AuthContext";

interface AppContextType {
  loading: boolean;
  activeSubject: Subject | null;
  subjectProgress: Record<string, number>;
  recentExams: {
    id: string;
    subject: string;
    score: number;
    date: string;
    totalQuestions: number;
    user_id?: string;  // Add user_id field to track exam ownership
    offlineGenerated?: boolean;
  }[];
  setActiveSubject: (subject: Subject | null) => void;
  updateSubjectProgress: (subjectId: string, progress: number) => void;
  addExamResult: (
    subjectId: string,
    score: number,
    totalQuestions: number,
    offlineGenerated?: boolean
  ) => void;
}

const defaultContextValue: AppContextType = {
  loading: true,
  activeSubject: null,
  subjectProgress: {},
  recentExams: [],
  setActiveSubject: () => {},
  updateSubjectProgress: () => {},
  addExamResult: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>(
    {}
  );
  const [recentExams, setRecentExams] = useState<
    {
      id: string;
      subject: string;
      score: number;
      date: string;
      totalQuestions: number;
      user_id?: string;  // Add user_id field to track exam ownership
      offlineGenerated?: boolean;
    }[]
  >([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Load subject progress
      const savedProgress = localStorage.getItem("subjectProgress");
      if (savedProgress) {
        setSubjectProgress(JSON.parse(savedProgress));
      } else {
        // Initialize with default values
        const initialProgress: Record<string, number> = {};
        subjects.forEach((subject) => {
          initialProgress[subject.id] = 0;
        });
        setSubjectProgress(initialProgress);
        localStorage.setItem("subjectProgress", JSON.stringify(initialProgress));
      }

      // Load recent exams
      const savedExams = localStorage.getItem("recentExams");
      if (savedExams) {
        setRecentExams(JSON.parse(savedExams));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading app data:", error);
      setLoading(false);
    }
  }, []);

  // Update subject progress
  const updateSubjectProgress = (subjectId: string, progress: number) => {
    setSubjectProgress((prev) => {
      const updated = { ...prev, [subjectId]: progress };
      localStorage.setItem("subjectProgress", JSON.stringify(updated));
      return updated;
    });
  };

  // Add exam result
  const addExamResult = (
    subjectId: string,
    score: number,
    totalQuestions: number,
    offlineGenerated: boolean = false
  ) => {
    const newExam = {
      id: Date.now().toString(),
      subject: subjectId,
      score,
      date: new Date().toISOString(),
      totalQuestions,
      user_id: user?.id,  // Store the user ID with the exam
      offlineGenerated
    };

    setRecentExams((prev) => {
      const updated = [newExam, ...prev].slice(0, 10); // Keep only 10 most recent
      localStorage.setItem("recentExams", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        activeSubject,
        subjectProgress,
        recentExams,
        setActiveSubject,
        updateSubjectProgress,
        addExamResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
