
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    "app.name": "Learnify Ethiopia",
    "app.name.short": "Learnify",
    "app.slogan": "One Exam at a Time",

    // Navigation
    "nav.home": "Home",
    "nav.subjects": "Subjects",
    "nav.exams": "Exams",
    "nav.profile": "Profile",

    // Home page
    "home.hero.title": "Prepare for Your Future",
    "home.hero.subtitle": "The ultimate exam preparation app for Ethiopian 12th-grade students. Practice with past papers, track your progress, and excel in your national exams.",
    "home.hero.start": "Start Studying",
    "home.hero.tryExams": "Try Mock Exams",
    "home.hero.new": "The first Ethiopian national exam preparation platform",
    "home.hero.new.short": "New platform for students",
    "home.subjects.title": "Explore Subjects",
    "home.subjects.subtitle": "Choose from a variety of subjects covered in the Ethiopian national exam curriculum. Each subject includes comprehensive study materials and practice questions.",
    "home.subjects.study": "Study",
    "home.subjects.questions": "questions",
    "home.features.title": "Why Choose Learnify Ethiopia?",
    "home.features.subtitle": "Our app provides everything you need to excel in your national exams. Study smarter, not harder with our comprehensive features.",
    "home.cta.title": "Ready to start your exam preparation journey?",
    "home.cta.subtitle": "Begin studying today and take the first step towards achieving excellence in your national exams. Our comprehensive platform is designed to help you succeed.",
    "home.cta.browse": "Browse Subjects",
    "home.cta.take": "Take a Mock Exam",

    // Features section
    "feature.ai.title": "AI-Powered Learning",
    "feature.ai.description": "Get personalized study recommendations and adaptive quizzes based on your performance.",
    "feature.analytics.title": "Comprehensive Analytics",
    "feature.analytics.description": "Track your progress and identify areas for improvement with detailed performance insights.",
    "feature.offline.title": "Offline Access",
    "feature.offline.description": "Study anywhere, anytime, even without an internet connection with our offline mode.",
    "feature.questions.title": "Past Exam Questions",
    "feature.questions.description": "Practice with real national exam questions from previous years to build confidence.",
    "feature.time.title": "Time Management",
    "feature.time.description": "Learn to manage your time effectively with timed mock exams that simulate the real test.",
    "feature.language.title": "Multi-Language Support",
    "feature.language.description": "Study in both Amharic and English to improve your understanding of concepts.",

    // Subjects page
    "subjects.title": "Browse Study Materials",
    "subjects.subtitle": "Choose a subject to start learning and prepare for your exams with comprehensive study materials.",
    "subjects.search": "Search subjects...",
    "subjects.none": "No subjects found matching",
    "subjects.lessons": "lessons",
    "subjects.studyNow": "Study now",
    "subjects.progress": "Progress",
    
    // Footer
    "footer.resources": "Resources",
    "footer.about": "About Us",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.company": "Company",
    "footer.materials": "Study Materials",
    "footer.copyright": "All rights reserved.",
    "footer.description": "Helping Ethiopian students prepare for their national exams with personalized study resources, mock exams, and performance tracking.",
  },
  am: {
    // Common
    "app.name": "ለርኒፋይ ኢትዮጵያ",
    "app.name.short": "ለርኒፋይ",
    "app.slogan": "በእያንዳንዱ ፈተና አንድ በአንድ",

    // Navigation
    "nav.home": "መነሻ",
    "nav.subjects": "ትምህርቶች",
    "nav.exams": "ፈተናዎች",
    "nav.profile": "መገለጫ",

    // Home page
    "home.hero.title": "ለወደፊት ራስዎን ያዘጋጁ",
    "home.hero.subtitle": "ለኢትዮጵያ 12ኛ ክፍል ተማሪዎች የተሟላ የፈተና ዝግጅት መተግበሪያ። በቀድሞ ፈተናዎች ይለማመዱ፣ እድገትዎን ይከታተሉ እና በብሔራዊ ፈተናዎችዎ ይበልጡ።",
    "home.hero.start": "መማር ይጀምሩ",
    "home.hero.tryExams": "የሙከራ ፈተናዎችን ይሞክሩ",
    "home.hero.new": "የመጀመሪያው የኢትዮጵያ ብሔራዊ ፈተና ዝግጁነት መድረክ",
    "home.hero.new.short": "ለተማሪዎች አዲስ መድረክ",
    "home.subjects.title": "ትምህርቶችን ያስሱ",
    "home.subjects.subtitle": "በኢትዮጵያ ብሔራዊ ፈተና ሥርዓተ ትምህርት ውስጥ ከተካተቱት የተለያዩ ትምህርቶች ይምረጡ። እያንዳንዱ ትምህርት ሁሉን አቀፍ የጥናት ቁሳቁሶችን እና የልምምድ ጥያቄዎችን ያካትታል።",
    "home.subjects.study": "ማጥናት",
    "home.subjects.questions": "ጥያቄዎች",
    "home.features.title": "ለምን ለርኒፋይ ኢትዮጵያን ይመርጣሉ?",
    "home.features.subtitle": "የእኛ መተግበሪያ በብሔራዊ ፈተናዎችዎ ለመልካም ውጤት የሚያስፈልግዎትን ሁሉ ይሰጣል። ሰፊ ባህሪያችን ጋር በተሻለ ሁኔታ ይማሩ።",
    "home.cta.title": "የፈተና ዝግጅት ጉዞዎን ለመጀመር ዝግጁ ነዎት?",
    "home.cta.subtitle": "ዛሬ ማጥናት ይጀምሩ እና በብሔራዊ ፈተናዎችዎ ምርጥነትን ለማግኘት የመጀመሪያ እርምጃን ይውሰዱ። የእኛ ሁሉን አቀፍ መድረክ እርስዎ እንዲሳኩ ለማገዝ የተነደፈ ነው።",
    "home.cta.browse": "ትምህርቶችን ያስሱ",
    "home.cta.take": "የሙከራ ፈተና ይውሰዱ",

    // Features section
    "feature.ai.title": "በሰው ሰራሽ አእምሮ የተገነባ ትምህርት",
    "feature.ai.description": "በአፈጻጸምዎ ላይ የተመሠረተ ግላዊ የጥናት ምክሮችን እና ተስማሚ ጥያቄዎችን ያግኙ።",
    "feature.analytics.title": "ሁሉን አቀፍ ትንታኔዎች",
    "feature.analytics.description": "እድገትዎን ይከታተሉ እና ዝርዝር የአፈጻጸም ግንዛቤዎች ጋር ለማሻሻል የሚያስፈልጉ አካባቢዎችን ይለዩ።",
    "feature.offline.title": "ከመስመር ውጪ መዳረሻ",
    "feature.offline.description": "በኦፍላይን ሁነታችን ጋር ምንም ኢንተርኔት ባይኖርም ቢሆን በማንኛውም ቦታ፣ በማንኛውም ጊዜ ይማሩ።",
    "feature.questions.title": "የቀድሞ ፈተና ጥያቄዎች",
    "feature.questions.description": "ከቀድሞ ዓመታት ትክክለኛ ብሔራዊ ፈተና ጥያቄዎች ጋር ይለማመዱ እና የራስ እምነት ይገንቡ።",
    "feature.time.title": "የጊዜ አያያዝ",
    "feature.time.description": "እውነተኛውን ፈተና የሚመስሉ በሰዓት የተወሰኑ የሙከራ ፈተናዎች ጋር ጊዜዎን በውጤታማነት ለማስተዳደር ይማሩ።",
    "feature.language.title": "ባለብዙ ቋንቋ ድጋፍ",
    "feature.language.description": "በአማርኛ እና በእንግሊዝኛ ሁለቱንም ይማሩ እና የፅንሰ ሃሳቦችን ግንዛቤዎን ያሻሽሉ።",

    // Subjects page
    "subjects.title": "የጥናት ቁሳቁሶችን ያስሱ",
    "subjects.subtitle": "መማር ለመጀመር እና ለፈተናዎችዎ ከሁሉን አቀፍ የጥናት ቁሳቁሶች ጋር ለመዘጋጀት ትምህርት ይምረጡ።",
    "subjects.search": "ትምህርቶችን ይፈልጉ...",
    "subjects.none": "ምንም ትምህርቶች አልተገኙም",
    "subjects.lessons": "ትምህርቶች",
    "subjects.studyNow": "አሁን ያጥኑ",
    "subjects.progress": "እድገት",
    
    // Footer
    "footer.resources": "ግብዓቶች",
    "footer.about": "ስለ እኛ",
    "footer.contact": "ያግኙን",
    "footer.privacy": "የግላዊነት ፖሊሲ",
    "footer.company": "ኩባንያ",
    "footer.materials": "የጥናት ቁሳቁሶች",
    "footer.copyright": "መብቱ በህግ የተጠበቀ ነው።",
    "footer.description": "ኢትዮጵያውያን ተማሪዎች ለብሔራዊ ፈተናቸው በግላዊ የጥናት ግብዓቶች፣ የሙከራ ፈተናዎች እና የአፈጻጸም ክትትል እንዲዘጋጁ እየረዳን ነው።",
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || "en";
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "am" : "en"));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
