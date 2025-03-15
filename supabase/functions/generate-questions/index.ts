
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
    
    if (!subject || !unitObjective || !difficulty) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate difficulty level
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return new Response(
        JSON.stringify({ error: "Invalid difficulty level. Must be 'easy', 'medium', or 'hard'" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subject-specific difficulty guidelines, fallback to generic if not found
    const subjectLower = subject.toLowerCase();
    const specificDifficultyGuide = SUBJECT_DIFFICULTY_GUIDELINES[subjectLower]?.[difficulty] || 
                          DIFFICULTY_GUIDELINES[difficulty];
    const formatGuide = SUBJECT_FORMATTING[subjectLower] || "";

    // Generate questions using the guidelines
    const questions = generateMockQuestions(subject, unitObjective, difficulty, count, specificDifficultyGuide, formatGuide);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate questions" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateMockQuestions(subject, unitObjective, difficulty, count, difficultyGuide, formatGuide) {
  const subjectLower = subject.toLowerCase();

  const questions = [];

  for (let i = 0; i < count; i++) {
    let questionText = `Question about ${unitObjective}`;
    let options = {
      A: "First option",
      B: "Second option",
      C: "Third option",
      D: "Fourth option"
    };

    if (subjectLower === "mathematics") {
      if (i === 0) {
        questionText = `Calculate the value of $\\frac{3x + 5}{2}$ when $x = 4$`;
        options = {
          A: "$\\frac{23}{2}$",
          B: "$\\frac{17}{2}$",
          C: "$8.5$",
          D: "$\\frac{19}{2}$"
        };
      } else if (i === 1) {
        questionText = `Solve for $x$ in the equation $2x + 7 = 15$`;
        options = {
          A: "$x = 4$",
          B: "$x = 5$",
          C: "$x = 3$",
          D: "$x = 6$"
        };
      }
    } else if (subjectLower === "physics") {
      if (i === 0) {
        questionText = `A car accelerates from rest at $2.5 m/s^2$. How far will it travel in 10 seconds?`;
        options = {
          A: "$125 m$",
          B: "$250 m$",
          C: "$25 m$",
          D: "$100 m$"
        };
      } else if (i === 1) {
        questionText = `What is the equivalent resistance of two resistors $R_1 = 6\\Omega$ and $R_2 = 3\\Omega$ connected in parallel?`;
        options = {
          A: "$9\\Omega$",
          B: "$2\\Omega$",
          C: "$4.5\\Omega$",
          D: "$1.5\\Omega$"
        };
      }
    } else if (subjectLower === "chemistry") {
      if (i === 0) {
        questionText = `What is the product of the reaction: Na₂CO₃ + 2HCl → ?`;
        options = {
          A: "NaCl + H₂O + CO₂",
          B: "2NaCl + H₂O + CO₂",
          C: "2NaCl + H₂CO₃",
          D: "Na₂Cl₂ + H₂O + CO₂"
        };
      }
    }

    questions.push({
      id: `mock-question-${i}`,
      question_text: questionText,
      option_a: options.A,
      option_b: options.B,
      option_c: options.C,
      option_d: options.D,
      correct_answer: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
      explanation: `Explanation for the question about ${unitObjective}`,
      difficulty_level: difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 5,
      subject: subject
    });
  }

  return questions;
}

