import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for multiple Groq API keys
interface ApiKeyConfig {
  key: string;
  name: string;
  isAvailable: boolean;
  lastUsed: number;
  failureCount: number;
  cooldownUntil: number; // Track when a key can be used again after rate limit
}

// Initialize API key configurations
function initializeApiKeys(): ApiKeyConfig[] {
  const apiKeys: ApiKeyConfig[] = [];
  
  // Add primary API key
  const primaryKey = Deno.env.get("GROQ_API_KEY");
  if (primaryKey) {
    apiKeys.push({
      key: primaryKey,
      name: "Primary",
      isAvailable: true,
      lastUsed: 0,
      failureCount: 0,
      cooldownUntil: 0
    });
  }
  
  // Add additional API keys (GROQ_API_KEY_1, GROQ_API_KEY_2, etc.)
  for (let i = 1; i <= 10; i++) {
    const additionalKey = Deno.env.get(`GROQ_API_KEY_${i}`);
    if (additionalKey) {
      apiKeys.push({
        key: additionalKey,
        name: `Key-${i}`,
        isAvailable: true,
        lastUsed: 0,
        failureCount: 0,
        cooldownUntil: 0
      });
    }
  }
  
  const keyNames = apiKeys.map(k => k.name).join(", ");
  console.log(`Initialized ${apiKeys.length} API keys for question generation: ${keyNames}`);
  
  if (apiKeys.length < 2) {
    console.warn(`⚠️ Only ${apiKeys.length} API keys configured. Multiple keys are recommended for generating more than 10 questions.`);
  }
  
  return apiKeys;
}

// Get available API keys
const apiKeys = initializeApiKeys();

console.log(`API keys status: Found ${apiKeys.length} keys`);

