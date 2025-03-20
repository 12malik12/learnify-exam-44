import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY') || '';

// Map difficulty levels to more specific instructions
const difficultyMap = {
  'easy': 'basic knowledge, suitable for beginners',
  'medium': 'intermediate knowledge, requiring some deeper understanding',
  'hard': 'advanced knowledge with multi-step reasoning and application of concepts, challenging even for experienced students'
};

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

// Enhanced challenging question generation prompt
function generateChallengingQuestionPrompt(subject: string, unitObjective?: string, questionIndex: number = 0) {
  const difficultyDescription = difficultyMap.hard;
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
  const questionTypes = [
    "Create a scenario-based question that requires analyzing a real-world application",
    "Design a question that requires multi-step reasoning and calculation",
    "Create a conceptual question that tests deep understanding of principles",
    "Design a question with a challenging twist that might initially mislead students",
    "Create a question requiring students to synthesize multiple concepts",
    "Design a question involving interpreting data or a graph",
    "Create a question that requires evaluating different approaches or solutions"
  ];
  
  const questionTypeInstruction = questionTypes[questionIndex % questionTypes.length];
  
  return `
${questionTypeInstruction} about ${subject} at hard difficulty level (${difficultyDescription}) ${objectiveContent}

${subjectGuide}

IMPORTANT QUESTION REQUIREMENTS:
1. Focus on deep understanding, application, and problem-solving—NOT simple recall
2. Require multi-step reasoning or calculation
3. Use real-world scenarios when possible
4. Include conceptual traps to test deep understanding
5. Ensure the question has one definitively correct answer
6. Make distractors (wrong options) plausible and based on common misconceptions
7. Ensure the correct answer isn't obvious
8. Make this question DIFFERENT from other questions in structure, wording, and approach
9. Use unique contexts and examples not commonly found in textbooks

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
      // Handle question generation mode - always using hard difficulty
      prompt = generateChallengingQuestionPrompt(subject, unitObjective, questionIndex);
    }
    
    // Try different models in order of preference
    const models = [
      "google/flan-t5-xl",
      "mistralai/Mistral-7B-Instruct-v0.1",
      "microsoft/Phi-2",
      "HuggingFaceH4/zephyr-7b-beta"
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
      // Parse the generated text to extract the JSON
      let generatedText = "";
      if (Array.isArray(result)) {
        generatedText = result[0]?.generated_text || "";
      } else {
        generatedText = result?.generated_text || "";
      }
      
      // Extract JSON from the text (the model might include other text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON is found, try to generate a structured question ourselves
        console.log("Failed to parse JSON from model response, creating a fallback question");
        return createFallbackQuestion(subject, "hard", unitObjective);
      }
      
      try {
        const questionData = JSON.parse(jsonMatch[0]);
        
        // Validate question format
        const missingFields = [];
        if (!questionData.question_text) missingFields.push("question_text");
        if (!questionData.option_a) missingFields.push("option_a");
        if (!questionData.option_b) missingFields.push("option_b");
        if (!questionData.option_c) missingFields.push("option_c");
        if (!questionData.option_d) missingFields.push("option_d");
        if (!questionData.correct_answer) missingFields.push("correct_answer");
        if (!questionData.explanation) missingFields.push("explanation");
        
        if (missingFields.length > 0) {
          console.log(`Generated question is missing fields: ${missingFields.join(", ")}`);
          return createFallbackQuestion(subject, "hard", unitObjective);
        }
        
        // Normalize the correct answer to be uppercase single letter
        questionData.correct_answer = questionData.correct_answer.trim().charAt(0).toUpperCase();
        
        // Add additional fields
        questionData.id = crypto.randomUUID();
        questionData.subject = subject;
        questionData.difficulty_level = 3;
        
        // Enhanced validation for unit objective alignment
        if (unitObjective && !isQuestionAlignedWithObjective(questionData, unitObjective)) {
          console.log("Question doesn't align with the learning objective, regenerating...");
          return generateQuestion(subject, unitObjective, challengeLevel, "question", questionIndex); // Recursively try again
        }
        
        return questionData;
      } catch (parseError) {
        console.error("Error parsing question JSON:", parseError);
        return createFallbackQuestion(subject, "hard", unitObjective);
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    if (mode === "chat") {
      return { response: "I'm sorry, I couldn't generate a response at this time. Please try again with a different question." };
    } else {
      return createFallbackQuestion(subject, "hard", unitObjective);
    }
  }
}

// Enhanced fallback question creation with subject-specific advanced templates
function createFallbackQuestion(subject: string, difficulty: string, unitObjective?: string) {
  console.log("Creating advanced fallback question");
  
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
        question_text: "An electrochemical cell is constructed with a zinc electrode in a 0.10 M Zn²⁺ solution and a copper electrode in a 0.20 M Cu²⁺ solution at 25°C. If the standard reduction potentials are E°(Zn²⁺/Zn) = -0.76 V and E°(Cu²⁺/Cu) = +0.34 V, what is the cell potential?",
        option_a: "1.08 V",
        option_b: "1.10 V", 
        option_c: "1.12 V",
        option_d: "1.14 V",
        correct_answer: "B",
        explanation: "The cell reaction is: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s). Using the Nernst equation: E = E° - (0.0592/n)log(Q) where E° = E°(cathode) - E°(anode) = 0.34 - (-0.76) = 1.10 V, n = 2 (electrons transferred), and Q = [Zn²⁺]/[Cu²⁺] = 0.10/0.20 = 0.50. So E = 1.10 - (0.0592/2)log(0.5) = 1.10 + 0.0089 = 1.11 V, which rounds to 1.10 V."
      }
    ],
    "Physics": [
      {
        question_text: "A projectile is launched from the ground with an initial velocity of 50 m/s at an angle of 37° above the horizontal. Assuming no air resistance and g = 9.8 m/s², what is the maximum height reached by the projectile?",
        option_a: "45.8 m",
        option_b: "62.3 m",
        option_c: "30.1 m", 
        option_d: "51.5 m",
        correct_answer: "A",
        explanation: "The initial vertical velocity component is v₀y = v₀sin(θ) = 50sin(37°) = 50 × 0.6 = 30 m/s. The maximum height is reached when the vertical velocity becomes zero, and can be calculated using the formula h = v₀y²/(2g) = 30²/(2 × 9.8) = 900/19.6 = 45.9 m, which rounds to 45.8 m."
      },
      {
        question_text: "A cylindrical water tank with radius 2 m and height 10 m is filled to the top. What is the force exerted by the water on the bottom of the tank? (Density of water = 1000 kg/m³, g = 9.8 m/s²)",
        option_a: "1.23 × 10⁶ N",
        option_b: "1.23 × 10⁵ N", 
        option_c: "3.92 × 10⁵ N",
        option_d: "7.85 × 10⁵ N",
        correct_answer: "A",
        explanation: "The force on the bottom is given by F = P × A, where P is the pressure at the bottom and A is the area of the bottom. Pressure at the bottom is P = ρgh = 1000 × 9.8 × 10 = 98,000 Pa. The area of the bottom is A = πr² = π × 2² = 12.57 m². Therefore, F = P × A = 98,000 × 12.57 = 1,231,860 N ≈ 1.23 × 10⁶ N."
      }
    ],
    "Biology": [
      {
        question_text: "In a dihybrid cross between two heterozygous parents (AaBb × AaBb), what is the probability of obtaining an offspring with the genotype aabb?",
        option_a: "1/4",
        option_b: "1/8",
        option_c: "1/16", 
        option_d: "3/16",
        correct_answer: "C",
        explanation: "For the genotype aabb to occur, the offspring must inherit the recessive allele 'a' from both parents AND the recessive allele 'b' from both parents. The probability of inheriting 'a' from a heterozygous parent (Aa) is 1/2, and the probability of inheriting 'b' from a heterozygous parent (Bb) is also 1/2. So the probability of aabb is (1/2 × 1/2) × (1/2 × 1/2) = 1/4 × 1/4 = 1/16."
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
  const template = subjectTemplates[Math.floor(Math.random() * subjectTemplates.length)];

  // If unit objective is provided, try to adapt the fallback question
  let adaptedTemplate = {...template};
  if (unitObjective) {
    adaptedTemplate.question_text = `Regarding ${unitObjective}: ${template.question_text}`;
  }
  
  // Add metadata
  return {
    ...adaptedTemplate,
    id: crypto.randomUUID(),
    subject: subject,
    difficulty_level: difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3)
  };
}

// Enhanced function to check if a question aligns with a learning objective
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
  console.log(`Keywords: ${objectiveKeywords.join(', ')}`);
  console.log(`Similarity scores - Question: ${questionSimilarity.toFixed(2)}, Options: ${optionsSimilarity.toFixed(2)}, Explanation: ${explanationSimilarity.toFixed(2)}`);
  
  return isAligned;
}

// Enhanced text similarity helper function
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
    // Always use hard difficulty
    const questionDifficulty = "hard";
    
    console.log(`Generating ${questionCount} ${instructionType} questions for subject: ${subject}, objective: ${unitObjective || 'general'}`);

    // Generate multiple questions in parallel with a more robust approach
    const questionPromises = [];
    for (let i = 0; i < questionCount; i++) {
      // Add some delay between requests to avoid overwhelming the API
      questionPromises.push(new Promise<any>(async (resolve) => {
        // Add a small delay to stagger requests
        await new Promise(r => setTimeout(r, i * 300));
        try {
          // Pass the question index to ensure question diversity
          const question = await generateQuestion(subject, unitObjective, challengeLevel, "question", i);
          resolve(question);
        } catch (err) {
          console.error(`Failed to generate question ${i+1}:`, err);
          // Return a fallback question instead of failing completely
          resolve(createFallbackQuestion(subject, questionDifficulty, unitObjective));
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
    // If we have multiple questions, filter out any that are too similar
    const uniqueQuestions = [];
    for (const question of questions) {
      // Check if this question is too similar to any already added question
      const isTooSimilar = uniqueQuestions.some(existingQ => {
        const textSimilarity = similarityScore(
          existingQ.question_text.toLowerCase(), 
          question.question_text.toLowerCase()
        );
        return textSimilarity > 0.6; // Threshold for similarity
      });
      
      if (!isTooSimilar) {
        uniqueQuestions.push(question);
      } else {
        console.log("Filtering out similar question");
      }
    }
    
    // If filtering removed too many questions, generate some more
    if (uniqueQuestions.length < Math.min(3, count)) {
      console.log("Not enough unique questions, attempting to generate more");
      // Call itself recursively but with a smaller count
      const additionalQuestionsResponse = await generateQuestion(subject, unitObjective, challengeLevel);
      if (additionalQuestionsResponse) {
        uniqueQuestions.push(additionalQuestionsResponse);
      }
    }

    return new Response(
      JSON.stringify({ questions: uniqueQuestions }),
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
