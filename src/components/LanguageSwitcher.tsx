
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1.5"
      onClick={toggleLanguage}
      aria-label="Toggle language"
    >
      <Globe className="size-4" />
      <span>{language === "en" ? "አማርኛ" : "English"}</span>
    </Button>
  );
};

export default LanguageSwitcher;