if (apiKeys.length === 0) {
  console.error(`⚠️ No GROQ_API_KEY configured!
Set this secret using the Supabase CLI or in the dashboard:
1. Go to your Supabase project dashboard.
2. Navigate to 'Secrets' under 'Edge Functions'.
3. Add GROQ_API_KEY with your Groq API key from https://console.groq.com/keys .
Or, with the CLI: supabase secrets set GROQ_API_KEY=your_actual_key_here
For multiple keys, use GROQ_API_KEY_1, GROQ_API_KEY_2, etc.
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

// Enhanced challenging question generation prompt with much stronger uniqueness controls
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
      // Add more randomization - pick different units for different question indices
      const randomUnit = units[(questionIndex + units.length) % units.length];
      const objectives = learningObjectives[subject][randomUnit];
      if (objectives && objectives.length > 0) {
        // Add more randomization - pick different objectives for different question indices
        const randomObjective = objectives[(questionIndex + objectives.length) % objectives.length];
        objectiveContent = `focusing on this learning objective from ${randomUnit}: "${randomObjective}". The question must directly assess this objective.`;
      }
    }
  }
  
  // Add a stronger uniqueness requirement to the prompt to prevent repetitive questions
  // Add much more varied topics and concepts based on question index
  const uniquenessRequirements = [
    `Create a completely UNIQUE and ORIGINAL question unlike any other - question index #${questionIndex}`,
    `Design this question to be distinctly different from all others in the set - variation #${questionIndex}`,
    `This question MUST use a completely different scenario and context than others - uniqueness index #${questionIndex}`,
    `Make this question stand apart from others by using a novel approach - distinctiveness factor #${questionIndex}`,
    `Generate a question that is fundamentally different in structure and content - differentiation point #${questionIndex}`
  ];
  
  // Use different concepts for each question to enhance uniqueness
  const conceptVariations = [
    `advanced ${subject} concepts related to ${getRandomConceptForSubject(subject, questionIndex)}`,
    `challenging problems involving ${getRandomConceptForSubject(subject, questionIndex + 10)}`,
    `critical thinking about ${getRandomConceptForSubject(subject, questionIndex + 20)}`,
    `application-oriented scenarios for ${getRandomConceptForSubject(subject, questionIndex + 30)}`,
    `analysis-level problems concerning ${getRandomConceptForSubject(subject, questionIndex + 40)}`
  ];
  
  // Pick based on question index to ensure variety
  const uniquenessRequirement = uniquenessRequirements[questionIndex % uniquenessRequirements.length];
  const conceptVariation = conceptVariations[questionIndex % conceptVariations.length];
  
  // Add a unique seed value that changes with each question
  const randomSeed = Math.floor(Math.random() * 10000) + questionIndex * 1000;
  
  return `
${uniquenessRequirement}

Generate an original challenging question about ${conceptVariation}.

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
8. Make this question TOTALLY DIFFERENT from any other questions in structure, wording, approach, and concepts tested
9. Use unique contexts and examples not commonly found in textbooks
10. DO NOT create a question that resembles any other - create something entirely original
11. Use this question-specific unique ID to ensure diversity: QUID-${randomSeed}-${questionIndex}

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

// Helper function to get diverse concepts for each subject to ensure question variety
function getRandomConceptForSubject(subject: string, seed: number = 0): string {
  const conceptsBySubject: Record<string, string[]> = {
    'Mathematics': [
      'algebraic proofs', 'complex number operations', 'statistical inference', 
      'geometric transformations', 'calculus optimization', 'sequences and series',
      'probability distributions', 'vector spaces', 'differential equations',
      'number theory', 'graph theory', 'mathematical modeling', 'set theory'
    ],
    'Physics': [
      'projectile motion', 'fluid dynamics', 'electromagnetic induction', 
      'quantum phenomena', 'thermodynamic cycles', 'wave interference',
      'gravitational fields', 'nuclear reactions', 'circuit analysis',
      'optics', 'relative motion', 'energy transformations', 'magnetic fields'
    ],
    'Chemistry': [
      'equilibrium reactions', 'organic synthesis', 'kinetic theory', 
      'molecular structure', 'acid-base titrations', 'redox reactions',
      'intermolecular forces', 'chemical energetics', 'reaction mechanisms',
      'electrochemistry', 'coordination compounds', 'isomerism', 'periodic trends'
    ],
    'Biology': [
      'gene regulation', 'ecosystem dynamics', 'cellular respiration', 
      'evolutionary mechanisms', 'physiological systems', 'protein synthesis',
      'immune responses', 'hormonal control', 'plant physiology',
      'neural transmission', 'biodiversity', 'inheritance patterns', 'homeostasis'
    ],
    'History': [
      'political revolutions', 'economic systems', 'cultural movements', 
      'diplomatic relations', 'social reforms', 'technological innovations',
      'imperial expansion', 'religious conflicts', 'intellectual thought',
      'migration patterns', 'warfare tactics', 'environmental history', 'gender roles'
    ],
    'Geography': [
      'geomorphological processes', 'climate systems', 'population dynamics', 
      'urban development', 'resource management', 'agricultural patterns',
      'industrialization', 'transportation networks', 'cultural landscapes',
      'economic geography', 'political boundaries', 'environmental challenges', 'migration'
    ],
    'Civics': [
      'constitutional principles', 'judicial systems', 'electoral processes', 
      'civil liberties', 'government structures', 'public policy',
      'international relations', 'civic participation', 'legal frameworks',
      'human rights', 'federal systems', 'political ideologies', 'media influence'
    ]
  };
  
  // Default concepts if subject not found
  const defaultConcepts = ['fundamental principles', 'critical analysis', 'applied scenarios', 'theoretical models'];
  
  // Get concepts list for the subject, or use defaults
  const concepts = conceptsBySubject[subject] || defaultConcepts;
  
  // Use the seed to ensure different concepts for different question indices
  return concepts[(seed + concepts.length) % concepts.length];
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

// Groq API models (restrict strictly to Groq models)
const GROQ_MODELS = [
  "llama3-70b-8192", // Most capable Groq model
  "llama3-8b-8192",  // Faster response Groq model
];

// Function to get the next available API key
function getNextAvailableApiKey(): ApiKeyConfig | null {
  const now = Date.now();
  
  // Find keys that are available and not on cooldown
  const availableKeys = apiKeys.filter(k => k.isAvailable && now >= k.cooldownUntil);
  
  if (availableKeys.length === 0) {
    console.warn("No API keys currently available - all are either marked unavailable or on cooldown");
    
    // Check if any keys are just on cooldown
    const coolingDownKeys = apiKeys.filter(k => k.isAvailable && now < k.cooldownUntil);
    if (coolingDownKeys.length > 0) {
      // Sort by soonest available
      coolingDownKeys.sort((a, b) => a.cooldownUntil - b.cooldownUntil);
      const nextAvailableIn = Math.ceil((coolingDownKeys[0].cooldownUntil - now) / 1000);
      console.log(`Next key (${coolingDownKeys[0].name}) will be available in ${nextAvailableIn} seconds`);
    }
    
    return null;
  }
  
  // Sort by least recently used and fewest failures
  availableKeys.sort((a, b) => {
    if (a.failureCount !== b.failureCount) {
      return a.failureCount - b.failureCount; // Prefer keys with fewer failures
    }
    return a.lastUsed - b.lastUsed; // Otherwise prefer least recently used
  });
  
  const key = availableKeys[0];
  key.lastUsed = now;
  console.log(`Selected API key: ${key.name}`);
  return key;
}

// Mark an API key as failed
function markApiKeyFailure(keyConfig: ApiKeyConfig, reason: string): void {
  keyConfig.failureCount += 1;
  console.log(`API key ${keyConfig.name} failure (count: ${keyConfig.failureCount}): ${reason}`);
  
  // If rate limited, set a cooldown period
  if (reason.includes("429") || reason.includes("rate limit")) {
    keyConfig.cooldownUntil = Date.now() + 120 * 1000; // 2 minutes cooldown for rate limits
    console.log(`API key ${keyConfig.name} on cooldown until: ${new Date(keyConfig.cooldownUntil).toISOString()}`);
  }
  
  if (keyConfig.failureCount >= 3) { // Reduced from 5 to 3
    // Consider a key with 3+ failures as unavailable for this session
    keyConfig.isAvailable = false;
    console.warn(`API key ${keyConfig.name} marked as unavailable after ${keyConfig.failureCount} failures`);
  }
}

// Reset an API key's failure count after successful use
function markApiKeySuccess(keyConfig: ApiKeyConfig): void {
  if (keyConfig.failureCount > 0 || keyConfig.cooldownUntil > 0) {
    keyConfig.failureCount = 0;
    keyConfig.cooldownUntil = 0;
    console.log(`API key ${keyConfig.name} success - reset failure count and cooldown`);
  }
}

// Function to generate a question using Groq API with enhanced uniqueness guarantees
async function generateQuestion(subject: string, unitObjective?: string, challengeLevel: string = "advanced", mode: string = "question", questionIndex: number = 0) {
  try {
    console.log(`Generating ${mode} for subject: ${subject}, objective: ${unitObjective || 'general'}, challenge level: ${challengeLevel}, question index: ${questionIndex}`);
    
    let prompt = "";
    if (mode === "chat") {
      // Handle chat mode
      prompt = generateChatResponsePrompt(subject, unitObjective || "");
    } else {
      // Handle question generation mode with enhanced uniqueness
      prompt = generateChallengingQuestionPrompt(subject, unitObjective, questionIndex);
    }
    
    // Try all available API keys until success or exhaustion
    let result = null;
    let lastError = null;
    let apiKeyUsed = null;
    
    // Try with all available API keys - increased to 5 attempts
    for (let attempt = 0; attempt < 5; attempt++) {
      // Get the next available API key
      const apiKeyConfig = getNextAvailableApiKey();
      
      if (!apiKeyConfig) {
        console.error(`No available API keys remaining on attempt ${attempt + 1}. Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue; // Try again after waiting
      }
      
      const GROQ_API_KEY = apiKeyConfig.key;
      apiKeyUsed = apiKeyConfig.name;
      console.log(`Attempt ${attempt + 1} using API key ${apiKeyConfig.name}`);
      
      try {
        // Try Groq models only with retry logic (restricted to Groq exclusively)
        for (const model of GROQ_MODELS) {
          try {
            console.log(`Attempting generation with Groq model: ${model}`);
            
            // Add more randomization to each API call
            const temperature = 0.7 + (questionIndex * 0.05) % 0.3; // Vary between 0.7 and 1.0
            const maxTokens = 1024 + (questionIndex * 100) % 500; // Vary between 1024 and 1524
            const topP = 0.9 + (questionIndex * 0.02) % 0.1; // Vary between 0.9 and 1.0
            
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: "system", content: `You are a high-quality educational question generator that creates challenging and UNIQUE questions in JSON format. Question index: ${questionIndex}` },
                  { role: "user", content: prompt }
                ],
                temperature: temperature,
                max_tokens: maxTokens,
                top_p: topP
              })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error with Groq model ${model} (${response.status}): ${errorText}`);
              
              if (response.status === 429) {
                // Rate limit hit - mark this key as failed and try another key
                markApiKeyFailure(apiKeyConfig, `Rate limit (429) when using ${model}`);
                break; // Skip remaining models for this key and try another key
              }
              
              throw new Error(`Groq API error (${response.status}): ${errorText}`);
            }
            
            const responseData = await response.json();
            console.log("Groq API response:", JSON.stringify(responseData).substring(0, 200) + "...");
            
            if (!responseData.choices || responseData.choices.length === 0) {
              throw new Error("Empty response from Groq API");
            }
            
            const content = responseData.choices[0].message.content;
            
            // Success - mark this key as successful
            markApiKeySuccess(apiKeyConfig);
            
            // Process the content
            result = content;
            break;
          } catch (modelError) {
            console.error(`Error with model ${model}:`, modelError);
            lastError = modelError;
            
            if (modelError.message && modelError.message.includes("429")) {
              markApiKeyFailure(apiKeyConfig, `Rate limit error with model ${model}`);
              break; // Skip remaining models for this key
            }
          }
        }
        
        if (result) break; // If we got a result, break out of the API key loop
      } catch (keyError) {
        console.error(`Error with API key ${apiKeyConfig.name}:`, keyError);
        markApiKeyFailure(apiKeyConfig, keyError.message || "Unknown error");
        lastError = keyError;
      }
    }
    
    if (!result) {
      throw lastError || new Error("All API keys and models failed to generate content");
    }
    
    if (mode === "chat") {
      return { response: result.trim() };
    } else {
      console.log("Extracting question data from result:", result.substring(0, 200) + "...");
      
      const extractValidJSON = (text: string) => {
        try {
          const jsonRegex = /\{[\s\S]*?\bquestion_text\b[\s\S]*?\boption_a\b[\s\S]*?\boption_b\b[\s\S]*?\boption_c\b[\s\S]*?\boption_d\b[\s\S]*?\bcorrect_answer\b[\s\S]*?\bexplanation\b[\s\S]*?\}/g;
          const matches = text.match(jsonRegex);
          
          if (matches && matches.length > 0) {
            for (const match of matches) {
              try {
                return JSON.parse(match);
              } catch (err) {
              }
            }
          }
          
          const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
          const codeBlockMatch = text.match(codeBlockRegex);
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              return JSON.parse(codeBlockMatch[1]);
            } catch (err) {
            }
          }
          
          try {
            return JSON.parse(text);
          } catch (err) {
          }
          
          return null;
        } catch (error) {
          console.error("Error in extractValidJSON:", error);
          return null;
        }
      };
      
      const questionData = extractValidJSON(result);
      
      if (questionData && questionData.question_text) {
        questionData.correct_answer = questionData.correct_answer.trim().charAt(0).toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(questionData.correct_answer)) {
          questionData.correct_answer = 'A';
        }
        
        // Add more entropy to the question ID to ensure uniqueness
        questionData.id = `${crypto.randomUUID()}-${questionIndex}-${Date.now() % 10000}`;
        questionData.subject = subject;
        questionData.difficulty_level = 3;
        questionData.unit_objective = unitObjective || "";
        questionData.created_at = new Date().toISOString();
        questionData.apiKeyUsed = apiKeyUsed; // Track which API key was used
        
        console.log("Successfully created question:", questionData);
        return questionData;
      } else {
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
          
          const sectionPatterns = [
            new RegExp(`${field}[:\\s]*(.*?)(?=option_|correct_|explanation|$)`, 'is'),
            new RegExp(`${field}[.:\\s]*(.*?)(?=\\n\\n|$)`, 'is'),
          ];
          
          for (const pattern of sectionPatterns) {
            const match = result.match(pattern);
            if (match && match[1] && match[1].trim()) {
              return match[1].trim().replace(/^[:"'\s]+|[:"'\s,]+$/g, '');
            }
          }
          
          return defaultValue;
        };
        
        // Add more entropy to the question ID to ensure uniqueness
        const uniqueId = `${crypto.randomUUID()}-${questionIndex}-${Date.now() % 10000}`;
        
        const manuallyExtractedData = {
          question_text: extractField("question_text", `Question about ${subject}`),
          option_a: extractField("option_a", "First option"),
          option_b: extractField("option_b", "Second option"),
          option_c: extractField("option_c", "Third option"),
          option_d: extractField("option_d", "Fourth option"),
          correct_answer: extractField("correct_answer", "A"),
          explanation: extractField("explanation", "Explanation not provided"),
          id: uniqueId,
          subject: subject,
          difficulty_level: 3,
          unit_objective: unitObjective || "",
          created_at: new Date().toISOString(),
          apiKeyUsed: apiKeyUsed // Track which API key was used
        };
        
        const isReasonable = 
          manuallyExtractedData.question_text.length > 20 &&
          manuallyExtractedData.option_a.length > 5 &&
          manuallyExtractedData.option_b.length > 5 &&
          manuallyExtractedData.option_c.length > 5 &&
          manuallyExtractedData.option_d.length > 5;
        
        if (isReasonable) {
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
        explanation: "The maximum adoption is 1,000,000. We need to find when P(t) = 0.75 × 1,000
