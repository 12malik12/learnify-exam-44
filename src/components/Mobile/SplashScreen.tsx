
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen = ({ onFinish, duration = 2000 }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red animate-pulse" />
        <h1 className="text-2xl font-bold">{t("app.name")}</h1>
        <p className="text-muted-foreground">{language === "en" ? "Ethiopian National Exam Prep" : "የኢትዮጵያ ብሔራዊ ፈተና ዝግጅት"}</p>
      </div>
    </div>
  );
};

export default SplashScreen;
