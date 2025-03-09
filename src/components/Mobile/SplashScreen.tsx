
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen = ({ onFinish, duration = 2000 }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

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
        <h1 className="text-2xl font-bold">Learnify Exam</h1>
        <p className="text-muted-foreground">Ethiopian National Exam Prep</p>
      </div>
    </div>
  );
};

export default SplashScreen;
