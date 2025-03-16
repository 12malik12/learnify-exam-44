
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define generic difficulty level guidelines
const DIFFICULTY_GUIDELINES = {
  easy: "Create a basic recall or fundamental understanding question that tests direct knowledge from the unit objective. The question should be straightforward with clear answer choices.",
  medium: "Create an application-based question that requires understanding concepts and applying them to slightly complex scenarios. The question should require some analysis.",
  hard: "Create a complex, multi-step problem-solving question that requires deep understanding and critical thinking. The question may combine multiple concepts from the unit objective."
};

// Define subject-specific difficulty guidelines
const SUBJECT_DIFFICULTY_GUIDELINES = {
  mathematics: {
    easy: "Create a direct recall question about mathematical formulas or a simple calculation problem. Focus on basic understanding of mathematical concepts with straightforward calculations.",
    medium: "Create a question that requires applying mathematical concepts to solve problems. Include calculations that require multiple steps but follow a clear logical path.",
    hard: "Create a complex multi-step mathematical problem that requires combining multiple concepts, formulas, or methods. The question should test deep understanding and advanced problem-solving skills."
  },
  physics: {
    easy: "Create a question about basic physics laws, concepts, or simple problem-solving with straightforward formulas. Focus on fundamental knowledge and simple calculations.",
    medium: "Create a question that requires application of physics formulas in different contexts or scenarios. Include problems requiring multiple-step calculations or understanding of interconnected concepts.",
    hard: "Create a complex physics problem requiring integration of multiple concepts, laws, or formulas. The question should involve advanced analysis and multi-step problem-solving."
  },
  chemistry: {
    easy: "Create a question about basic chemical concepts, formulas, or properties. Focus on fundamental knowledge and simple chemical relationships.",
    medium: "Create a question involving chemical reactions, balancing equations, or mid-level applications of chemical principles. Include moderate complexity in problem-solving.",
    hard: "Create a complex question about reaction mechanisms, multi-step synthesis, or advanced chemical concepts. The question should require deep understanding and analysis."
  },
  biology: {
    easy: "Create a question testing recall of biological terms, structures, or basic processes. Focus on fundamental biological knowledge and simple concepts.",
    medium: "Create a question about biological mechanisms, relationships between systems, or ecosystem interactions. Include moderate complexity and analysis.",
    hard: "Create a complex question about integrated biological systems, detailed processes, or advanced concepts. The question should require deep understanding and analysis."
  },
  english: {
    easy: "Create a question about basic grammar, vocabulary, or simple text comprehension. Focus on fundamental language skills and basic understanding.",
    medium: "Create a question requiring literary analysis, interpretation, or understanding contextual meaning. Include moderate complexity in analysis.",
    hard: "Create a complex question about literary criticism, advanced rhetorical analysis, or sophisticated composition concepts. The question should require deep analysis and understanding."
  },
  history: {
    easy: "Create a question about historical facts, dates, events, or key figures. Focus on basic historical knowledge and simple recall.",
    medium: "Create a question connecting historical events or understanding cause-effect relationships. Include analysis of historical contexts.",
    hard: "Create a complex question requiring historical analysis, evaluation of multiple perspectives, or historiographical understanding. The question should require deep critical thinking."
  },
  geography: {
    easy: "Create a question about basic geographical features, locations, or terminology. Focus on fundamental geographical knowledge.",
    medium: "Create a question about geographical patterns, relationships, or processes. Include analysis of geographical phenomena.",
    hard: "Create a complex question about geographical systems, global impacts, or detailed analysis. The question should require integration of multiple geographical concepts."
  }
};

