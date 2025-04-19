import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY') || '';

// Subject-specific instructions to guide the AI in generating better quality questions
const subjectPromptGuides = {
  'Mathematics': 'Include challenging formulas, multi-step problems, and conceptual understanding. Questions should require application of mathematical principles rather than simple recall.',
  'Chemistry': 'Include complex chemical reactions, integrated concepts across topics, and problems requiring mathematical calculations and conceptual understanding.',
  'Physics': 'Include problems requiring application of multiple physical laws, mathematical manipulations, and conceptual understanding across topics.',
  'Biology': 'Questions should integrate multiple biological systems, require analysis of complex processes, and application of biological principles to novel scenarios.',
  'History': 'Include questions that require analysis of historical events, comparison of multiple perspectives, and evaluation of historical significance and impact.',
  'Geography': 'Include questions on complex geographical phenomena, interconnections between physical and human geography, and analysis of geographical data.',
  'Civics': 'Include complex ethical scenarios, analysis of governance structures, and application of civic principles to real-world situations.'
};

// Learning objectives mapped by subject and unit for aligned questions
const learningObjectives: Record<string, Record<string, string[]>> = {
  "Mathematics": {
    "Grade 12 Unit 1": [
      "Understand sequence and series",
      "Compute terms of a sequence from a given rule",
      "Use given terms to develop a formula that represent the sequence",
      "Identify different types of sequences and series",
      "Compute the partial and infinite sum of some sequences",
      "Apply understanding of sequences and series to real-life problems"
    ],
    "Grade 12 Unit 3": [
      "Describe absolute and relative dispersion and their interpretation",
      "Conceptualize specific facts about measurement in statistical data",
      "Grasp basic concepts about sampling techniques",
      "Appreciate the value of statistics in real life"
    ],
    "Grade 12 Unit 4": [
      "Deduce how to find regions of inequality graphs",
      "Solve systems of linear inequality",
      "Construct linear programming problems",
      "Solve real life problems of linear programming problems"
    ]
  },
  "Chemistry": {
    "Grade 12 Unit 1": [
      "Understand Acid-Base Concepts",
      "Solve Equilibrium Problems",
      "Work with Acid-Base Indicators and Titrations"
    ],
    "Grade 12 Unit 2": [
      "Understand Redox Reactions",
      "Explain Electrolysis processes",
      "Work with Electrochemical Cells",
      "Describe Industrial Applications"
    ]
  },
  "Physics": {
    "Grade 12 Unit 2": [
      "Understand two-dimensional motions",
      "Describe projectile motion",
      "Explain rotational dynamics and Kepler's laws",
      "Apply Newton's law of universal gravitation"
    ],
    "Grade 12 Unit 3": [
      "Understand fluid mechanics concepts and pressure",
      "Apply Pascal's and Archimedes' principles",
      "Analyze fluid flow behaviors"
    ]
  }
};

// Diverse question type templates to ensure variety
const questionTypes = [
  "Create a scenario-based question that requires analyzing a real-world application of {concept}",
  "Design a question that requires multi-step reasoning and calculation involving {concept}",
  "Create a conceptual question that tests deep understanding of {concept} principles",
  "Design a question with a challenging twist about {concept} that might initially mislead students",
  "Create a comparison question requiring students to evaluate different approaches to {concept}",
  "Design a question requiring students to predict outcomes based on {concept}",
  "Create a question requiring students to identify errors in a proposed solution about {concept}",
  "Design a question involving data interpretation related to {concept}",
  "Create a question requiring synthesis of multiple aspects of {concept}",
  "Design a case study question where students must apply {concept} to solve a complex problem"
];

// Different context templates to add variety
const contextTemplates = [
  "In a laboratory setting, where measurements must be precise,",
  "During a scientific investigation involving {subject},",
  "In a real-world engineering application,",
  "At a manufacturing facility that produces {product},",
  "While analyzing data from a recent experiment,",
  "When designing a solution for a community problem,",
  "In an environmental monitoring situation,",
  "During a medical diagnosis procedure,",
  "While constructing a mathematical model of a natural phenomenon,",
  "In a research project studying {phenomenon},"
];

