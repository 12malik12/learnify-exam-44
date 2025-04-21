import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';

// Log API key status (without revealing the key)
console.log(`GROQ_API_KEY status: ${GROQ_API_KEY ? 'Present (length: ' + GROQ_API_KEY.length + ')' : 'Missing or empty'}`);

if (!GROQ_API_KEY) {
  console.error(`⚠️ GROQ_API_KEY is not set! Set this secret in the Supabase dashboard:
  1. Go to your Supabase project dashboard
  2. Navigate to Settings -> API -> Edge Functions
  3. Add GROQ_API_KEY with your key from https://console.groq.com/keys
  `);
}

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
  "Design a question requiring synthesis of multiple aspects of {concept}",
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
  
  // Add a unique seed to force different questions
  const randomSeed = Math.floor(Math.random() * 10000);
  
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
11. Use this random seed to ensure uniqueness: ${randomSeed}

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

// Groq API models
const GROQ_MODELS = [
  "llama3-70b-8192", // Most capable
  "llama3-8b-8192",  // Faster response
  "mixtral-8x7b-32768", // Good for longer context
];

// Function to generate a question using Groq API
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
    
    // Check if API key is set
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set. Cannot use AI-powered question generation.");
      throw new Error("API key is not configured. Ask the administrator to set up GROQ_API_KEY.");
    }
    
    // Try models in sequence until one works
    let result = null;
    let lastError = null;
    
    for (const model of GROQ_MODELS) {
      try {
        console.log(`Attempting generation with Groq model: ${model}`);
        
        // Make up to 3 attempts with exponential backoff
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: "system", content: "You are a high-quality educational question generator that creates challenging questions in JSON format." },
                  { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.9
              })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error with Groq model ${model} (${response.status}): ${errorText}`);
              
              if (response.status === 429) {
                // Rate limit hit, wait with exponential backoff
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Rate limit hit. Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              }
              
              // Try next model for other errors
              throw new Error(`Groq API error (${response.status}): ${errorText}`);
            }
            
            const responseData = await response.json();
            console.log("Groq API response:", JSON.stringify(responseData).substring(0, 200) + "...");
            
            if (!responseData.choices || responseData.choices.length === 0) {
              throw new Error("Empty response from Groq API");
            }
            
            const content = responseData.choices[0].message.content;
            
            // Success, process the content
            result = content;
            break;
          } catch (attemptError) {
            console.error(`Error during attempt ${attempt + 1} with model ${model}:`, attemptError);
            lastError = attemptError;
            
            // Only retry on rate limits or temporary issues
            if (attemptError.message && attemptError.message.includes("429")) {
              const waitTime = Math.pow(2, attempt) * 1000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            
            // Otherwise try the next model
            break;
          }
        }
        
        // If we got a successful result, break out of the model loop
        if (result) break;
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError);
        lastError = modelError;
      }
    }
    
    if (!result) {
      throw lastError || new Error("All Groq models failed to generate content");
    }
    
    // Process based on mode
    if (mode === "chat") {
      // For chat mode, return the content directly
      return { response: result.trim() };
    } else {
      // For question mode, extract JSON from the response
      console.log("Extracting question data from result:", result.substring(0, 200) + "...");
      
      // First try to find a valid JSON structure in the response
      const extractValidJSON = (text: string) => {
        try {
          // Try to find a JSON object with the expected question fields
          const jsonRegex = /\{[\s\S]*?\bquestion_text\b[\s\S]*?\boption_a\b[\s\S]*?\boption_b\b[\s\S]*?\boption_c\b[\s\S]*?\boption_d\b[\s\S]*?\bcorrect_answer\b[\s\S]*?\bexplanation\b[\s\S]*?\}/g;
          const matches = text.match(jsonRegex);
          
          if (matches && matches.length > 0) {
            console.log(`Found ${matches.length} potential JSON matches`);
            
            // Try each match until we find a valid JSON
            for (const match of matches) {
              try {
                return JSON.parse(match);
              } catch (err) {
                console.log(`JSON parse failed for match: ${match.substring(0, 50)}...`);
                // Continue to next match
              }
            }
          }
          
          // Try to find JSON between triple backticks
          const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
          const codeBlockMatch = text.match(codeBlockRegex);
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              return JSON.parse(codeBlockMatch[1]);
            } catch (err) {
              console.log(`Failed to parse JSON from code block`);
            }
          }
          
          // Try the whole text as JSON (some models return just the JSON)
          try {
            return JSON.parse(text);
          } catch (err) {
            console.log(`Failed to parse entire response as JSON`);
          }
          
          return null;
        } catch (error) {
          console.error("Error in extractValidJSON:", error);
          return null;
        }
      };
      
      // Try to extract valid JSON from the response
      const questionData = extractValidJSON(result);
      
      if (questionData && questionData.question_text) {
        console.log("Successfully extracted JSON question data");
        
        // Normalize the correct answer to be uppercase single letter
        questionData.correct_answer = questionData.correct_answer.trim().charAt(0).toUpperCase();
        
        // Validate correct answer is one of A, B, C, D
        if (!['A', 'B', 'C', 'D'].includes(questionData.correct_answer)) {
          questionData.correct_answer = 'A';
        }
        
        // Add additional fields
        questionData.id = crypto.randomUUID();
        questionData.subject = subject;
        questionData.difficulty_level = 3; // Always hard difficulty
        questionData.unit_objective = unitObjective || "";
        questionData.created_at = new Date().toISOString();
        
        console.log("Successfully created question:", questionData);
        return questionData;
      } else {
        console.error("Failed to extract valid JSON question data, attempting to parse manually");
        
        // If JSON extraction failed, try to parse the data manually
        const extractField = (field: string, defaultValue: string = "") => {
          const patterns = [
            new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i'),
            new RegExp(`"${field}"\\s*:\\s*'([^']*)'`, 'i'),
            new RegExp(`${field}\\s*:\\s*"([^"]*)"`, 'i'),
            new RegExp(`${field}\\s*:\\s*'([^']*)'`, 'i'),
            new RegExp(`${field}\\s*=\\s*"([^"]*)"`, 'i'),
            new RegExp(`${field}\\s*=\\s*'([^']*)'`, 'i'),
            new RegExp(`${field}:\\s*([^,}\n]*)`, 'i'),
          ];
          
          for (const pattern of patterns) {
            const match = result.match(pattern);
            if (match && match[1] && match[1].trim()) {
              return match[1].trim();
            }
          }
          
          // Try to find the field in sections of text
          const sectionPatterns = [
            new RegExp(`${field}[:\\s]*(.*?)(?=option_|correct_|explanation|$)`, 'is'),
            new RegExp(`${field}[.:\\s]*(.*?)(?=\\n\\n|$)`, 'is'),
          ];
          
          for (const pattern of sectionPatterns) {
            const match = result.match(pattern);
            if (match && match[1] && match[1].trim()) {
              // Clean up the extracted text
              return match[1].trim().replace(/^[:"'\s]+|[:"'\s,]+$/g, '');
            }
          }
          
          return defaultValue;
        };
        
        // Extract question parts from the text
        const manuallyExtractedData = {
          question_text: extractField("question_text", `Question about ${subject}`),
          option_a: extractField("option_a", "First option"),
          option_b: extractField("option_b", "Second option"),
          option_c: extractField("option_c", "Third option"),
          option_d: extractField("option_d", "Fourth option"),
          correct_answer: extractField("correct_answer", "A"),
          explanation: extractField("explanation", "Explanation not provided"),
          id: crypto.randomUUID(),
          subject: subject,
          difficulty_level: 3,
          unit_objective: unitObjective || "",
          created_at: new Date().toISOString()
        };
        
        // Check if we extracted reasonable data
        const isReasonable = 
          manuallyExtractedData.question_text.length > 20 &&
          manuallyExtractedData.option_a.length > 5 &&
          manuallyExtractedData.option_b.length > 5 &&
          manuallyExtractedData.option_c.length > 5 &&
          manuallyExtractedData.option_d.length > 5;
        
        if (isReasonable) {
          console.log("Successfully created question through manual extraction:", manuallyExtractedData);
          
          // Normalize the correct answer
          manuallyExtractedData.correct_answer = manuallyExtractedData.correct_answer.trim().charAt(0).toUpperCase();
          if (!['A', 'B', 'C', 'D'].includes(manuallyExtractedData.correct_answer)) {
            manuallyExtractedData.correct_answer = 'A';
          }
          
          return manuallyExtractedData;
        }
        
        console.error("Manual extraction failed to produce reasonable question data");
        throw new Error("Failed to extract valid question data from AI response");
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    
    // Provide detailed error message for logs
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`AI question generation failed: ${errorMessage}`);
    
    if (mode === "chat") {
      return { 
        response: "I'm sorry, I couldn't generate a response at this time. The AI service encountered an error. Please try again later.",
        error: errorMessage 
      };
    } else {
      return { 
        ...createFallbackQuestion(subject, unitObjective, questionIndex),
        error: errorMessage,
        isAIGenerated: false
      };
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
  
  // Use the questionIndex to try to get a different template each time
  const template = subjectTemplates[questionIndex % subjectTemplates.length];

  // Add metadata
  return {
    ...template,
    id: crypto.randomUUID(),
    subject: subject,
    difficulty_level: 3, // Hard difficulty
    unit_objective: unitObjective || "",
    created_at: new Date().toISOString(),
    isAIGenerated: false // Mark clearly that this is a fallback question
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
      query = "",
      context = ""
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

    const questionCount = Math.min(count || 1, 10); // Limit to max 10 questions per request
    
    console.log(`Generating ${questionCount} ${instructionType} questions for subject: ${subject}, objective: ${unitObjective || 'general'}`);

    // First check if API key is configured
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set. Cannot use AI-powered question generation.");
      
      // Create fallback questions
      const fallbackQuestions = [];
      for (let i = 0; i < questionCount; i++) {
        fallbackQuestions.push(createFallbackQuestion(subject, unitObjective, i));
      }
      
      return new Response(
        JSON.stringify({ 
          questions: fallbackQuestions,
          source: 'fallback',
          error: "API key is not configured. Please set up GROQ_API_KEY in your Supabase Edge Function Secrets."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate multiple questions in parallel
    const questionPromises = [];
    for (let i = 0; i < questionCount; i++) {
      // Use a function to create a closure for the index
      const generateWithRetry = async (index: number) => {
        // Add a small delay to stagger requests to avoid rate limits
        await new Promise(r => setTimeout(r, index * 1000));
        
        // Try up to 3 times per question
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            // Add attempt number to ensure different prompts for each retry
            const question = await generateQuestion(
              subject, 
              unitObjective, 
              challengeLevel, 
              "question", 
              index * 100 + attempt // Multiply by 100 to ensure wide variety
            );
            
            // Verify we got a proper question and not a duplicate
            if (question && question.question_text && 
                question.question_text.length > 20 && 
                !question.question_text.includes("fallback")) {
              return {
                ...question,
                isAIGenerated: true
              };
            }
            
            console.log(`Retry ${attempt + 1}: Question generation didn't produce good result`);
            
            // Wait before retrying to avoid rate limits
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          } catch (err) {
            console.error(`Attempt ${attempt + 1} failed for question ${index + 1}:`, err);
            
            // If this is the last attempt, return the error information
            if (attempt === 2) {
              return {
                ...createFallbackQuestion(subject, unitObjective, index),
                error: err instanceof Error ? err.message : String(err),
                isAIGenerated: false
              };
            }
            
            // Wait before retrying with exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          }
        }
        
        // If all attempts failed, return a fallback with index to ensure variety
        return {
          ...createFallbackQuestion(subject, unitObjective, index),
          isAIGenerated: false
        };
      };
      
      questionPromises.push(generateWithRetry(i));
    }

    let generatedQuestions = await Promise.all(questionPromises);
    let usedFallback = false;
    let errorDetails = "";

    // Filter out any duplicates based on question text
    const seen = new Set();
    const uniqueQuestions = generatedQuestions.filter(q => {
      if (!q) return false;
      
      // Check if this question has an error and record it
      if (q.error && !errorDetails) {
        errorDetails = q.error;
      }
      
      // Track if we're using any fallback questions
      if (q.isAIGenerated === false) {
        usedFallback = true;
      }
      
      // Remove error field from final output
      delete q.error;
      
      // Use first 40 chars of question as a fingerprint
      const fingerprint = q.question_text.substring(0, 40).toLowerCase();
      if (seen.has(fingerprint)) return false;
      
      seen.add(fingerprint);
      return true;
    });
    
    // If we filtered out too many, add some different fallbacks
    if (uniqueQuestions.length < questionCount) {
      const additionalNeeded = questionCount - uniqueQuestions.length;
      for (let i = 0; i < additionalNeeded; i++) {
        const fallback = {
          ...createFallbackQuestion(
            subject, 
            unitObjective, 
            uniqueQuestions.length + i + 50 // Use a different offset
          ),
          isAIGenerated: false
        };
        uniqueQuestions.push(fallback);
        usedFallback = true;
      }
    }

    // Calculate how many AI-generated questions we actually have
    const aiGeneratedCount = uniqueQuestions.filter(q => q.isAIGenerated === true).length;
    const totalFallbackCount = uniqueQuestions.filter(q => q.isAIGenerated === false).length;
    
    // Clean up by removing the isAIGenerated field from output
    uniqueQuestions.forEach(q => {
      delete q.isAIGenerated;
    });

    // Determine source based on AI vs fallback ratio
    const source = aiGeneratedCount > 0 ? 'ai' : 'fallback';
    
    // Prepare response with detailed information
    return new Response(
      JSON.stringify({ 
        questions: uniqueQuestions.slice(0, questionCount),
        source: source,
        stats: {
          aiGenerated: aiGeneratedCount,
          fallbackUsed: totalFallbackCount,
          totalRequested: questionCount
        },
        error: errorDetails || undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in ai-generate-questions function:", error);
    
    // Generate fallback questions when an error occurs
    try {
      const { subject, count = 1, unitObjective } = await req.json();
      
      if (!subject) {
        throw new Error("Subject is required");
      }
      
      const fallbackQuestions = [];
      const questionCount = Math.min(count || 1, 10);
      
      for (let i = 0; i < questionCount; i++) {
        fallbackQuestions.push(createFallbackQuestion(subject, unitObjective, i));
      }
      
      return new Response(
        JSON.stringify({ 
          questions: fallbackQuestions,
          source: 'fallback',
          error: error instanceof Error ? error.message : String(error),
          fix: "To enable AI question generation, please set up the GROQ_API_KEY in your Supabase Edge Function Secrets."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate questions. Please try again or use a different subject.",
          message: "The question generation service is currently experiencing issues.",
          fix: "To enable AI question generation, please set up the GROQ_API_KEY in your Supabase Edge Function Secrets."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  }
});