// Define subject-specific formatting instructions
const SUBJECT_FORMATTING = {
  mathematics: "Use LaTeX notation for any mathematical expressions, formulas or equations. Format LaTeX expressions like this: $\\frac{a}{b}$ for fractions, $\\sqrt{x}$ for square roots, etc.",
  physics: "Use LaTeX notation for any physics formulas or equations. Include units where applicable. Format LaTeX expressions like this: $F = ma$ for force equals mass times acceleration.",
  chemistry: "Use proper chemical notation for compounds and reactions. For chemical equations, use proper subscripts and states of matter, e.g., 2H₂(g) + O₂(g) → 2H₂O(l)",
  biology: "Use proper biological terminology. For diagrams or structures that need to be identified, provide clear descriptions.",
  english: "Ensure grammar and vocabulary questions are clear and unambiguous. For literature questions, provide necessary context.",
  history: "Include relevant dates, events, and historical figures. Ensure factual accuracy in both questions and answers.",
  geography: "For map-based questions, provide clear descriptions. Include relevant terminology for physical or human geography concepts."
};

// Subject-specific question templates
const QUESTION_TEMPLATES = {
  mathematics: [
    {
      question: "What is the value of $\\frac{3x + 5}{2}$ when $x = 4$?",
      options: {
        A: "$\\frac{17}{2}$",
        B: "$6.5$",
        C: "$8.5$",
        D: "$\\frac{23}{2}$"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "Solve the equation $2x + 7 = 15$.",
      options: {
        A: "$x = 2$",
        B: "$x = 3$",
        C: "$x = 4$",
        D: "$x = 5$"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "Calculate the area of a rectangle with length 8 cm and width 6 cm.",
      options: {
        A: "14 cm²",
        B: "28 cm²",
        C: "48 cm²",
        D: "56 cm²"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "If $f(x) = 2x^2 - 3x + 1$, what is the value of $f(2)$?",
      options: {
        A: "3",
        B: "5",
        C: "7",
        D: "9"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "The sum of three consecutive integers is 72. What is the middle integer?",
      options: {
        A: "23",
        B: "24",
        C: "25",
        D: "26"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Find the derivative of $f(x) = x^3 - 4x^2 + 5x - 2$.",
      options: {
        A: "$f'(x) = 3x^2 - 8x + 5$",
        B: "$f'(x) = 3x^2 - 4x + 5$",
        C: "$f'(x) = 2x^2 - 8x + 5$",
        D: "$f'(x) = 3x^2 - 8x - 5$"
      },
      correct: "A",
      difficulty: "hard"
    },
    {
      question: "Solve the system of equations: $3x + 2y = 13$ and $5x - 3y = 7$.",
      options: {
        A: "$x = 3, y = 2$",
        B: "$x = 2, y = 3.5$",
        C: "$x = 4, y = 0.5$",
        D: "$x = 1, y = 5$"
      },
      correct: "A",
      difficulty: "hard"
    }
  ],
  physics: [
    {
      question: "Which of Newton's laws states that for every action, there is an equal and opposite reaction?",
      options: {
        A: "First Law",
        B: "Second Law",
        C: "Third Law",
        D: "Law of Conservation of Energy"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "What is the unit of force in the SI system?",
      options: {
        A: "Kilogram (kg)",
        B: "Newton (N)",
        C: "Joule (J)",
        D: "Watt (W)"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "A car accelerates from rest at $2.5 m/s^2$. How far will it travel in 10 seconds?",
      options: {
        A: "25 m",
        B: "125 m",
        C: "250 m",
        D: "100 m"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "What is the equivalent resistance of two resistors $R_1 = 6\\Omega$ and $R_2 = 3\\Omega$ connected in parallel?",
      options: {
        A: "$9\\Omega$",
        B: "$2\\Omega$",
        C: "$4.5\\Omega$",
        D: "$1.5\\Omega$"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "A projectile is launched at an angle of $45°$ with an initial velocity of $20 m/s$. What is its maximum height? (Use $g = 10 m/s^2$)",
      options: {
        A: "$5 m$",
        B: "$10 m$",
        C: "$15 m$",
        D: "$20 m$"
      },
      correct: "A",
      difficulty: "hard"
    },
    {
      question: "A mass of $0.5 kg$ oscillates on a spring with a period of $π$ seconds. What is the spring constant?",
      options: {
        A: "$0.5 N/m$",
        B: "$1 N/m$",
        C: "$2 N/m$",
        D: "$4 N/m$"
      },
      correct: "C",
      difficulty: "hard"
    }
  ],
  chemistry: [
    {
      question: "What is the product of the reaction: Na₂CO₃ + 2HCl → ?",
      options: {
        A: "NaCl + H₂O + CO₂",
        B: "2NaCl + H₂O + CO₂",
        C: "2NaCl + H₂CO₃",
        D: "Na₂Cl₂ + H₂O + CO₂"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "Which element has the electron configuration 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s¹?",
      options: {
        A: "Potassium (K)",
        B: "Rubidium (Rb)",
        C: "Cesium (Cs)",
        D: "Sodium (Na)"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "Calculate the pH of a 0.01 M HCl solution.",
      options: {
        A: "1",
        B: "2",
        C: "3",
        D: "4"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "What type of isomerism is exhibited by butane and 2-methylpropane?",
      options: {
        A: "Chain isomerism",
        B: "Position isomerism",
        C: "Functional group isomerism",
        D: "Geometric isomerism"
      },
      correct: "A",
      difficulty: "medium"
    },
    {
      question: "For the reaction 2NO(g) + O₂(g) → 2NO₂(g), if the rate of formation of NO₂ is 0.024 mol/L·s, what is the rate of consumption of O₂?",
      options: {
        A: "0.012 mol/L·s",
        B: "0.024 mol/L·s",
        C: "0.036 mol/L·s",
        D: "0.048 mol/L·s"
      },
      correct: "A",
      difficulty: "hard"
    },
    {
      question: "What is the hybridization and molecular geometry of the carbon atom in carbon dioxide (CO₂)?",
      options: {
        A: "sp, linear",
        B: "sp², trigonal planar",
        C: "sp², linear",
        D: "sp³, tetrahedral"
      },
      correct: "A",
      difficulty: "hard"
    }
  ],
  biology: [
    {
      question: "Which organelle is responsible for protein synthesis in the cell?",
      options: {
        A: "Nucleus",
        B: "Mitochondria",
        C: "Ribosome",
        D: "Golgi apparatus"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "What is the main function of the mitochondria in a cell?",
      options: {
        A: "Protein synthesis",
        B: "ATP production",
        C: "Lipid synthesis",
        D: "Cell division"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "During which phase of mitosis do chromosomes align at the equator of the cell?",
      options: {
        A: "Prophase",
        B: "Metaphase",
        C: "Anaphase",
        D: "Telophase"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "What would happen to a red blood cell placed in a hypotonic solution?",
      options: {
        A: "It would shrink",
        B: "It would swell and possibly lyse",
        C: "It would remain unchanged",
        D: "It would change color"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Which process in the Calvin cycle requires ATP?",
      options: {
        A: "Carbon fixation",
        B: "Reduction",
        C: "Regeneration of RuBP",
        D: "Release of glyceraldehyde-3-phosphate"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "In a dihybrid cross between two heterozygous individuals (AaBb × AaBb), what fraction of the offspring will be homozygous recessive for both traits?",
      options: {
        A: "1/4",
        B: "1/8",
        C: "1/16",
        D: "3/16"
      },
      correct: "C",
      difficulty: "hard"
    }
  ],
  english: [
    {
      question: "Which of the following is a proper noun?",
      options: {
        A: "mountain",
        B: "happiness",
        C: "London",
        D: "building"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "Which sentence uses the correct form of the verb?",
      options: {
        A: "The team are playing well.",
        B: "The team is playing well.",
        C: "The team been playing well.",
        D: "The team were been playing well."
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "Identify the literary device in the following sentence: 'The wind whispered through the trees.'",
      options: {
        A: "Simile",
        B: "Metaphor",
        C: "Personification",
        D: "Hyperbole"
      },
      correct: "C",
      difficulty: "medium"
    },
    {
      question: "What is the main theme of George Orwell's novel '1984'?",
      options: {
        A: "Romantic love",
        B: "Totalitarianism and surveillance",
        C: "Environmental conservation",
        D: "Family dynamics"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Analyze the rhetorical strategy used in Martin Luther King Jr.'s 'I Have a Dream' speech when he repeatedly uses the phrase 'I have a dream':",
      options: {
        A: "Ethos",
        B: "Pathos",
        C: "Anaphora",
        D: "Chiasmus"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "Which of the following best describes the narrative technique in Virginia Woolf's 'Mrs Dalloway'?",
      options: {
        A: "First-person narration",
        B: "Stream of consciousness",
        C: "Epistolary form",
        D: "Frame narrative"
      },
      correct: "B",
      difficulty: "hard"
    }
  ],
  history: [
    {
      question: "In which year did World War II end?",
      options: {
        A: "1939",
        B: "1943",
        C: "1945",
        D: "1950"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "Who was the first President of the United States?",
      options: {
        A: "Thomas Jefferson",
        B: "Abraham Lincoln",
        C: "George Washington",
        D: "John Adams"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "What was the immediate cause of World War I?",
      options: {
        A: "The sinking of the Lusitania",
        B: "The assassination of Archduke Franz Ferdinand",
        C: "The invasion of Poland",
        D: "The Treaty of Versailles"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Which economic policy was implemented during the Great Depression to stimulate economic recovery in the United States?",
      options: {
        A: "Laissez-faire economics",
        B: "The New Deal",
        C: "Reaganomics",
        D: "The Marshall Plan"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Analyze the impact of the Columbian Exchange on global demographics in the 16th and 17th centuries:",
      options: {
        A: "It led to significant population growth in the Americas",
        B: "It caused a population decline in Europe due to imported diseases",
        C: "It resulted in a significant decline of indigenous populations in the Americas",
        D: "It had no significant impact on global populations"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "Which historian is associated with the 'Great Man Theory' of history?",
      options: {
        A: "Karl Marx",
        B: "Thomas Carlyle",
        C: "Fernand Braudel",
        D: "Michel Foucault"
      },
      correct: "B",
      difficulty: "hard"
    }
  ],
  geography: [
    {
      question: "Which is the largest ocean on Earth?",
      options: {
        A: "Atlantic Ocean",
        B: "Indian Ocean",
        C: "Arctic Ocean",
        D: "Pacific Ocean"
      },
      correct: "D",
      difficulty: "easy"
    },
    {
      question: "Which continent is the least populated?",
      options: {
        A: "Antarctica",
        B: "Australia",
        C: "South America",
        D: "Africa"
      },
      correct: "A",
      difficulty: "easy"
    },
    {
      question: "What type of landform is created when a meander in a river is cut off from the main channel?",
      options: {
        A: "Delta",
        B: "Oxbow lake",
        C: "Mesa",
        D: "Fjord"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Which of the following is NOT a factor affecting climate?",
      options: {
        A: "Latitude",
        B: "Altitude",
        C: "Proximity to bodies of water",
        D: "Political boundaries"
      },
      correct: "D",
      difficulty: "medium"
    },
    {
      question: "Which of the following best explains the demographic transition model's stage 4?",
      options: {
        A: "High birth rates and high death rates",
        B: "High birth rates and falling death rates",
        C: "Low birth rates and low death rates",
        D: "Rising birth rates and low death rates"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "What is the primary cause of the monsoon climate in South and Southeast Asia?",
      options: {
        A: "Ocean currents",
        B: "Differential heating of land and water",
        C: "Mountain ranges",
        D: "The Coriolis effect"
      },
      correct: "B",
      difficulty: "hard"
    }
  ]
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, unitObjective, difficulty, count = 5 } = await req.json();
    
    if (!subject) {
      return new Response(
        JSON.stringify({ error: "Missing required subject parameter" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate difficulty level
    if (difficulty && !['easy', 'medium', 'hard', 'all'].includes(difficulty)) {
      return new Response(
        JSON.stringify({ error: "Invalid difficulty level. Must be 'easy', 'medium', 'hard', or 'all'" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate questions only from the selected subject
    let questions = [];
    const subjectLower = subject.toLowerCase();
    
    // Check if templates exist for this subject
    if (!QUESTION_TEMPLATES[subjectLower]) {
      return new Response(
        JSON.stringify({ 
          error: `No question templates available for subject: ${subject}`,
          questions: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (difficulty === 'all') {
      // If "all" is selected, generate questions from all difficulties for the selected subject
      // First, determine how many templates are available for each difficulty
      const easyTemplates = QUESTION_TEMPLATES[subjectLower].filter(t => t.difficulty === 'easy');
      const mediumTemplates = QUESTION_TEMPLATES[subjectLower].filter(t => t.difficulty === 'medium');
      const hardTemplates = QUESTION_TEMPLATES[subjectLower].filter(t => t.difficulty === 'hard');
      
      const totalTemplates = easyTemplates.length + mediumTemplates.length + hardTemplates.length;
      
      // Calculate proportions while respecting available templates
      const targetEasy = Math.floor(count / 3);
      const targetMedium = Math.floor(count / 3);
      const targetHard = count - targetEasy - targetMedium;
      
      // Generate questions based on available templates
      const easyQuestions = generateQuestionsForDifficulty(subjectLower, unitObjective, 'easy', targetEasy);
      const mediumQuestions = generateQuestionsForDifficulty(subjectLower, unitObjective, 'medium', targetMedium);
      const hardQuestions = generateQuestionsForDifficulty(subjectLower, unitObjective, 'hard', targetHard);
      
      questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      
      // Shuffle the questions to mix difficulty levels
      questions = shuffleArray(questions);
      
      // If we didn't get enough questions, reuse templates
      if (questions.length < count) {
        console.warn(`Reusing templates for ${subject} (all difficulties) to meet requested count of ${count} questions.`);
        questions = reuseCombinedTemplates(subjectLower, unitObjective, questions, count, totalTemplates);
      }
    } else {
      // Generate questions for the specific difficulty from the selected subject
      questions = generateQuestionsForDifficulty(subjectLower, unitObjective, difficulty, count);
      
      // If we didn't get enough questions, reuse templates
      const availableTemplates = QUESTION_TEMPLATES[subjectLower].filter(t => t.difficulty === difficulty).length;
      if (questions.length < count && availableTemplates > 0) {
        console.warn(`Reusing templates for ${subject} (${difficulty}) to meet requested count of ${count} questions.`);
        questions = reuseTemplates(subjectLower, unitObjective, difficulty, questions, count, availableTemplates);
      }
    }

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate questions", details: error.message, questions: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateQuestionsForDifficulty(subject, unitObjective, difficulty, count) {
  // Use templates only from the specified subject and difficulty
  const subjectTemplates = QUESTION_TEMPLATES[subject] || [];
  
  // Filter templates by difficulty
  const matchingTemplates = subjectTemplates.filter(template => template.difficulty === difficulty);
  
  // Limit count to available templates
  const finalCount = Math.min(count, matchingTemplates.length);
  
  if (finalCount === 0) {
    console.warn(`Warning: No templates available for ${subject} (${difficulty}).`);
    return [];
  }
  
  // Shuffle the matching templates to ensure random selection
  const shuffledTemplates = shuffleArray([...matchingTemplates]);
  
  // Generate questions from templates (limited to available templates)
  const questions = [];
  for (let i = 0; i < finalCount; i++) {
    const template = shuffledTemplates[i];
    
    questions.push({
      id: `question-${i+1}-${difficulty}-${subject}`,
      question_text: template.question,
      option_a: template.options.A,
      option_b: template.options.B,
      option_c: template.options.C,
      option_d: template.options.D,
      correct_answer: template.correct,
      explanation: `This is the correct answer because of the principles outlined in the ${subject} curriculum.`,
      difficulty_level: difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 5,
      subject: subject
    });
  }
  
  return questions;
}

// New function to reuse templates for a specific difficulty
function reuseTemplates(subject, unitObjective, difficulty, existingQuestions, targetCount, availableTemplates) {
  const questions = [...existingQuestions];
  
  // If we already have enough questions, return them
  if (questions.length >= targetCount) {
    return questions;
  }
  
  // Get the templates for this subject and difficulty
  const templates = QUESTION_TEMPLATES[subject].filter(t => t.difficulty === difficulty);
  
  // Calculate how many more questions we need
  const neededQuestions = targetCount - questions.length;
  
  // For each additional question needed
  for (let i = 0; i < neededQuestions; i++) {
    // Choose a template to reuse
    const templateIndex = i % availableTemplates;
    const template = templates[templateIndex];
    
    // Modify the template to make it unique
    const modifiedTemplate = modifyTemplate(template, subject, i);
    
    questions.push({
      id: `question-${questions.length + 1}-${difficulty}-${subject}-reused-${i}`,
      question_text: modifiedTemplate.question,
      option_a: modifiedTemplate.options.A,
      option_b: modifiedTemplate.options.B,
      option_c: modifiedTemplate.options.C,
      option_d: modifiedTemplate.options.D,
      correct_answer: modifiedTemplate.correct,
      explanation: `This is the correct answer because of the principles outlined in the ${subject} curriculum.`,
      difficulty_level: difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 5,
      subject: subject
    });
  }
  
  return questions;
}

// Function to reuse templates for combined difficulties
function reuseCombinedTemplates(subject, unitObjective, existingQuestions, targetCount, totalTemplates) {
  const questions = [...existingQuestions];
  
  // If we already have enough questions, return them
  if (questions.length >= targetCount) {
    return questions;
  }
  
  // Get all templates for this subject
  const allTemplates = QUESTION_TEMPLATES[subject];
  
  // Calculate how many more questions we need
  const neededQuestions = targetCount - questions.length;
  
  // For each additional question needed
  for (let i = 0; i < neededQuestions; i++) {
    // Choose a template to reuse
    const templateIndex = i % totalTemplates;
    const template = allTemplates[templateIndex];
    
    // Modify the template to make it unique
    const modifiedTemplate = modifyTemplate(template, subject, i);
    const difficulty = template.difficulty;
    
    questions.push({
      id: `question-${questions.length + 1}-${difficulty}-${subject}-reused-${i}`,
      question_text: modifiedTemplate.question,
      option_a: modifiedTemplate.options.A,
      option_b: modifiedTemplate.options.B,
      option_c: modifiedTemplate.options.C,
      option_d: modifiedTemplate.options.D,
      correct_answer: modifiedTemplate.correct,
      explanation: `This is the correct answer because of the principles outlined in the ${subject} curriculum.`,
      difficulty_level: difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 5,
      subject: subject
    });
  }
  
  return shuffleArray(questions);
}

// Helper function to modify a template to make it unique
function modifyTemplate(template, subject, index) {
  // Create a deep copy of the template
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  // Modify the template based on the subject
  switch (subject) {
    case 'mathematics':
      return modifyMathTemplate(newTemplate, index);
    case 'physics':
      return modifyPhysicsTemplate(newTemplate, index);
    case 'chemistry':
      return modifyChemistryTemplate(newTemplate, index);
    case 'biology':
      return modifyBiologyTemplate(newTemplate, index);
    case 'english':
      return modifyEnglishTemplate(newTemplate, index);
    case 'history':
      return modifyHistoryTemplate(newTemplate, index);
    case 'geography':
      return modifyGeographyTemplate(newTemplate, index);
    default:
      return modifyDefaultTemplate(newTemplate, index);
  }
}

// Helper functions to modify templates for each subject
function modifyMathTemplate(template, index) {
  // For math questions, we can change numerical values
  if (template.question.includes('$x =')) {
    // For equation solving questions
    const newValue = 5 + (index % 5);
    template.question = template.question.replace(/\d+/, newValue.toString());
    
    // Also update the answer
    const correctOption = template.correct;
    template.options[correctOption] = template.options[correctOption].replace(/\d+/, (newValue + 3).toString());
  } else if (template.question.includes('rectangle')) {
    // For area/perimeter questions
    const newLength = 5 + (index % 7);
    const newWidth = 3 + (index % 5);
    const newArea = newLength * newWidth;
    
    template.question = `Calculate the area of a rectangle with length ${newLength} cm and width ${newWidth} cm.`;
    template.options.A = `${newLength + newWidth} cm²`;
    template.options.B = `${2 * (newLength + newWidth)} cm²`;
    template.options.C = `${newArea} cm²`;
    template.options.D = `${newArea + 10} cm²`;
    template.correct = "C";
  }
  
  return template;
}

function modifyPhysicsTemplate(template, index) {
  if (template.question.includes('accelerates')) {
    // Modify acceleration problem
    const newAcceleration = 2 + (index % 3);
    const newTime = 5 + (index % 7);
    const newDistance = 0.5 * newAcceleration * newTime * newTime;
    
    template.question = `A car accelerates from rest at $${newAcceleration} m/s^2$. How far will it travel in ${newTime} seconds?`;
    template.options.A = `${Math.round(newDistance / 2)} m`;
    template.options.B = `${Math.round(newDistance)} m`;
    template.options.C = `${Math.round(newDistance * 1.5)} m`;
    template.options.D = `${Math.round(newDistance / 3)} m`;
    template.correct = "B";
  }
  
  return template;
}

function modifyChemistryTemplate(template, index) {
  // Chemistry modifications could involve changing concentrations, reagents, etc.
  if (template.question.includes('pH')) {
    const concentrations = [0.1, 0.01, 0.001, 0.0001];
    const newConcentration = concentrations[index % concentrations.length];
    const newPH = -Math.log10(newConcentration);
    
    template.question = `Calculate the pH of a ${newConcentration} M HCl solution.`;
    template.options.A = `${Math.floor(newPH)}`;
    template.options.B = `${Math.ceil(newPH)}`;
    template.options.C = `${Math.round(newPH + 1)}`;
    template.options.D = `${Math.round(newPH - 1)}`;
    template.correct = newPH === Math.floor(newPH) ? "A" : "B";
  }
  
  return template;
}

function modifyBiologyTemplate(template, index) {
  // For biology, we might change cell types, organisms, or processes
  return template; // Simple implementation for now
}

function modifyEnglishTemplate(template, index) {
  // For English, we might change the sentences or literary works
  return template; // Simple implementation for now
}

function modifyHistoryTemplate(template, index) {
  // For History, we might change dates, figures, or events
  return template; // Simple implementation for now
}

function modifyGeographyTemplate(template, index) {
  // For Geography, we might change locations or phenomena
  return template; // Simple implementation for now
}

function modifyDefaultTemplate(template, index) {
  // Generic modification - shuffle the answer options
  const options = Object.entries(template.options);
  shuffleArray(options);
  
  // Track where the correct answer moved to
  const correctValue = template.options[template.correct];
  let newCorrect = '';
  
  // Rebuild the options object
  const newOptions = {};
  options.forEach(([key, value], i) => {
    const newKey = ['A', 'B', 'C', 'D'][i];
    newOptions[newKey] = value;
    if (value === correctValue) {
      newCorrect = newKey;
    }
  });
  
  template.options = newOptions;
  template.correct = newCorrect;
  
  return template;
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