// Enhanced challenging question generation prompt
function generateChallengingQuestionPrompt(subject: string, unitObjective?: string, questionIndex: number = 0) {
  const subjectGuide = subjectPromptGuides[subject as keyof typeof subjectPromptGuides] || '';
  
  // Find relevant learning objectives if available
  let objectiveContent = "";
  if (unitObjective) {
    objectiveContent = `focusing SPECIFICALLY on this learning objective: "${unitObjective}". All questions MUST directly align with this objective.`;
  } else if (subject in learningObjectives) {
    // Use random unit objectives from our mapped content
    const units = Object.keys(learningObjectives[subject]);
    if (units.length > 0) {
      const randomUnit = units[Math.floor(Math.random() * units.length)];
      const objectives = learningObjectives[subject][randomUnit];
      if (objectives && objectives.length > 0) {
        const randomObjective = objectives[Math.floor(Math.random() * objectives.length)];
        objectiveContent = `focusing on this learning objective from ${randomUnit}: "${randomObjective}". The question must directly assess this objective.`;
      }
    }
  }
  
  // Add variety based on question index to prevent repetitive questions
  const questionType = questionTypes[questionIndex % questionTypes.length]
    .replace("{concept}", unitObjective || subject);
  
  // Add varied contexts
  const contextTemplate = contextTemplates[Math.floor(Math.random() * contextTemplates.length)]
    .replace("{subject}", subject)
    .replace("{product}", getRandomProductForSubject(subject))
    .replace("{phenomenon}", getRandomPhenomenonForSubject(subject));
  
  return `
${questionType}

${contextTemplate}

${subjectGuide}

${objectiveContent}

IMPORTANT QUESTION REQUIREMENTS:
1. Focus on deep understanding, application, and problem-solving—NOT simple recall
2. Require multi-step reasoning or calculation
3. Use real-world scenarios when possible
4. Include conceptual traps to test deep understanding
5. Ensure the question has one definitively correct answer
6. Make distractors (wrong options) plausible and based on common misconceptions
7. Ensure the correct answer isn't obvious
8. Make this question DIFFERENT from previous questions in structure, wording, and approach
9. Use unique contexts and examples not commonly found in textbooks
10. DO NOT create a question that looks like other questions - create something original

Format the response exactly like this JSON without any additional text:
{
  "question_text": "The complete question here, with all necessary context and complexity",
  "option_a": "First option - make this plausible and thoughtful",
  "option_b": "Second option - make this plausible and thoughtful",
  "option_c": "Third option - make this plausible and thoughtful",
  "option_d": "Fourth option - make this plausible and thoughtful",
  "correct_answer": "A, B, C, or D (just the letter)",
  "explanation": "A detailed explanation of why the correct answer is right and why other options are wrong, including the underlying concepts"
}
`;
}

// Helper functions to add diversity to prompts
function getRandomProductForSubject(subject: string): string {
  const productsBySubject: Record<string, string[]> = {
    'Mathematics': ['statistical software', 'financial instruments', 'engineering tools', 'cryptographic systems'],
    'Chemistry': ['pharmaceuticals', 'polymers', 'catalysts', 'specialty chemicals'],
    'Physics': ['optical instruments', 'aerospace components', 'electrical devices', 'quantum computers'],
    'Biology': ['vaccines', 'genetic tests', 'biomedical devices', 'agricultural products'],
    'History': ['historical documentation', 'museum exhibits', 'archaeological artifacts', 'educational materials'],
    'Geography': ['mapping software', 'climate models', 'urban planning tools', 'resource management systems'],
    'Civics': ['policy documents', 'governance frameworks', 'legal interpretations', 'ethical guidelines']
  };
  
  const products = productsBySubject[subject] || ['specialized products'];
  return products[Math.floor(Math.random() * products.length)];
}

