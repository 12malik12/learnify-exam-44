
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
    },
    {
      question: "What is the limit of $\\frac{x^2 - 4}{x - 2}$ as $x$ approaches 2?",
      options: {
        A: "0",
        B: "2",
        C: "4",
        D: "Undefined"
      },
      correct: "C",
      difficulty: "medium"
    },
    {
      question: "What is the value of $\\cos(\\pi/3)$?",
      options: {
        A: "$0$",
        B: "$\\frac{1}{2}$",
        C: "$\\frac{\\sqrt{3}}{2}$",
        D: "$1$"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "For what value of $k$ does the quadratic equation $x^2 + kx + 25 = 0$ have exactly one solution?",
      options: {
        A: "$k = 0$",
        B: "$k = \\pm 5$",
        C: "$k = \\pm 10$",
        D: "$k = 25$"
      },
      correct: "C",
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
    },
    {
      question: "Which of the following is NOT a vector quantity?",
      options: {
        A: "Velocity",
        B: "Acceleration",
        C: "Temperature",
        D: "Force"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "According to Einstein's theory of special relativity, what happens to the mass of an object as its velocity approaches the speed of light?",
      options: {
        A: "It decreases to zero",
        B: "It remains constant",
        C: "It increases towards infinity",
        D: "It oscillates between maximum and minimum values"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "What is the wavelength of a photon with energy $3.0 \\times 10^{-19}$ joules? (Planck's constant $h = 6.63 \\times 10^{-34}$ J·s, speed of light $c = 3.0 \\times 10^8$ m/s)",
      options: {
        A: "$450 nm$",
        B: "$550 nm$",
        C: "$650 nm$",
        D: "$750 nm$"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "A pendulum of length 1 meter on Earth has a period of approximately 2 seconds. What would be its period on the Moon, where gravity is 1/6 that of Earth?",
      options: {
        A: "0.82 seconds",
        B: "2 seconds",
        C: "4.9 seconds",
        D: "12 seconds"
      },
      correct: "C",
      difficulty: "medium"
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
    },
    {
      question: "Which of the following is a strong acid?",
      options: {
        A: "CH₃COOH (acetic acid)",
        B: "HNO₃ (nitric acid)",
        C: "H₂CO₃ (carbonic acid)",
        D: "NH₄⁺ (ammonium ion)"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "What is the IUPAC name for the compound CH₃-CH₂-CO-CH₃?",
      options: {
        A: "2-butanone",
        B: "butanal",
        C: "butanoic acid",
        D: "methyl propyl ketone"
      },
      correct: "A",
      difficulty: "medium"
    },
    {
      question: "In an endothermic reaction:",
      options: {
        A: "Heat is released to the surroundings",
        B: "Heat is absorbed from the surroundings",
        C: "No heat is exchanged",
        D: "The entropy always decreases"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "What is the oxidation number of chromium in K₂Cr₂O₇?",
      options: {
        A: "+3",
        B: "+4",
        C: "+6",
        D: "+7"
      },
      correct: "C",
      difficulty: "medium"
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
    },
    {
      question: "Which of the following is NOT a part of the human digestive system?",
      options: {
        A: "Pancreas",
        B: "Gall bladder",
        C: "Spleen",
        D: "Esophagus"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "Which hormone is responsible for regulating blood glucose levels by allowing cells to take up glucose from the bloodstream?",
      options: {
        A: "Glucagon",
        B: "Insulin",
        C: "Cortisol",
        D: "Thyroxine"
      },
      correct: "B",
      difficulty: "easy"
    },
    {
      question: "Which type of RNA carries amino acids to the ribosome during protein synthesis?",
      options: {
        A: "mRNA",
        B: "tRNA",
        C: "rRNA",
        D: "snRNA"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "What is the role of helper T cells in the immune system?",
      options: {
        A: "Direct killing of infected cells",
        B: "Production of antibodies",
        C: "Activation of B cells and other immune cells",
        D: "Phagocytosis of bacteria"
      },
      correct: "C",
      difficulty: "medium"
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
    },
    {
      question: "Which of the following is an example of an oxymoron?",
      options: {
        A: "As busy as a bee",
        B: "Deafening silence",
        C: "Time flies",
        D: "The rolling hills"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "In Shakespeare's 'Romeo and Juliet', which character speaks the line: 'A plague on both your houses'?",
      options: {
        A: "Romeo",
        B: "Tybalt",
        C: "Mercutio",
        D: "Friar Lawrence"
      },
      correct: "C",
      difficulty: "hard"
    },
    {
      question: "What is the function of a subordinating conjunction in a complex sentence?",
      options: {
        A: "To join two independent clauses",
        B: "To join an independent clause with a dependent clause",
        C: "To introduce a list of items",
        D: "To compare two similar items"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Which of the following is NOT one of the traditional characteristics of an epic poem?",
      options: {
        A: "Begins in medias res (in the middle of the action)",
        B: "Features a hero of great national or cosmic importance",
        C: "Short in length and focused on a single incident",
        D: "Involves supernatural elements or divine intervention"
      },
      correct: "C",
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
    },
    {
      question: "Which empire controlled the largest land area in history at its peak?",
      options: {
        A: "Roman Empire",
        B: "British Empire",
        C: "Mongol Empire",
        D: "Ottoman Empire"
      },
      correct: "C",
      difficulty: "medium"
    },
    {
      question: "What was the significance of the Battle of Hastings in 1066?",
      options: {
        A: "It marked the beginning of the Hundred Years' War",
        B: "It ended Roman rule in Britain",
        C: "It resulted in Norman conquest of England",
        D: "It united England and Scotland"
      },
      correct: "C",
      difficulty: "medium"
    },
    {
      question: "Which of the following was NOT one of the major causes of the French Revolution?",
      options: {
        A: "Economic crisis and food shortages",
        B: "Social inequality and privilege of the nobility",
        C: "Influence of Enlightenment ideas",
        D: "Foreign invasion by Britain"
      },
      correct: "D",
      difficulty: "hard"
    },
    {
      question: "During which period did the Renaissance primarily occur in Europe?",
      options: {
        A: "9th-12th centuries",
        B: "14th-17th centuries",
        C: "18th-19th centuries",
        D: "20th century"
      },
      correct: "B",
      difficulty: "easy"
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
    },
    {
      question: "Which of the following countries is landlocked (has no direct access to the ocean)?",
      options: {
        A: "Vietnam",
        B: "Thailand",
        C: "Bolivia",
        D: "Ecuador"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "Which of the following is a renewable resource?",
      options: {
        A: "Coal",
        B: "Natural gas",
        C: "Solar energy",
        D: "Petroleum"
      },
      correct: "C",
      difficulty: "easy"
    },
    {
      question: "What is the name for the boundary between two tectonic plates that are moving away from each other?",
      options: {
        A: "Convergent boundary",
        B: "Divergent boundary",
        C: "Transform boundary",
        D: "Subduction zone"
      },
      correct: "B",
      difficulty: "medium"
    },
    {
      question: "Which of the following biomes is characterized by low precipitation, extreme temperature variations, and sparse vegetation?",
      options: {
        A: "Tropical rainforest",
        B: "Temperate deciduous forest",
        C: "Desert",
        D: "Tundra"
      },
      correct: "C",
      difficulty: "medium"
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
    
    let templatePool = [];
    let usedTemplateHashes = new Set(); // Track used templates to avoid exact duplicates
    
    if (difficulty === 'all') {
      // If "all" is selected, gather templates from all difficulties for the selected subject
      templatePool = JSON.parse(JSON.stringify(QUESTION_TEMPLATES[subjectLower]));
    } else {
      // Gather templates only for the specific difficulty
      templatePool = JSON.parse(JSON.stringify(
        QUESTION_TEMPLATES[subjectLower].filter(t => t.difficulty === difficulty)
      ));
    }
    
    // Shuffle the template pool for randomness
    templatePool = shuffleArray(templatePool);
    
    // Track if we're reusing templates
    let isReusingTemplates = false;
    
    // Generate the requested number of questions
    for (let i = 0; i < count; i++) {
      let template;
      let modifiedTemplate;
      let templateHash;
      let attempts = 0;
      const maxAttempts = 10;
      
      // If we've used all templates at least once, we need to reuse and modify them significantly
      if (i >= templatePool.length) {
        isReusingTemplates = true;
        console.warn(`Reusing templates for ${subject} (${difficulty}) to meet requested count of ${count} questions.`);
      }
      
      do {
        // Select a template (with cycling if we've used all available templates)
        const templateIndex = i % templatePool.length;
        template = JSON.parse(JSON.stringify(templatePool[templateIndex]));
        
        // Create a significantly modified version of the template that's unique
        modifiedTemplate = createUniqueTemplate(
          template, 
          subjectLower, 
          i, 
          attempts, 
          isReusingTemplates,
          usedTemplateHashes
        );
        
        // Generate a hash of the question to check for duplicates
        templateHash = hashQuestion(modifiedTemplate.question);
        attempts++;
        
      } while (
        usedTemplateHashes.has(templateHash) && 
        attempts < maxAttempts
      );
      
      // If we couldn't create a unique question after max attempts, force uniqueness
      if (usedTemplateHashes.has(templateHash)) {
        modifiedTemplate = createForcedUniqueTemplate(
          template, 
          subjectLower, 
          i, 
          usedTemplateHashes
        );
        templateHash = hashQuestion(modifiedTemplate.question);
      }
      
      // Add the hash to our set of used templates
      usedTemplateHashes.add(templateHash);
      
      // Generate a unique ID for this question
      const questionId = isReusingTemplates
        ? `question-${i+1}-${subjectLower}-${difficulty}-modified-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        : `question-${i+1}-${subjectLower}-${difficulty}`;
      
      // Create the question object
      questions.push({
        id: questionId,
        question_text: modifiedTemplate.question,
        option_a: modifiedTemplate.options.A,
        option_b: modifiedTemplate.options.B,
        option_c: modifiedTemplate.options.C,
        option_d: modifiedTemplate.options.D,
        correct_answer: modifiedTemplate.correct,
        explanation: generateExplanation(modifiedTemplate, subject, difficulty),
        difficulty_level: getDifficultyLevel(modifiedTemplate.difficulty || difficulty),
        subject: subject
      });
    }
    
    // Final shuffle of questions to mix original and modified templates
    questions = shuffleArray(questions);
    
    return new Response(
      JSON.stringify({ 
        questions,
        meta: {
          isReusingTemplates,
          subjectTemplateCount: templatePool.length,
          requestedCount: count
        }
      }),
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

// Function to hash a question text for duplicate detection
function hashQuestion(questionText) {
  // Simple hash function for question text
  let hash = 0;
  for (let i = 0; i < questionText.length; i++) {
    const char = questionText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Function to generate a more detailed explanation
function generateExplanation(template, subject, difficulty) {
  const difficultyTexts = {
    easy: "This is a fundamental concept in",
    medium: "This problem requires application of key principles in",
    hard: "This advanced question tests deep understanding of"
  };
  
  const difficultyText = difficultyTexts[template.difficulty || difficulty] || 
    "This question tests your knowledge of";
  
  return `${difficultyText} ${subject}. The correct answer applies principles from the ${subject} curriculum.`;
}

// Get numeric difficulty level from difficulty string
function getDifficultyLevel(difficulty) {
  if (difficulty === "easy") return 1;
  if (difficulty === "medium") return 3;
  return 5; // hard
}

// Create a uniquely modified template that won't duplicate existing questions
function createUniqueTemplate(template, subject, index, attempt, forceUniqueness, usedHashes) {
  // If we need to force uniqueness, make more significant changes
  const variationFactor = forceUniqueness ? 2 : 1;
  
  // Create a deep copy of the template
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  // Modify the template based on the subject with more variation
  switch (subject) {
    case 'mathematics':
      return modifyMathTemplate(newTemplate, index, attempt, variationFactor);
    case 'physics':
      return modifyPhysicsTemplate(newTemplate, index, attempt, variationFactor);
    case 'chemistry':
      return modifyChemistryTemplate(newTemplate, index, attempt, variationFactor);
    case 'biology':
      return modifyBiologyTemplate(newTemplate, index, attempt, variationFactor);
    case 'english':
      return modifyEnglishTemplate(newTemplate, index, attempt, variationFactor);
    case 'history':
      return modifyHistoryTemplate(newTemplate, index, attempt, variationFactor);
    case 'geography':
      return modifyGeographyTemplate(newTemplate, index, attempt, variationFactor);
    default:
      // For other subjects, use option shuffling and textual modifications
      const textMods = [
        "Consider the following: ",
        "Analyze this problem: ",
        "In this case: ",
        "Evaluate the following: ",
        "For this question: "
      ];
      
      // Add a prefix to make the question different
      if (forceUniqueness) {
        const prefix = textMods[Math.floor(Math.random() * textMods.length)];
        newTemplate.question = prefix + newTemplate.question;
      }
      
      return shuffleOptions(newTemplate);
  }
}

// Create a forced unique template by making significant changes
function createForcedUniqueTemplate(template, subject, index, usedHashes) {
  // Make a deep copy of the template
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  // Generate a truly unique identifier
  const unique_id = Date.now() + Math.floor(Math.random() * 10000);
  
  // Make different modifications based on subject
  switch (subject) {
    case 'mathematics':
      if (newTemplate.question.includes('rectangle')) {
        const newLength = 10 + (index % 7) + Math.floor(Math.random() * 5);
        const newWidth = 5 + (index % 5) + Math.floor(Math.random() * 3);
        const area = newLength * newWidth;
        
        newTemplate.question = `Calculate the area of a rectangle with length ${newLength} cm and width ${newWidth} cm.`;
        newTemplate.options.A = `${newLength + newWidth} cm²`;
        newTemplate.options.B = `${2 * (newLength + newWidth)} cm²`;
        newTemplate.options.C = `${area} cm²`;
        newTemplate.options.D = `${area + 10} cm²`;
        newTemplate.correct = "C";
      } else if (newTemplate.question.includes('equation')) {
        const a = 2 + (index % 3) + Math.floor(Math.random() * 3);
        const b = 5 + (index % 4) + Math.floor(Math.random() * 5);
        const c = a * 3 + b + Math.floor(Math.random() * 2);
        
        newTemplate.question = `Solve for x: ${a}x + ${b} = ${c}.`;
        const solution = (c - b) / a;
        
        newTemplate.options.A = `x = ${(solution - 1).toFixed(1)}`;
        newTemplate.options.B = `x = ${(solution + 1).toFixed(1)}`;
        newTemplate.options.C = `x = ${solution.toFixed(1)}`;
        newTemplate.options.D = `x = ${(solution + 2).toFixed(1)}`;
        newTemplate.correct = "C";
      } else {
        // Apply random modifications for other math questions
        newTemplate.question = `Alternative ${unique_id % 100}: ${newTemplate.question}`;
      }
      break;
      
    case 'physics':
      if (newTemplate.question.includes('force')) {
        const mass = 2 + (index % 8) + Math.floor(Math.random() * 5);
        const accel = 3 + (index % 5) + Math.floor(Math.random() * 4);
        const force = mass * accel;
        
        newTemplate.question = `Calculate the force needed to accelerate a ${mass} kg object at ${accel} m/s².`;
        newTemplate.options.A = `${force - 5} N`;
        newTemplate.options.B = `${force} N`;
        newTemplate.options.C = `${force + 5} N`;
        newTemplate.options.D = `${force * 2} N`;
        newTemplate.correct = "B";
      } else {
        // Apply random modifications for other physics questions
        newTemplate.question = `Modified scenario ${unique_id % 100}: ${newTemplate.question}`;
      }
      break;
      
    case 'chemistry':
      if (newTemplate.question.includes('pH')) {
        const concentrations = [0.1, 0.01, 0.001, 0.0001];
        const concentrationIndex = (index + Math.floor(Math.random() * 3)) % concentrations.length;
        const concentration = concentrations[concentrationIndex];
        const pH = -Math.log10(concentration);
        
        newTemplate.question = `Calculate the pH of a ${concentration} M HCl solution.`;
        newTemplate.options.A = `${Math.floor(pH)}`;
        newTemplate.options.B = `${Math.ceil(pH)}`;
        newTemplate.options.C = `${Math.round(pH + 1)}`;
        newTemplate.options.D = `${Math.round(pH - 1)}`;
        newTemplate.correct = pH === Math.floor(pH) ? "A" : "B";
      } else {
        newTemplate.question = `Variant ${unique_id % 100}: ${newTemplate.question}`;
      }
      break;
    
    // Handle other subjects with similar depth of modification
    default:
      // Generic modification with prefixes and option shuffling
      const prefixes = [
        "For this specific case: ",
        "Consider carefully: ",
        "In this particular scenario: ",
        "Analyze the following: ",
        "Taking a different approach: "
      ];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      newTemplate.question = `${randomPrefix}${newTemplate.question}`;
      return shuffleOptions(newTemplate);
  }
  
  // Shuffle options for additional uniqueness
  return shuffleOptions(newTemplate);
}

// Helper functions to modify templates for each subject
function modifyMathTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  // Identify different types of math questions for specialized modifications
  if (newTemplate.question.includes('rectangle') || newTemplate.question.includes('area')) {
    // For area/perimeter questions, change dimensions
    const baseLength = 5 + (index % 7);
    const baseWidth = 3 + (index % 5);
    
    // Apply variation factor to create more diverse values
    const variation = Math.floor(Math.random() * variationFactor * 5);
    const newLength = baseLength + variation;
    const newWidth = baseWidth + Math.floor(Math.random() * variationFactor * 3);
    
    const area = newLength * newWidth;
    const perimeter = 2 * (newLength + newWidth);
    
    // Decide randomly whether to create an area or perimeter question
    const isAreaQuestion = (index + attempt) % 2 === 0;
    
    if (isAreaQuestion) {
      newTemplate.question = `Calculate the area of a rectangle with length ${newLength} cm and width ${newWidth} cm.`;
      newTemplate.options.A = `${newLength + newWidth} cm²`;
      newTemplate.options.B = `${perimeter} cm²`;
      newTemplate.options.C = `${area} cm²`;
      newTemplate.options.D = `${area + Math.floor(Math.random() * 10) + 1} cm²`;
      newTemplate.correct = "C";
    } else {
      newTemplate.question = `Find the perimeter of a rectangle with length ${newLength} cm and width ${newWidth} cm.`;
      newTemplate.options.A = `${area} cm`;
      newTemplate.options.B = `${perimeter} cm`;
      newTemplate.options.C = `${newLength * 2} cm`;
      newTemplate.options.D = `${newWidth * 2} cm`;
      newTemplate.correct = "B";
    }
  } else if (newTemplate.question.includes('equation') || newTemplate.question.includes('solve')) {
    // For equation solving, generate new coefficients
    const a = 1 + (index % 5) + Math.floor(Math.random() * variationFactor * 2);
    const b = 3 + (index % 7) + Math.floor(Math.random() * variationFactor * 3);
    const x = 1 + Math.floor(Math.random() * 5); // The solution we want
    const c = a * x + b; // Calculate c to make x the solution
    
    newTemplate.question = `Solve the equation $${a}x + ${b} = ${c}$.`;
    
    // Generate options around the correct answer
    newTemplate.options.A = `$x = ${x - 2}$`;
    newTemplate.options.B = `$x = ${x - 1}$`;
    newTemplate.options.C = `$x = ${x}$`;
    newTemplate.options.D = `$x = ${x + 1}$`;
    newTemplate.correct = "C";
  } else if (newTemplate.question.includes('derivative')) {
    // For calculus questions, change the function
    const coefficients = [
      [2, 3, 1],
      [3, 2, 4],
      [1, 4, 2],
      [4, 1, 3]
    ];
    
    const coefSet = coefficients[(index + attempt) % coefficients.length];
    const a = coefSet[0];
    const b = coefSet[1];
    const c = coefSet[2];
    
    newTemplate.question = `Find the derivative of $f(x) = ${a}x^3 - ${b}x^2 + ${c}x - 2$.`;
    
    newTemplate.options.A = `$f'(x) = ${3*a}x^2 - ${2*b}x + ${c}$`;
    newTemplate.options.B = `$f'(x) = ${3*a}x^2 - ${2*b}x - ${c}$`;
    newTemplate.options.C = `$f'(x) = ${3*a}x^2 + ${2*b}x + ${c}$`;
    newTemplate.options.D = `$f'(x) = ${3*a}x^2 - ${2*b}x$`;
    newTemplate.correct = "A";
  } else {
    // For other math questions, apply minor modifications and shuffle options
    if (variationFactor > 1) {
      // For stronger variations, add prefixes to questions
      const prefixes = ["Determine", "Calculate", "Find", "Evaluate", "Compute"];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // Remove any existing similar prefixes
      let cleanQuestion = newTemplate.question;
      prefixes.forEach(p => {
        if (cleanQuestion.startsWith(p)) {
          cleanQuestion = cleanQuestion.substring(p.length).trim();
          // Remove ":" if present
          if (cleanQuestion.startsWith(":")) {
            cleanQuestion = cleanQuestion.substring(1).trim();
          }
        }
      });
      
      newTemplate.question = `${prefix}: ${cleanQuestion}`;
    }

    return shuffleOptions(newTemplate);
  }
  
  return newTemplate;
}

function modifyPhysicsTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  if (newTemplate.question.includes('accelerates') || newTemplate.question.includes('acceleration')) {
    // Modify acceleration problems with unique values
    const accel = (2 + (index % 3) + Math.floor(Math.random() * variationFactor * 2)).toFixed(1);
    const time = 5 + (index % 7) + Math.floor(Math.random() * variationFactor * 3);
    const distance = 0.5 * parseFloat(accel) * time * time;
    
    newTemplate.question = `A car accelerates from rest at $${accel} m/s^2$. How far will it travel in ${time} seconds?`;
    newTemplate.options.A = `${Math.round(distance / 2)} m`;
    newTemplate.options.B = `${Math.round(distance)} m`;
    newTemplate.options.C = `${Math.round(distance * 1.5)} m`;
    newTemplate.options.D = `${Math.round(accel * time)} m`;
    newTemplate.correct = "B";
  } else if (newTemplate.question.includes('resistor') || newTemplate.question.includes('resistance')) {
    // Create variant resistor problems
    const r1 = 2 + (index % 6) + Math.floor(Math.random() * variationFactor * 4);
    const r2 = 4 + (index % 4) + Math.floor(Math.random() * variationFactor * 3);
    
    // Calculate parallel and series resistances
    const rSeries = r1 + r2;
    const rParallel = (r1 * r2) / (r1 + r2);
    
    // Randomly choose between parallel and series problems
    const isParallel = (index + attempt) % 2 === 0;
    
    if (isParallel) {
      newTemplate.question = `What is the equivalent resistance of two resistors $R_1 = ${r1}\\Omega$ and $R_2 = ${r2}\\Omega$ connected in parallel?`;
      newTemplate.options.A = `${r1 + r2}\\Omega`;
      newTemplate.options.B = `${Math.round(rParallel * 10) / 10}\\Omega`;
      newTemplate.options.C = `${Math.round(r1 * r2 * 10) / 10}\\Omega`;
      newTemplate.options.D = `${Math.round((r1 + r2) / 2 * 10) / 10}\\Omega`;
      newTemplate.correct = "B";
    } else {
      newTemplate.question = `What is the equivalent resistance of two resistors $R_1 = ${r1}\\Omega$ and $R_2 = ${r2}\\Omega$ connected in series?`;
      newTemplate.options.A = `${rSeries}\\Omega`;
      newTemplate.options.B = `${Math.round(rParallel * 10) / 10}\\Omega`;
      newTemplate.options.C = `${Math.round((r1 * r2) * 10) / 10}\\Omega`;
      newTemplate.options.D = `${Math.abs(r1 - r2)}\\Omega`;
      newTemplate.correct = "A";
    }
  } else {
    // For other physics questions, apply option shuffling and minor text changes
    if (variationFactor > 1) {
      const contexts = [
        "In a laboratory experiment, ",
        "During a physics demonstration, ",
        "Consider the following scenario: ",
        "In an ideal system, ",
        "According to principles of physics, "
      ];
      
      const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
      newTemplate.question = randomContext + newTemplate.question.charAt(0).toLowerCase() + newTemplate.question.slice(1);
    }
    
    return shuffleOptions(newTemplate);
  }
  
  return newTemplate;
}

function modifyChemistryTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  if (newTemplate.question.includes('pH')) {
    // Create variant pH calculation problems
    const concentrationValues = [0.1, 0.01, 0.001, 0.0001, 0.00001];
    const concentrationIndex = (index + attempt) % concentrationValues.length;
    const concentration = concentrationValues[concentrationIndex];
    
    // Calculate pH
    const pH = -Math.log10(concentration);
    
    // Add some acids variation
    const acids = ["HCl", "HNO₃", "H₂SO₄"];
    const acid = acids[(index + attempt) % acids.length];
    
    newTemplate.question = `Calculate the pH of a ${concentration} M ${acid} solution.`;
    
    // Create answer options around the correct value
    newTemplate.options.A = `${Math.floor(pH)}`;
    newTemplate.options.B = `${Math.ceil(pH)}`;
    newTemplate.options.C = `${Math.round(pH + 1)}`;
    newTemplate.options.D = `${Math.round(pH - 1) || 1}`; // Prevent negative pH values
    
    // Determine the correct answer based on the calculated pH
    if (pH === Math.floor(pH)) {
      newTemplate.correct = "A";
    } else {
      newTemplate.correct = "B";
    }
  } else if (newTemplate.question.includes('reaction') || newTemplate.question.includes('product')) {
    // Create variation for reaction questions
    const reactions = [
      {
        reactants: "Na₂CO₃ + 2HCl",
        products: "2NaCl + H₂O + CO₂",
        correct: "B"
      },
      {
        reactants: "CaCO₃ + 2HCl",
        products: "CaCl₂ + H₂O + CO₂",
        correct: "A"
      },
      {
        reactants: "2NaOH + H₂SO₄",
        products: "Na₂SO₄ + 2H₂O",
        correct: "C"
      },
      {
        reactants: "Mg + 2HCl",
        products: "MgCl₂ + H₂",
        correct: "D"
      }
    ];
    
    const reactionIndex = (index + attempt) % reactions.length;
    const reaction = reactions[reactionIndex];
    
    newTemplate.question = `What is the product of the reaction: ${reaction.reactants} → ?`;
    
    // Create answer options with the correct product and distractors
    const products = reactions.map(r => r.products);
    
    // Ensure the correct answer is in the options
    newTemplate.options.A = products[0];
    newTemplate.options.B = products[1];
    newTemplate.options.C = products[2];
    newTemplate.options.D = products[3];
    newTemplate.correct = reaction.correct;
  } else {
    // For other chemistry questions, apply minor modifications
    if (variationFactor > 1) {
      const prefixes = [
        "According to chemical principles, ",
        "In chemical terms, ",
        "From a chemical perspective, ",
        "Based on chemical theory, ",
        "When considering chemical properties, "
      ];
      
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      newTemplate.question = prefix + newTemplate.question.charAt(0).toLowerCase() + newTemplate.question.slice(1);
    }
    
    return shuffleOptions(newTemplate);
  }
  
  return newTemplate;
}

function modifyBiologyTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  if (newTemplate.question.includes('organelle') || newTemplate.question.includes('cell')) {
    // Create variations of organelle function questions
    const organelles = [
      { name: "Mitochondria", function: "ATP production", alt: "Cellular respiration" },
      { name: "Ribosome", function: "Protein synthesis", alt: "Translation of mRNA" },
      { name: "Golgi apparatus", function: "Processing and packaging macromolecules", alt: "Protein modification and sorting" },
      { name: "Endoplasmic reticulum", function: "Synthesis of lipids and proteins", alt: "Transport of cellular materials" },
      { name: "Chloroplast", function: "Photosynthesis", alt: "Light energy conversion" },
      { name: "Lysosome", function: "Cellular digestion", alt: "Breaking down waste materials" }
    ];
    
    const organelleIndex = (index + attempt) % organelles.length;
    const selectedOrganelle = organelles[organelleIndex];
    
    // Decide between main function and alternative description
    const useAltDescription = (index + attempt) % 2 === 1;
    const functionDescription = useAltDescription ? selectedOrganelle.alt : selectedOrganelle.function;
    
    newTemplate.question = `What is the primary function of the ${selectedOrganelle.name} in a eukaryotic cell?`;
    
    // Create answer options with one correct and three incorrect
    const allFunctions = organelles.map(o => useAltDescription ? o.alt : o.function);
    
    // Shuffle functions but ensure the correct one is included
    const shuffledFunctions = shuffleArray([...allFunctions]);
    
    // Ensure the correct answer is in the options
    newTemplate.options.A = shuffledFunctions[0];
    newTemplate.options.B = shuffledFunctions[1];
    newTemplate.options.C = shuffledFunctions[2];
    newTemplate.options.D = shuffledFunctions[3];
    
    // Find the correct option letter
    for (const [key, value] of Object.entries(newTemplate.options)) {
      if (value === functionDescription) {
        newTemplate.correct = key;
        break;
      }
    }
  } else if (newTemplate.question.includes('cell') || newTemplate.question.includes('solution')) {
    // Create osmosis/diffusion variations
    const solutionTypes = ["hypotonic", "hypertonic", "isotonic"];
    const cellResponses = [
      "It would swell and possibly lyse",
      "It would shrink due to water loss",
      "It would remain unchanged"
    ];
    
    const solutionIndex = (index + attempt) % solutionTypes.length;
    const selectedSolution = solutionTypes[solutionIndex];
    const correctResponse = cellResponses[solutionIndex];
    
    newTemplate.question = `What would happen to a red blood cell placed in a ${selectedSolution} solution?`;
    
    newTemplate.options.A = cellResponses[0];
    newTemplate.options.B = cellResponses[1];
    newTemplate.options.C = cellResponses[2];
    newTemplate.options.D = "It would divide rapidly";
    
    // Set correct answer
    for (const [key, value] of Object.entries(newTemplate.options)) {
      if (value === correctResponse) {
        newTemplate.correct = key;
        break;
      }
    }
  } else {
    // For other biology questions, apply context modifications
    if (variationFactor > 1) {
      const contexts = [
        "In a cellular context, ",
        "From an evolutionary perspective, ",
        "In modern biology, ",
        "According to current understanding, ",
        "In biological systems, "
      ];
      
      const context = contexts[Math.floor(Math.random() * contexts.length)];
      newTemplate.question = context + newTemplate.question.charAt(0).toLowerCase() + newTemplate.question.slice(1);
    }
    
    return shuffleOptions(newTemplate);
  }
  
  return newTemplate;
}

function modifyEnglishTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  if (newTemplate.question.includes('literary device') || newTemplate.question.includes('figure of speech')) {
    // Create variations for literary device questions
    const literaryExamples = [
      { text: "The wind whispered through the trees.", device: "Personification" },
      { text: "Life is like a box of chocolates.", device: "Simile" },
      { text: "The curtain of night fell upon the city.", device: "Metaphor" },
      { text: "She's as cold as ice.", device: "Simile" },
      { text: "The thunder roared in anger.", device: "Personification" },
      { text: "He's drowning in a sea of grief.", device: "Metaphor" }
    ];
    
    const exampleIndex = (index + attempt) % literaryExamples.length;
    const selectedExample = literaryExamples[exampleIndex];
    
    newTemplate.question = `Identify the literary device in the following sentence: "${selectedExample.text}"`;
    
    // Common literary devices for options
    const devices = ["Simile", "Metaphor", "Personification", "Hyperbole", "Onomatopoeia", "Alliteration"];
    
    // Ensure correct device is in the options
    newTemplate.options.A = devices[0];
    newTemplate.options.B = devices[1];
    newTemplate.options.C = devices[2];
    newTemplate.options.D = devices[3];
    
    // Set correct answer
    for (const [key, value] of Object.entries(newTemplate.options)) {
      if (value === selectedExample.device) {
        newTemplate.correct = key;
        break;
      }
    }
  } else if (newTemplate.question.includes('grammar') || newTemplate.question.includes('verb')) {
    // Grammar question variations
    const grammarExamples = [
      { 
        question: "Which sentence uses the correct verb tense?",
        options: {
          A: "I will went to the store tomorrow.",
          B: "I have go to the store yesterday.",
          C: "I will go to the store tomorrow.",
          D: "I have went to the store yesterday."
        },
        correct: "C"
      },
      { 
        question: "Which sentence demonstrates correct subject-verb agreement?",
        options: {
          A: "The team are playing well.",
          B: "The team is playing well.",
          C: "The team be playing well.",
          D: "The team were been playing well."
        },
        correct: "B"
      },
      { 
        question: "Which sentence uses the correct pronoun?",
        options: {
          A: "Between you and I, this is important.",
          B: "Between you and me, this is important.",
          C: "Between we, this is important.",
          D: "Between us and they, this is important."
        },
        correct: "B"
      }
    ];
    
    const grammarIndex = (index + attempt) % grammarExamples.length;
    const selectedGrammar = grammarExamples[grammarIndex];
    
    newTemplate.question = selectedGrammar.question;
    newTemplate.options = selectedGrammar.options;
    newTemplate.correct = selectedGrammar.correct;
  } else {
    // For other English questions, apply context and option shuffling
    if (variationFactor > 1) {
      const contexts = [
        "In literary analysis, ",
        "From a grammatical perspective, ",
        "In the study of language, ",
        "According to English conventions, ",
        "When examining text, "
      ];
      
      const context = contexts[Math.floor(Math.random() * contexts.length)];
      newTemplate.question = context + newTemplate.question.charAt(0).toLowerCase() + newTemplate.question.slice(1);
    }
    
    return shuffleOptions(newTemplate);
  }
  
  return newTemplate;
}

function modifyHistoryTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  // For history, we'll focus on question presentation rather than changing facts
  const prefixes = [
    "According to historical accounts, ",
    "Historical evidence suggests that ",
    "Based on historical records, ",
    "From a historical perspective, ",
    "Historians generally agree that "
  ];
  
  const qFormats = [
    "Which of the following is true about ",
    "Which statement correctly describes ",
    "What is the historical significance of ",
    "Which event led to "
  ];
  
  if (variationFactor > 1) {
    // For more significant variations, combine prefixes and question formats
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const format = qFormats[Math.floor(Math.random() * qFormats.length)];
    
    // Extract the subject of the question where possible
    let subject = "";
    
    if (newTemplate.question.includes("World War")) {
      subject = "World War II";
    } else if (newTemplate.question.includes("President")) {
      subject = "the first U.S. President";
    } else if (newTemplate.question.includes("Revolution")) {
      subject = "the French Revolution";
    } else {
      // Use the original question
      return shuffleOptions(newTemplate);
    }
    
    newTemplate.question = prefix + format + subject + "?";
  }
  
  return shuffleOptions(newTemplate);
}

function modifyGeographyTemplate(template, index, attempt, variationFactor) {
  const newTemplate = JSON.parse(JSON.stringify(template));
  
  if (newTemplate.question.includes('largest') || newTemplate.question.includes('ocean')) {
    // Create variations of geography superlative questions
    const geographySuperlatives = [
      { 
        question: "Which is the largest ocean on Earth?",
        answer: "Pacific Ocean",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"]
      },
      { 
        question: "Which is the longest river in the world?",
        answer: "Nile River",
        options: ["Amazon River", "Mississippi River", "Nile River", "Yangtze River"]
      },
      { 
        question: "Which is the highest mountain peak in the world?",
        answer: "Mount Everest",
        options: ["Mount Kilimanjaro", "K2", "Mount Everest", "Denali"]
      },
      { 
        question: "Which is the largest desert in the world?",
        answer: "Antarctic Desert",
        options: ["Sahara Desert", "Arabian Desert", "Antarctic Desert", "Gobi Desert"]
      }
    ];
    
    const superlativeIndex = (index + attempt) % geographySuperlatives.length;
    const selectedQuestion = geographySuperlatives[superlativeIndex];
    
    newTemplate.question = selectedQuestion.question;
    
    // Set options
    const options = shuffleArray([...selectedQuestion.options]);
    newTemplate.options.A = options[0];
    newTemplate.options.B = options[1];
    newTemplate.options.C = options[2];
    newTemplate.options.D = options[3];
    
    // Set correct answer
    for (const [key, value] of Object.entries(newTemplate.options)) {
      if (value === selectedQuestion.answer) {
        newTemplate.correct = key;
        break;
      }
    }
  } else if (newTemplate.question.includes('landlocked') || newTemplate.question.includes('countries')) {
    // Create variations with different countries
    const countries = [
      { name: "Bolivia", landlocked: true },
      { name: "Paraguay", landlocked: true },
      { name: "Switzerland", landlocked: true },
      { name: "Mongolia", landlocked: true },
      { name: "Vietnam", landlocked: false },
      { name: "Thailand", landlocked: false },
      { name: "Ecuador", landlocked: false },
      { name: "Japan", landlocked: false }
    ];
    
    // Shuffle countries and take the first 4
    const shuffledCountries = shuffleArray([...countries]).slice(0, 4);
    
    // Ensure at least one landlocked country is included
    let hasLandlocked = shuffledCountries.some(c => c.landlocked);
    if (!hasLandlocked) {
      // Replace the last country with a landlocked one
      const landlockedCountries = countries.filter(c => c.landlocked);
      shuffledCountries[3] = landlockedCountries[0];
    }
    
    newTemplate.question = "Which of the following countries is landlocked (has no direct access to the ocean)?";
    
    // Set options
    newTemplate.options.A = shuffledCountries[0].name;
    newTemplate.options.B = shuffledCountries[1].name;
    newTemplate.options.C = shuffledCountries[2].name;
    newTemplate.options.D = shuffledCountries[3].name;
    
    // Set correct answer
    for (let i = 0; i < shuffledCountries.length; i++) {
      if (shuffledCountries[i].landlocked) {
        newTemplate.correct = ["A", "B", "C", "D"][i];
        break;
      }
    }
  } else {
    // For other geography questions, apply context variations
    if (variationFactor > 1) {
      const contexts = [
        "In geographical terms, ",
        "According to physical geography, ",
        "Based on geographical studies, ",
        "From a geographical perspective, ",
        "When examining the Earth's features, "
      ];
      
      const context = contexts[Math.floor(Math.random() * contexts.length)];
      newTemplate.question = context + newTemplate.question.charAt(0).toLowerCase() + newTemplate.question.slice(1);
    }
    
    return shuffleOptions(newTemplate);
  }
  
  return newTemplate;
}

// Helper function to shuffle answer options
function shuffleOptions(template) {
  const options = Object.entries(template.options);
  const shuffledOptions = shuffleArray([...options]);
  
  // Track where the correct answer moved to
  const correctValue = template.options[template.correct];
  let newCorrect = '';
  
  // Rebuild the options object
  const newOptions = {};
  shuffledOptions.forEach(([key, value], i) => {
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
  const result = [...array]; // Create a copy to avoid modifying the original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
