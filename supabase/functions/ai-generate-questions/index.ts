
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
  const difficultyDescription = difficultyMap[difficulty] || difficultyMap.medium;
  
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
    
    // Use Hugging Face Inference API with a free model that's good for this task
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-xl",
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
      console.error("Hugging Face API error:", errorText);
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
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
      throw new Error("Failed to parse JSON from model response");
    }
    
    try {
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validate question format
      if (!questionData.question_text || 
          !questionData.option_a || 
          !questionData.option_b || 
          !questionData.option_c || 
          !questionData.option_d || 
          !questionData.correct_answer || 
          !questionData.explanation) {
        throw new Error("Generated question data is incomplete");
      }
      
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
      throw new Error("Failed to parse question data from model response");
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
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

    const generatedQuestions = await Promise.all(
      questionPromises.map(p => p.catch(error => {
        console.error("Failed to generate a question:", error);
        return null;
      }))
    );

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