function getRandomPhenomenonForSubject(subject: string): string {
  const phenomenaBySubject: Record<string, string[]> = {
    'Mathematics': ['exponential growth', 'statistical distributions', 'optimization problems', 'chaotic systems'],
    'Chemistry': ['catalytic reactions', 'polymer degradation', 'acid-base equilibria', 'redox processes'],
    'Physics': ['quantum entanglement', 'relativistic effects', 'electromagnetic interactions', 'thermodynamic processes'],
    'Biology': ['cellular signaling', 'ecological succession', 'genetic drift', 'immune responses'],
    'History': ['cultural diffusion', 'technological revolutions', 'political transformations', 'social movements'],
    'Geography': ['climate patterns', 'urbanization', 'resource depletion', 'migration flows'],
    'Civics': ['democratic participation', 'policy implementation', 'civil disobedience', 'institutional reform']
  };
  
  const phenomena = phenomenaBySubject[subject] || ['complex phenomena'];
  return phenomena[Math.floor(Math.random() * phenomena.length)];
}

// Chat response generation prompt
function generateChatResponsePrompt(subject: string, query: string, context: string = "") {
  const subjectGuide = subjectPromptGuides[subject as keyof typeof subjectPromptGuides] || '';
  
  return `
You are an advanced educational AI assistant specializing in ${subject || "academic subjects"}.

${subjectGuide ? `For ${subject} topics: ${subjectGuide}` : ""}

CONVERSATION CONTEXT:
${context}

USER QUERY:
${query}

Respond to the user's query with:
1. Clear, accurate, and in-depth information
2. Examples, analogies, or applications where appropriate
3. Structured explanations that build from foundational to advanced concepts
4. Mathematical notation, chemical equations, or diagrams when needed (using Markdown formatting)
5. A helpful, encouraging tone that promotes learning

Your response should demonstrate deep expertise in the subject while remaining accessible. Assume the user is a high school student preparing for advanced exams.
`;
}

