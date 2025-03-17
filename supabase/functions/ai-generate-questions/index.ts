
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
  'hard': 'advanced knowledge, challenging even for experienced students'
};

// Function to generate a question using Hugging Face Inference API
async function generateQuestion(subject: string, difficulty: string, unitObjective?: string) {
  const difficultyDescription = difficultyMap[difficulty as keyof typeof difficultyMap] || difficultyMap.medium;
  
  // Create a prompt that will generate a well-structured question
  // Include the unit objective if provided
  const objectivePrompt = unitObjective 
    ? `focusing specifically on this learning objective: "${unitObjective}". `
    : '';
  
  const prompt = `
Generate 1 multiple-choice question about ${subject} at ${difficulty} difficulty level (${difficultyDescription}) ${objectivePrompt}
The question should be educational, accurate, and directly related to the learning objective.

Format the response exactly like this JSON format without any additional text:
{
  "question_text": "The complete question here",
  "option_a": "First option",
  "option_b": "Second option",
  "option_c": "Third option",
  "option_d": "Fourth option",
  "correct_answer": "A, B, C, or D (just the letter)",
  "explanation": "A detailed explanation of why the correct answer is right and others are wrong"
}
`;

  try {
    console.log(`Generating question for subject: ${subject}, difficulty: ${difficulty}, objective: ${unitObjective || 'general'}`);
    
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
      throw error || new Error("All AI models failed to generate a question");
    }
    
    console.log("Raw AI response:", result);
    
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
      return createFallbackQuestion(subject, difficulty, unitObjective);
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
        return createFallbackQuestion(subject, difficulty, unitObjective);
      }
      
      // Normalize the correct answer to be uppercase single letter
      questionData.correct_answer = questionData.correct_answer.trim().charAt(0).toUpperCase();
      
      // Add additional fields
      questionData.id = crypto.randomUUID();
      questionData.subject = subject;
      questionData.difficulty_level = difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3);
      
      // Validate that the question aligns with the unit objective if one was provided
      if (unitObjective && !isQuestionAlignedWithObjective(questionData.question_text, unitObjective)) {
        console.log("Question doesn't align with the learning objective, regenerating...");
        return generateQuestion(subject, difficulty, unitObjective); // Recursively try again
      }
      
      return questionData;
    } catch (parseError) {
      console.error("Error parsing question JSON:", parseError);
      return createFallbackQuestion(subject, difficulty, unitObjective);
    }
  } catch (error) {
    console.error("Error generating question:", error);
    return createFallbackQuestion(subject, difficulty, unitObjective);
  }
}

// Create a simple fallback question when AI generation fails
function createFallbackQuestion(subject: string, difficulty: string, unitObjective?: string) {
  console.log("Creating fallback question");
  
  // Basic template questions for different subjects
  const templates: Record<string, any> = {
    "Mathematics": {
      question_text: "What is 8 + 5?",
      option_a: "12",
      option_b: "13",
      option_c: "14",
      option_d: "15",
      correct_answer: "B",
      explanation: "8 + 5 = 13"
    },
    "Science": {
      question_text: "Which of the following is NOT a state of matter?",
      option_a: "Solid",
      option_b: "Liquid",
      option_c: "Gas",
      option_d: "Energy",
      correct_answer: "D",
      explanation: "Energy is not a state of matter. The three common states of matter are solid, liquid, and gas."
    },
    "History": {
      question_text: "In which year did World War II end?",
      option_a: "1942",
      option_b: "1943",
      option_c: "1944",
      option_d: "1945",
      correct_answer: "D",
      explanation: "World War II ended in 1945 with the surrender of Germany in May and Japan in September."
    }
  };
  
  // Get template based on subject or use a generic one
  const template = templates[subject] || {
    question_text: `A question about ${subject}${unitObjective ? ` related to ${unitObjective}` : ''}`,
    option_a: "Option A",
    option_b: "Option B",
    option_c: "Option C",
    option_d: "Option D",
    correct_answer: "A",
    explanation: "This is a fallback question created when AI generation failed."
  };
  
  // Add metadata
  return {
    ...template,
    id: crypto.randomUUID(),
    subject: subject,
    difficulty_level: difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3)
  };
}

// Function to check if a question aligns with a learning objective
function isQuestionAlignedWithObjective(questionText: string, objective: string): boolean {
  // Simple check: convert both to lowercase and see if there's any keyword overlap
  const objectiveKeywords = objective.toLowerCase().split(' ')
    .filter(word => word.length > 3) // Only consider words longer than 3 chars to avoid common words
    .map(word => word.replace(/[^\w]/g, '')); // Remove non-word characters
  
  const questionTextLower = questionText.toLowerCase();
  
  // Consider the question aligned if at least one meaningful keyword from the objective appears in the question
  return objectiveKeywords.some(keyword => questionTextLower.includes(keyword)) ||
         // Or if the objective is short, check for a high percentage of similarity
         (objective.length < 50 && similarityScore(questionTextLower, objective.toLowerCase()) > 0.3);
}

// Simple text similarity helper function
function similarityScore(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));
  
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
    const { subject, difficulty, count, unitObjective } = await req.json();

    if (!subject) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const questionCount = count || 1;
    const questionDifficulty = difficulty || 'medium';
    
    console.log(`Generating ${questionCount} questions for subject: ${subject}, difficulty: ${questionDifficulty}, objective: ${unitObjective || 'general'}`);

    // Generate multiple questions in parallel
    const questionPromises = [];
    for (let i = 0; i < questionCount; i++) {
      questionPromises.push(generateQuestion(subject, questionDifficulty, unitObjective));
    }

    const generatedQuestions = await Promise.all(questionPromises);

    // Filter out any failed question generations
    const questions = generatedQuestions.filter(q => q !== null);

    if (questions.length === 0) {
      throw new Error("Failed to generate any valid questions");
    }

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in ai-generate-questions function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
