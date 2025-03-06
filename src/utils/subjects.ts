
export interface Subject {
  id: string;
  name: string;
  nameAm?: string;
  icon: string;
  color: string;
  description: string;
  numQuestions: number;
  numLessons: number;
}

export const subjects: Subject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    nameAm: "ሂሳብ",
    icon: "📊",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Algebra, geometry, calculus, and more to strengthen your mathematical foundation.",
    numQuestions: 250,
    numLessons: 24,
  },
  {
    id: "physics",
    name: "Physics",
    nameAm: "ፊዚክስ",
    icon: "⚛️",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Mechanics, electromagnetics, modern physics, and more for scientific understanding.",
    numQuestions: 185,
    numLessons: 18,
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameAm: "ኬሚስትሪ",
    icon: "🧪",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Organic, inorganic, physical chemistry, and more for scientific knowledge.",
    numQuestions: 210,
    numLessons: 20,
  },
  {
    id: "biology",
    name: "Biology",
    nameAm: "ባዮሎጂ",
    icon: "🧬",
    color: "bg-green-50 text-green-700 border-green-200",
    description: "Cell biology, genetics, ecology, and more to understand living organisms.",
    numQuestions: 195,
    numLessons: 19,
  },
  {
    id: "english",
    name: "English",
    nameAm: "እንግሊዘኛ",
    icon: "📝",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    description: "Grammar, vocabulary, reading comprehension, and writing skills.",
    numQuestions: 230,
    numLessons: 22,
  },
  {
    id: "amharic",
    name: "Amharic",
    nameAm: "አማርኛ",
    icon: "🔤",
    color: "bg-red-50 text-red-700 border-red-200",
    description: "Ethiopian national language including grammar, literature, and composition.",
    numQuestions: 200,
    numLessons: 20,
  },
  {
    id: "history",
    name: "History",
    nameAm: "ታሪክ",
    icon: "🏛️",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Ethiopian and world history, including key events and historical analysis.",
    numQuestions: 175,
    numLessons: 16,
  },
  {
    id: "geography",
    name: "Geography",
    nameAm: "ጂኦግራፊ",
    icon: "🌍",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    description: "Physical, human and regional geography of Ethiopia and the world.",
    numQuestions: 160,
    numLessons: 15,
  },
  {
    id: "civics",
    name: "Civics",
    nameAm: "ሲቪክስ",
    icon: "⚖️",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    description: "Citizenship, government, ethics, and democracy in the Ethiopian context.",
    numQuestions: 150,
    numLessons: 14,
  },
];