// Function to generate a question using Hugging Face Inference API
async function generateQuestion(subject: string, unitObjective?: string, challengeLevel: string = "advanced", mode: string = "question", questionIndex: number = 0) {
  try {
    console.log(`Generating ${mode} for subject: ${subject}, objective: ${unitObjective || 'general'}, challenge level: ${challengeLevel}, question index: ${questionIndex}`);
    
    let prompt = "";
    if (mode === "chat") {
      // Handle chat mode
      prompt = generateChatResponsePrompt(subject, unitObjective || "");
    } else {
      // Handle question generation mode
      prompt = generateChallengingQuestionPrompt(subject, unitObjective, questionIndex);
    }
    
    // Try different models in order of preference
    const models = [
      "mistralai/Mistral-7B-Instruct-v0.1",
      "microsoft/Phi-2",
      "HuggingFaceH4/zephyr-7b-beta",
      "google/flan-t5-xl"
    ];
    
    let result = null;
    let error = null;
    
    // Try each model until one works
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            headers: {
              Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error with model ${model}:`, errorText);
          continue; // Try next model
        }
        
        result = await response.json();
        console.log(`Success with model ${model}`);
        break; // Break the loop if successful
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError);
        error = modelError;
      }
    }
    
    if (!result) {
      throw error || new Error("All AI models failed to generate content");
    }
    
    console.log("Raw AI response:", result);
    
    // Process based on mode
    if (mode === "chat") {
      // Extract text response for chat mode
      let generatedText = "";
      if (Array.isArray(result)) {
        generatedText = result[0]?.generated_text || "";
      } else {
        generatedText = result?.generated_text || "";
      }
      
      return { response: generatedText.trim() };
    } else {
      // Process question for question mode
      let generatedText = "";
      if (Array.isArray(result)) {
        generatedText = result[0]?.generated_text || "";
      } else {
        generatedText = result?.generated_text || "";
      }
      
      console.log("Generated text:", generatedText);
      
      // Improved JSON extraction - handles various response formats
      let jsonContent = generatedText;
      
      // Try to find JSON content within the text - look for the most complete JSON object
      const possibleJsons = generatedText.match(/\{[\s\S]*?\}/g) || [];
      
      // Find the longest JSON string which is likely the most complete
      if (possibleJsons.length > 0) {
        jsonContent = possibleJsons.reduce((a, b) => a.length > b.length ? a : b);
        console.log("Extracted JSON:", jsonContent);
      }
      
      try {
        let questionData = null;
        
        try {
          // Try parsing the extracted JSON
          questionData = JSON.parse(jsonContent);
        } catch (jsonError) {
          console.error("Error parsing extracted JSON:", jsonError);
          
          // Try fixing common JSON issues and parse again
          const fixedJson = jsonContent
            .replace(/(\w+):/g, '"$1":') // Convert unquoted keys to quoted keys
            .replace(/'/g, '"')          // Replace single quotes with double quotes
            .replace(/,\s*}/g, '}')      // Remove trailing commas
            .replace(/,\s*]/g, ']');     // Remove trailing commas in arrays
          
          try {
            questionData = JSON.parse(fixedJson);
            console.log("Parsed fixed JSON successfully");
          } catch (fixedJsonError) {
            console.error("Error parsing fixed JSON:", fixedJsonError);
            throw fixedJsonError; // Will be caught by outer catch block
          }
        }
        
        // Validate question format and fill in missing fields
        if (!questionData.question_text) questionData.question_text = `Question about ${subject}`;
        if (!questionData.option_a) questionData.option_a = "First option";
        if (!questionData.option_b) questionData.option_b = "Second option";
        if (!questionData.option_c) questionData.option_c = "Third option";
        if (!questionData.option_d) questionData.option_d = "Fourth option";
        if (!questionData.correct_answer) questionData.correct_answer = "A";
        if (!questionData.explanation) questionData.explanation = "Explanation not provided by the AI model.";
        
        // Normalize the correct answer to be uppercase single letter
        questionData.correct_answer = questionData.correct_answer.trim().charAt(0).toUpperCase();
        
        // Add additional fields
        questionData.id = crypto.randomUUID();
        questionData.subject = subject;
        questionData.difficulty_level = 3; // Always hard difficulty
        questionData.unit_objective = unitObjective || "";
        
        console.log("Successfully created question:", questionData);
        return questionData;
        
      } catch (parseError) {
        console.error("Error processing question JSON:", parseError);
        return createFallbackQuestion(subject, unitObjective, questionIndex);
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    if (mode === "chat") {
      return { response: "I'm sorry, I couldn't generate a response at this time. Please try again with a different question." };
    } else {
      return createFallbackQuestion(subject, unitObjective, questionIndex);
    }
  }
}

// Enhanced fallback question creation with more variety
function createFallbackQuestion(subject: string, unitObjective?: string, questionIndex: number = 0) {
  console.log(`Creating advanced fallback question for ${subject}, index: ${questionIndex}`);
  
  // Advanced subject-specific template questions focused on challenging concepts
  const templates: Record<string, any[]> = {
    "Mathematics": [
      {
        question_text: "In an arithmetic sequence, the 5th term is 13 and the 12th term is 41. What is the 20th term?",
        option_a: "78",
        option_b: "69",
        option_c: "81",
        option_d: "73",
        correct_answer: "B",
        explanation: "For an arithmetic sequence, we need to find the first term a and common difference d. Using the given terms: a₅ = a + 4d = 13 and a₁₂ = a + 11d = 41. Solving these equations: From the first equation, a = 13 - 4d. Substituting into the second: (13 - 4d) + 11d = 41, which gives 13 + 7d = 41, so 7d = 28, therefore d = 4. This means a = 13 - 4(4) = 13 - 16 = -3. Now we can find the 20th term: a₂₀ = a + 19d = -3 + 19(4) = -3 + 76 = 73."
      },
      {
        question_text: "A factory produces x units of a product at a cost of C(x) = 2000 + 5x + 0.01x² and sells them at a price of p(x) = 20 - 0.02x per unit. How many units should be produced to maximize profit?",
        option_a: "350",
        option_b: "400",
        option_c: "450", 
        option_d: "500",
        correct_answer: "A",
        explanation: "The profit function is Revenue - Cost = x·p(x) - C(x) = x(20 - 0.02x) - (2000 + 5x + 0.01x²) = 20x - 0.02x² - 2000 - 5x - 0.01x² = -2000 + 15x - 0.03x². To maximize profit, we take the derivative and set it equal to zero: P'(x) = 15 - 0.06x = 0, which gives x = 15/0.06 = 250. To verify this is a maximum, we note P''(x) = -0.06 < 0. Therefore, producing 250 units maximizes profit."
      },
      {
        question_text: "A researcher is modeling the spread of a technology using the logistic function P(t) = 1,000,000 / (1 + 999e^(-0.5t)), where t is time in years. At what time will the technology reach 75% of its maximum adoption?",
        option_a: "t = 8.39 years",
        option_b: "t = 13.82 years",
        option_c: "t = 10.39 years",
        option_d: "t = 9.19 years",
        correct_answer: "C",
        explanation: "The maximum adoption is 1,000,000. We need to find when P(t) = 0.75 × 1,000,000 = 750,000. So we solve: 750,000 = 1,000,000 / (1 + 999e^(-0.5t)). Multiplying both sides by (1 + 999e^(-0.5t)): 750,000(1 + 999e^(-0.5t)) = 1,000,000. Simplifying: 750,000 + 749,250,000e^(-0.5t) = 1,000,000. Therefore: 749,250,000e^(-0.5t) = 250,000. So e^(-0.5t) = 250,000/749,250,000 = 1/3. Taking natural log of both sides: -0.5t = ln(1/3) = -ln(3). Therefore: t = 2ln(3) ≈ 2.2 ≈ 10.39 years."
      }
    ],
    "Chemistry": [
      {
        question_text: "A buffer solution is prepared by mixing 0.20 mol of a weak acid HA (Ka = 1.8 × 10⁻⁵) with 0.15 mol of its conjugate base A⁻ in sufficient water to make 1.0 L of solution. If 0.01 mol of HCl is added to this buffer, what will be the new pH of the solution?",
        option_a: "4.78",
        option_b: "4.83",
        option_c: "5.06",
        option_d: "4.94",
        correct_answer: "A",
        explanation: "Initial buffer: [HA] = 0.20 M, [A⁻] = 0.15 M. Using the Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA]) = -log(1.8×10⁻⁵) + log(0.15/0.20) = 4.74 + log(0.75) = 4.74 - 0.12 = 4.62. When HCl is added, it reacts with A⁻: A⁻ + H⁺ → HA, so [HA] increases to 0.21 M and [A⁻] decreases to 0.14 M. The new pH = pKa + log([A⁻]/[HA]) = 4.74 + log(0.14/0.21) = 4.74 + log(0.67) = 4.74 - 0.18 = 4.56."
      },
      {
        question_text: "An industrial electrolysis cell uses a current of 50.0 A to plate copper from a CuSO₄ solution. How many grams of copper will be deposited in 2.00 hours? (Atomic mass of Cu = 63.5 g/mol, Faraday constant = 96,500 C/mol)",
        option_a: "62.5 g",
        option_b: "118.7 g",
        option_c: "59.4 g", 
        option_d: "31.7 g",
        correct_answer: "B",
        explanation: "In the electrolysis of CuSO₄, copper ions (Cu²⁺) are reduced to copper metal at the cathode: Cu²⁺ + 2e⁻ → Cu. We need to determine the amount of charge passed through the cell: Charge = Current × Time = 50.0 A × 2.00 h × 3600 s/h = 360,000 C. Using Faraday's law: moles of Cu = Charge ÷ (number of electrons × Faraday constant) = 360,000 C ÷ (2 × 96,500 C/mol) = 1.87 mol Cu. Mass of Cu = 1.87 mol × 63.5 g/mol = 118.7 g."
      }
    ],
    "Physics": [
      {
        question_text: "Two projectiles A and B are launched simultaneously from the ground. Projectile A has an initial velocity of 30 m/s at an angle of 60° above the horizontal, while projectile B has an initial velocity of 40 m/s at an angle of 30° above the horizontal. Ignoring air resistance and assuming g = 9.8 m/s², how far apart are the projectiles when they both reach the ground?",
        option_a: "159.2 m",
        option_b: "79.6 m",
        option_c: "40.8 m", 
        option_d: "118.3 m",
        correct_answer: "D",
        explanation: "For each projectile, the range is R = (v₀²sin(2θ))/g. For projectile A: RA = (30²×sin(120°))/9.8 = (900×0.866)/9.8 = 79.6 m. For projectile B: RB = (40²×sin(60°))/9.8 = (1600×0.866)/9.8 = 141.1 m. The distance between their landing spots is |RB - RA| = |141.1 - 79.6| = 61.5 m. Additionally, we need to consider that they don't land at the same time. The time of flight for A is tA = (2×30×sin(60°))/9.8 = 5.3 s, and for B is tB = (2×40×sin(30°))/9.8 = 4.1 s. This time difference causes an additional displacement, leading to a total separation of approximately 118.3 m."
      }
    ],
    "Biology": [
      {
        question_text: "In a dihybrid cross between two heterozygous parents (AaBb × AaBb), a researcher collects 320 offspring. Assuming complete dominance and independent assortment, approximately how many offspring would be expected to show both recessive phenotypes?",
        option_a: "80",
        option_b: "60",
        option_c: "20", 
        option_d: "40",
        correct_answer: "C",
        explanation: "In a dihybrid cross between heterozygous parents (AaBb × AaBb), the expected ratio of phenotypes is 9:3:3:1 (9/16 show both dominant traits, 3/16 show dominant A and recessive b, 3/16 show recessive a and dominant B, and 1/16 show both recessive traits). To find the number of offspring showing both recessive phenotypes (aabb), we calculate 1/16 of the total: 1/16 × 320 = 20 offspring."
      }
    ]
  };
  
  // Get template based on subject or use a generic one
  const subjectTemplates = templates[subject] || [{
    question_text: `A challenging question about ${subject}${unitObjective ? ` related to ${unitObjective}` : ''}`,
    option_a: "Option A - This would be a plausible but incorrect answer",
    option_b: "Option B - This would be the correct answer",
    option_c: "Option C - This would be a plausible but incorrect answer", 
    option_d: "Option D - This would be a plausible but incorrect answer",
    correct_answer: "B",
    explanation: "This is a fallback question created when AI generation failed. The correct answer would be B because of specific concepts and principles related to the topic."
  }];
  
  // Randomly select a template from the available ones for the subject
  // Use the questionIndex to try to get a different template each time
  const template = subjectTemplates[questionIndex % subjectTemplates.length];

  // Add metadata
  return {
    ...template,
    id: crypto.randomUUID(),
    subject: subject,
    difficulty_level: 3 // Hard difficulty
  };
}

// Function to check if a question aligns with a learning objective
function isQuestionAlignedWithObjective(question: any, objective: string): boolean {
  // Convert to lowercase for comparison
  const objectiveLower = objective.toLowerCase();
  const questionTextLower = question.question_text.toLowerCase();
  const optionsText = [
    question.option_a,
    question.option_b, 
    question.option_c, 
    question.option_d
  ].join(' ').toLowerCase();
  const explanationLower = question.explanation.toLowerCase();
  
  // Extract meaningful keywords from the objective (words longer than 3 characters)
  const objectiveKeywords = objectiveLower.split(/\s+/)
    .filter(word => word.length > 3) 
    .map(word => word.replace(/[^\w]/g, '')); // Remove non-word characters
  
  // Check if any keywords from the objective appear in the question or options or explanation
  const keywordInQuestion = objectiveKeywords.some(keyword => 
    questionTextLower.includes(keyword) || 
    optionsText.includes(keyword) ||
    explanationLower.includes(keyword)
  );
  
  // Calculate similarity scores
  const questionSimilarity = similarityScore(questionTextLower, objectiveLower);
  const optionsSimilarity = similarityScore(optionsText, objectiveLower);
  const explanationSimilarity = similarityScore(explanationLower, objectiveLower);
  
  // Determine alignment based on keyword presence and similarity
  const isAligned = 
    keywordInQuestion || 
    questionSimilarity > 0.2 || 
    optionsSimilarity > 0.2 ||
    explanationSimilarity > 0.2;
  
  console.log(`Question alignment check: ${isAligned ? 'ALIGNED' : 'NOT ALIGNED'}`);
  
  return isAligned;
}

// Text similarity helper function
function similarityScore(text1: string, text2: string): number {
  // Tokenize into words, remove short words and punctuation
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/[^\w]/g, '')));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/[^\w]/g, '')));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let commonWords = 0;
  for (const word of words1) {
    if (words2.has(word)) commonWords++;
  }
  
  // Return ratio of common words to total unique words
  return commonWords / (words1.size + words2.size - commonWords);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { 
      subject, 
      count = 1, 
      unitObjective,
      challengeLevel = "advanced",
      instructionType = "challenging",
      mode = "question",
      query = ""
    } = requestData;

    // Handle chat mode
    if (mode === "chat") {
      console.log(`Generating chat response for subject: ${subject}, query: ${query}`);
      
      const result = await generateQuestion(
        subject || "",
        query, // Use query as the input for chat
        "advanced", // Challenge level doesn't matter for chat
        "chat", // Specify chat mode
        0
      );
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle question generation mode
    if (!subject) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const questionCount = count || 1;
    
    console.log(`Generating ${questionCount} ${instructionType} questions for subject: ${subject}, objective: ${unitObjective || 'general'}`);

    // Generate multiple questions in parallel
    const questionPromises = [];
    for (let i = 0; i < questionCount; i++) {
      // Add some delay between requests to avoid overwhelming the API
      questionPromises.push(new Promise<any>(async (resolve) => {
        // Add a small delay to stagger requests
        await new Promise(r => setTimeout(r, i * 300));
        try {
          // Pass a different index for each question to ensure variety
          const question = await generateQuestion(subject, unitObjective, challengeLevel, "question", i);
          resolve(question);
        } catch (err) {
          console.error(`Failed to generate question ${i+1}:`, err);
          // Return a fallback question instead of failing completely
          resolve(createFallbackQuestion(subject, unitObjective, i));
        }
      }));
    }

    const generatedQuestions = await Promise.all(questionPromises);

    // Filter out any null questions
    const questions = generatedQuestions.filter(q => q !== null);

    if (questions.length === 0) {
      throw new Error("Failed to generate any valid questions");
    }

    // Ensure questions are diverse by checking similarity between them
    const uniqueQuestions = [];
    for (const question of questions) {
      // Check if this question is too similar to any already added question
      const isTooSimilar = uniqueQuestions.some(existingQ => {
        const textSimilarity = similarityScore(
          existingQ.question_text.toLowerCase(), 
          question.question_text.toLowerCase()
        );
        return textSimilarity > 0.4; // Reduced threshold to ensure greater diversity
      });
      
      if (!isTooSimilar) {
        uniqueQuestions.push(question);
      } else {
        console.log("Filtering out similar question, generating replacement");
        // Generate a replacement question when finding a duplicate
        try {
          const replacementQuestion = await generateQuestion(
            subject, 
            unitObjective, 
            challengeLevel, 
            "question", 
            uniqueQuestions.length + 10 // Use a larger offset to ensure variety
          );
          if (replacementQuestion) {
            uniqueQuestions.push(replacementQuestion);
          }
        } catch (err) {
          console.error("Error generating replacement question:", err);
        }
      }
    }
    
    // If we still don't have enough questions after filtering duplicates
    if (uniqueQuestions.length < questionCount) {
      console.log(`Not enough unique questions (have ${uniqueQuestions.length}, need ${questionCount}), generating more`);
      
      const additionalNeeded = questionCount - uniqueQuestions.length;
      const additionalPromises = [];
      
      for (let i = 0; i < additionalNeeded; i++) {
        additionalPromises.push(new Promise<any>(async (resolve) => {
          await new Promise(r => setTimeout(r, i * 300));
          try {
            // Use a much larger offset for these additional questions
            const question = await generateQuestion(subject, unitObjective, challengeLevel, "question", uniqueQuestions.length + i + 20);
            resolve(question);
          } catch (err) {
            console.error(`Failed to generate additional question ${i+1}:`, err);
            resolve(createFallbackQuestion(subject, unitObjective, uniqueQuestions.length + i));
          }
        }));
      }
      
      const additionalQuestions = await Promise.all(additionalPromises);
      uniqueQuestions.push(...additionalQuestions.filter(q => q !== null));
    }
    
    // Ensure we have exactly the number of questions requested
    const finalQuestions = uniqueQuestions.slice(0, questionCount);

    return new Response(
      JSON.stringify({ questions: finalQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in ai-generate-questions function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "The question generation service is currently experiencing issues. Please try again with a more specific learning objective or a different subject."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
