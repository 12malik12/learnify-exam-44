
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface LanguageContextType {
  language: "en" | "am";
  toggleLanguage: () => void;
  t: (key: string, vars?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<"en" | "am">("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage === "am" ? "am" : "en");
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "am" : "en"));
    localStorage.setItem("language", language === "en" ? "am" : "en");
  }, [language]);

  // Update the type definition to allow for nested structures
  type TranslationValue = 
    | string 
    | Record<string, string | Record<string, string>>;

  interface TranslationValues {
    [key: string]: TranslationValue;
  }

  const translations: Record<string, TranslationValues> = {
    en: {
      "app.slogan": "The Future of Education",
      "home.hero.new": "New: AI-Powered Learning Platform",
      "home.hero.new.short": "New!",
      "home.hero.title": "Unlock Your Potential",
      "home.hero.subtitle":
        "Revolutionary platform that makes learning easy and fun. Start your journey today!",
      "home.hero.start": "Get Started",
      "home.hero.tryExams": "Try Mock Exams",
      "subjects.title": "Explore Subjects",
      "subjects.search": "Search for subjects...",
      "subjects.card.lessons": "Lessons",
      "subjects.card.practice": "Practice",
      "subjects.card.exams": "Exams",
      "exam.title": "Mock Exams",
      "exam.description":
        "Test your knowledge and track your progress with realistic exams based on past national exam questions.",
      "profile.title": "Your Profile",
      "profile.edit": "Edit Profile",
      "profile.logout": "Logout",
      "profile.name": "Name",
      "profile.email": "Email",
      "profile.update": "Update Profile",
      "performance.title": "Performance Analysis",
      "performance.heading": "Track Your Progress",
      "performance.subtitle":
        "Analyze your exam results and identify weak areas to improve your score.",
      "performance.tabs.overview": "Overview",
      "performance.tabs.subjects": "Subjects",
      "performance.tabs.recommendations": "Recommendations",
      "performance.stats.totalExams": "Total Exams",
      "performance.stats.examsTaken": "exams taken",
      "performance.stats.averageScore": "Average Score",
      "performance.stats.acrossAllExams": "across all exams",
      "performance.stats.highestScore": "Highest Score",
      "performance.stats.bestPerformance": "best performance",
      "performance.stats.recentTrend": "Recent Trend",
      "performance.stats.comparedToLast": "compared to last exam",
      "performance.charts.examHistory": "Exam History",
      "performance.charts.score": "Score",
      "performance.charts.subjectDistribution": "Subject Distribution",
      "performance.charts.exams": "Exams",
      "performance.noData": "No data available",
      "performance.noExams": "No exams taken yet",
      "performance.recentExams.title": "Recent Exams",
      "performance.subjectAnalysis.selectSubject": "Select Subject",
      "performance.subjectAnalysis.selectPlaceholder": "Select a subject",
      "performance.subjectAnalysis.examsCompleted": "Exams Completed",
      "performance.subjectAnalysis.averagePerformance": "Average Performance",
      "performance.subjectAnalysis.highestScore": "Highest Score",
      "performance.subjectAnalysis.lowestScore": "Lowest Score",
      "performance.subjectAnalysis.progress": "Subject Progress",
      "performance.subjectAnalysis.completionRate": "Completion Rate",
      "performance.subjectAnalysis.performanceTrend": "Performance Trend",
      "performance.subjectAnalysis.noExams": "No exams taken for this subject",
      "performance.subjectAnalysis.subjectComparison": "Subject Comparison",
      "performance.recommendations.title": "Study Recommendations",
      "performance.recommendations.subtitle":
        "Personalized recommendations to improve your score.",
      "performance.recommendations.priority": "Priority",
      "performance.recommendations.weakSubject.title":
        "Focus on {subject}",
      "performance.recommendations.weakSubject.description":
        "{subject} is your weakest subject with a score of {score}%.",
      "performance.recommendations.weakSubject.action": "Practice {subject}",
      "performance.recommendations.improvementNeeded.title":
        "{subject} Needs Improvement",
      "performance.recommendations.improvementNeeded.description":
        "Your score in {subject} is {score}%. More practice needed.",
      "performance.recommendations.improvementNeeded.action":
        "Review {subject} Lessons",
      "performance.recommendations.regularPractice.title": "Regular Practice",
      "performance.recommendations.regularPractice.description":
        "Consistent practice is key to success. Take mock exams regularly.",
      "performance.recommendations.regularPractice.action": "Start an Exam",
      "performance.recommendations.allSubjects.title": "Study All Subjects",
      "performance.recommendations.allSubjects.description":
        "Ensure comprehensive preparation by studying all subjects.",
      "performance.recommendations.allSubjects.action": "Explore Subjects",
      "performance.recommendations.mastery.title": "Mastery Achieved",
      "performance.recommendations.mastery.description":
        "Congratulations! You have shown mastery in all subjects.",
      "performance.recommendations.mastery.action": "Revise All Topics",
      "ai.title": "AI Learning Assistant",
      "ai.description": "Ask questions about any subject or exam to get personalized help",
      "ai.placeholder": "Ask anything about your studies...",
      "ai.prompt": "How can I help with your studies today?",
      "ai.open": "Open AI Assistant",
      "nav.ai": "AI Assistant",
      nav: {
        home: "Home",
        subjects: "Subjects",
        exam: "Exams",
        profile: "Profile",
        ai: "AI Assistant",
      },
      ai: {
        title: "AI Study Assistant",
        description: "Your personal AI study companion. Ask questions, get explanations, and improve your understanding of any subject.",
        prompt: "Hello! I'm your AI study assistant. How can I help you today?",
        placeholder: "Ask me anything about your studies...",
        open: "Open AI Assistant",
        tabs: {
          chat: "Chat",
          suggestions: "Suggestions",
        },
        suggestion: {
          click: "Click to ask this question",
        },
      },
    },
    am: {
      "app.slogan": "የወደፊቱ ትምህርት",
      "app.name": "ኢትዮ ላርን",
      "app.name.short": "ኢትዮ ላርን",
      "home.hero.new": "አዲስ: በ AI የተጎላበተ የትምህርት መድረክ",
      "home.hero.new.short": "አዲስ!",
      "home.hero.title": "ችሎታህን ክፈት",
      "home.hero.subtitle":
        "አስተማሪ መድረክ ትምህርትን ቀላል እና አዝናኝ ያደርገዋል። ጉዞዎን ዛሬ ይጀምሩ!",
      "home.hero.start": "ይጀምሩ",
      "home.hero.tryExams": "የሙክ ፈተናዎችን ይሞክሩ",
      "home.subjects.title": "ትምህርቶችን ማሰስ",
      "home.subjects.subtitle": "ለእርስዎ አስፈላጊ የሆኑ ትምህርቶችን ያግኙ እና ይማሩ",
      "home.subjects.questions": "ጥያቄዎች",
      "home.subjects.study": "ማጥናት",
      "home.features.title": "አስደናቂ ባህሪያት",
      "home.features.subtitle": "ትምህርትን ለማሻሻል የተዘጋጁ ልዩ ባህሪያት",
      "home.cta.title": "ዛሬ ጉዞዎን ይጀምሩ",
      "home.cta.subtitle": "ሙሉ ድጋፍ ያለው ትምህርት ፕላትፎርም ያስሱ",
      "home.cta.browse": "ትምህርቶችን ያስሱ",
      "home.cta.take": "ፈተና ይውሰዱ",
      "subjects.title": "ትምህርቶችን ያስሱ",
      "subjects.subtitle": "ለእርስዎ አስፈላጊ የሆኑ ትምህርቶችን ያግኙ እና ይማሩ",
      "subjects.search": "ትምህርቶችን ይፈልጉ...",
      "subjects.card.lessons": "ትምህርቶች",
      "subjects.card.practice": "ልምምድ",
      "subjects.card.exams": "ፈተናዎች",
      "subjects.lessons": "ትምህርቶች",
      "subjects.progress": "እድገት",
      "subjects.studyNow": "አሁን ይማሩ",
      "subjects.none": "ምንም ትምህርቶች አልተገኙም",
      "exam.title": "የሙክ ፈተናዎች",
      "exam.description":
        "እውቀትዎን ይፈትሹ እና በእውነተኛ ፈተናዎች አማካኝነት እድገትዎን ይከታተሉ።",
      "profile.title": "የእርስዎ መገለጫ",
      "profile.edit": "መገለጫን ያርትዑ",
      "profile.logout": "ውጣ",
      "profile.name": "ስም",
      "profile.email": "ኢሜይል",
      "profile.update": "መገለጫን ያዘምኑ",
      "performance.title": "የአፈጻጸም ትንተና",
      "performance.heading": "እድገትዎን ይከታተሉ",
      "performance.subtitle":
        "የፈተና ውጤቶችዎን ይተንትኑ እና ውጤትዎን ለማሻሻል ደካማ ቦታዎችን ይለዩ።",
      "performance.tabs.overview": "አጠቃላይ እይታ",
      "performance.tabs.subjects": "ትምህርቶች",
      "performance.tabs.recommendations": "ምክሮች",
      "performance.stats.totalExams": "ጠቅላላ ፈተናዎች",
      "performance.stats.examsTaken": "የተወሰዱ ፈተናዎች",
      "performance.stats.averageScore": "አማካይ ውጤት",
      "performance.stats.acrossAllExams": "በሁሉም ፈተናዎች ላይ",
      "performance.stats.highestScore": "ከፍተኛ ውጤት",
      "performance.stats.bestPerformance": "ምርጥ አፈጻጸም",
      "performance.stats.recentTrend": "የቅርብ ጊዜ አዝማሚያ",
      "performance.stats.comparedToLast": "ካለፈው ፈተና ጋር ሲነጻጸር",
      "performance.charts.examHistory": "የፈተና ታሪክ",
      "performance.charts.score": "ውጤት",
      "performance.charts.subjectDistribution": "የትምህርት ስርጭት",
      "performance.charts.exams": "ፈተናዎች",
      "performance.noData": "ምንም መረጃ የለም",
      "performance.noExams": "እስካሁን ምንም ፈተናዎች አልተወሰዱም",
      "performance.recentExams.title": "የቅርብ ጊዜ ፈተናዎች",
      "performance.subjectAnalysis.selectSubject": "ትምህርት ይምረጡ",
      "performance.subjectAnalysis.selectPlaceholder": "ትምህርት ይምረጡ",
      "performance.subjectAnalysis.examsCompleted": "የተጠናቀቁ ፈተናዎች",
      "performance.subjectAnalysis.averagePerformance": "አማካይ አፈጻጸም",
      "performance.subjectAnalysis.highestScore": "ከፍተኛ ውጤት",
      "performance.subjectAnalysis.lowestScore": "ዝቅተኛ ውጤት",
      "performance.subjectAnalysis.progress": "የትምህርት እድገት",
      "performance.subjectAnalysis.completionRate": "የማጠናቀቂያ መጠን",
      "performance.subjectAnalysis.performanceTrend": "የአፈጻጸም አዝማሚያ",
      "performance.subjectAnalysis.noExams": "ለዚህ ትምህርት ምንም ፈተናዎች አልተወሰዱም",
      "performance.subjectAnalysis.subjectComparison": "የትምህርት ንጽጽር",
      "performance.recommendations.title": "የጥናት ምክሮች",
      "performance.recommendations.subtitle":
        "ውጤትዎን ለማሻሻል ለግል የተበጁ ምክሮች።",
      "performance.recommendations.priority": "ቅድሚያ",
      "performance.recommendations.weakSubject.title": "በ {subject} ላይ ያተኩሩ",
      "performance.recommendations.weakSubject.description":
        "{subject} የ {score}% ውጤት ጋር በጣም ደካማ ርዕሰ ጉዳይዎ ነው።",
      "performance.recommendations.weakSubject.action": "{subject} ን ይለማመዱ",
      "performance.recommendations.improvementNeeded.title":
        "{subject} መሻሻል ያስፈልገዋል",
      "performance.recommendations.improvementNeeded.description":
        "በ {subject} ውስጥ ያገኙት ውጤት {score}% ነው። ተጨማሪ ልምምድ ያስፈልጋል።",
      "performance.recommendations.improvementNeeded.action":
        "{subject} ትምህርቶችን ይገምግሙ",
      "performance.recommendations.regularPractice.title": "መደበኛ ልምምድ",
      "performance.recommendations.regularPractice.description":
        "ያለማቋረጥ መለማመድ ለስኬት ቁልፍ ነው። የሙክ ፈተናዎችን አዘውትረው ይውሰዱ።",
      "performance.recommendations.regularPractice.action": "ፈተና ይጀምሩ",
      "performance.recommendations.allSubjects.title": "ሁሉንም ትምህርቶች ያጠኑ",
      "performance.recommendations.allSubjects.description":
        "ሁሉንም ትምህርቶች በማጥናት አጠቃላይ ዝግጅትዎን ያረጋግጡ።",
      "performance.recommendations.allSubjects.action": "ትምህርቶችን ያስሱ",
      "performance.recommendations.mastery.title": "ብቃት ተገኝቷል",
      "performance.recommendations.mastery.description":
        "እንኳን ደስ አለዎት! በሁሉም ትምህርቶች ውስጥ ብቃት አሳይተዋል።",
      "performance.recommendations.mastery.action": "ሁሉንም ርዕሶች ይከልሱ",
      "nav.home": "መነሻ ገጽ",
      "nav.subjects": "ትምህርቶች",
      "nav.exams": "ፈተናዎች",
      "nav.profile": "መገለጫ",
      "footer.description": "በዘመናዊ ቴክኖሎጂ የላቀ የትምህርት ልምድ ይቅመሱ",
      "footer.resources": "ሀብቶች",
      "footer.materials": "የማጠኛ ቁሳቁሶች",
      "footer.company": "ኩባንያ",
      "footer.about": "ስለኛ",
      "footer.contact": "ያግኙን",
      "footer.privacy": "የግል መብት",
      "footer.copyright": "ሁሉም መብቶች የተጠበቁ ናቸው",
      "feature.ai.title": "በ AI የሚሰሩ ምክሮች",
      "feature.ai.description": "ለእርስዎ የሚሰሩ በግል የተበጁ የመማር ምክሮች ያግኙ",
      "feature.analytics.title": "የአፈጻጸም ትንተና",
      "feature.analytics.description": "ውጤቶችዎን ይከታተሉ እና ደካማ ቦታዎችን ያሻሽሉ",
      "feature.offline.title": "ከመስመር ውጪ ድጋፍ",
      "feature.offline.description": "ኢንተርኔት ቢሆንም ባይሆንም መማር ይቀጥሉ",
      "feature.questions.title": "10,000+ ጥያቄዎች",
      "feature.questions.description": "ለፈተና እንዲዘጋጁ ሰፊ ጥልቀት ያለው ይዘት",
      "feature.time.title": "የሙከራ ሰአት",
      "feature.time.description": "እውነተኛ ፈተናዎችን ማጓጓዣ ጊዜዎችን ይለማመዱ",
      "feature.language.title": "ባለ ሁለት ቋንቋ",
      "feature.language.description": "በእንግሊዝኛ ወይም በአማርኛ ይማሩ",
      "ai.title": "የ AI የመማሪያ ረዳት",
      "ai.description": "ስለማንኛውም ትምህርት ወይም ፈተና ጥያቄዎችን ይጠይቁ እና የግል እርዳታ ያግኙ",
      "ai.placeholder": "ስለ ጥናትዎ ማንኛውንም ነገር ይጠይቁ...",
      "ai.prompt": "ዛሬ ከጥናትዎ ጋር እንዴት ልረዳዎት እችላለሁ?",
      "ai.open": "የ AI ረዳትን ይክፈቱ",
      "nav.ai": "የ AI ረዳት",
      nav: {
        home: "መነሻ ገጽ",
        subjects: "ትምህርቶች",
        exam: "ፈተናዎች",
        profile: "መገለጫ",
        ai: "የሰው ሰራሽ ማስተርጓሚ",
      },
      ai: {
        title: "የሰው ሰራሽ ትምህርት ረዳት",
        description: "የእርስዎ የግል ሰው ሰራሽ የጥናት ጓደኛ። ጥያቄዎችን ይጠይቁ፣ ማብራሪያዎችን ያግኙ እና ማንኛውንም ርዕስ መረዳትዎን ያሻሽሉ።",
        prompt: "ሰላም! እኔ የእርስዎ AI ጥናት ረዳት ነኝ። ዛሬ እንዴት ልረዳዎት እችላለሁ?",
        placeholder: "ስለ ጥናትዎ ማንኛውንም ነገር ይጠይቁኝ...",
        open: "የሰው ሰራሽ ማስተርጓሚ ይክፈቱ",
        tabs: {
          chat: "መልእክት",
          suggestions: "አስተያየቶች",
        },
        suggestion: {
          click: "ይህን ጥያቄ ለመጠየቅ ጠቅ ያድርጉ",
        },
      },
    },
  };

  const t = (key: string, vars: { [key: string]: string | number } = {}): string => {
    // First split the key by dot to handle nested objects
    const parts = key.split('.');
    let translation: any = translations[language];
    
    // Navigate through the nested objects
    for (const part of parts) {
      if (!translation) return key;
      translation = translation[part];
    }
    
    // If we didn't find a translation or it's not a string/object, return the key
    if (translation === undefined || translation === null) return key;
    
    // Handle nested object translations (for complex structures)
    if (typeof translation === 'object') {
      // For specifically requested nested properties (using dot notation)
      // we'll return the value as a string, but for generally referenced
      // object nodes, we stringify the entire object
      return JSON.stringify(translation);
    }
    
    // Apply variable replacements
    let result = String(translation);
    for (const varKey in vars) {
      result = result.replace(`{${varKey}}`, String(vars[varKey]));
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
