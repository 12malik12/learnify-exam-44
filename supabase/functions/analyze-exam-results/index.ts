
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retrieve the GROQ_API_KEY from Supabase secrets
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { examData } = await req.json();
    
    if (!examData || !Array.isArray(examData) || examData.length === 0) {
      throw new Error("Invalid exam data provided");
    }
    
    console.log(`Processing analysis for ${examData.length} exam questions`);
    
    // Format the exam data for the GROQ prompt
    const formattedExamData = examData.map((question, index) => {
      return `
Question ${index + 1}: ${question.question_text}
A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}
Student's Answer: ${question.student_answer || 'Not answered'}
Correct Answer: ${question.correct_answer}
      `;
    }).join("\n\n");
    
    // Calculate basic stats for more personalized prompt
    const totalQuestions = examData.length;
    let correctCount = 0;
    examData.forEach(q => {
      if (q.student_answer === q.correct_answer) correctCount++;
    });
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // Group questions by topic if subject is provided
    const questionsByTopic = {};
    let subjectName = "";
    
    examData.forEach(q => {
      if (q.subject) {
        subjectName = q.subject;
      }
    });
    
    // Enhanced prompt for GROQ with more structured requirements
    const prompt = `
As an exceptional educator with decades of experience, provide a personalized, encouraging analysis of a student's exam performance. They scored ${score}% (${correctCount} correct out of ${totalQuestions} questions) on their ${subjectName || ""} exam.

Write a warm, conversational performance summary that feels like it was written by a human tutor who genuinely cares about this student's success. Avoid anything that sounds like AI-generated text.

Your analysis MUST follow this EXACT structure with these clear sections:

1. OVERVIEW SECTION:
   Provide a detailed summary of the student's overall performance. Highlight their strengths, offer a score breakdown, and identify any patterns in their answers. Be specific about what topics they showed mastery in and which areas need improvement. This section should give a comprehensive picture of their current understanding.

2. AREAS TO IMPROVE SECTION:
   List EVERY incorrectly answered question by number. For each one:
   - Identify the specific topic the question covers
   - Explain precisely why their answer was incorrect
   - Describe the conceptual misunderstanding that likely led to the error
   - Clarify what the correct approach should have been

3. NEXT STEPS SECTION:
   Focus ONLY on practical strategies and study techniques specifically tailored to help improve in the identified weak areas. Do NOT repeat the question explanations here - those belong in the previous section. Include:
   - Concrete study methods for each problem area
   - Specific resources they can use (books, websites, videos)
   - A clear, immediate action they can take tomorrow
   - End with encouraging words to motivate the student and help them stay committed to progress

General requirements:
- Write in a warm, conversational tone as if speaking directly to the student
- Do NOT use the student's name or any placeholders like [Student]
- Do NOT include section headers, formatting marks, or motivation quotes
- Do NOT mention that you're an AI or that this is AI-generated
- Focus on being specific and factual about their performance
- Keep your analysis concise (around 350-450 words)
- Never make up information - only reference what's evident from their answers

Here is the exam result data:
${formattedExamData}

Important: Focus on extracting patterns from the questions to determine the actual topics and subtopics the student needs help with. Be concrete and specific in your recommendations, not generic. Make your feedback actionable and motivating, helping the student understand exactly what to do next to improve their understanding.
`;

    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set. Cannot use AI-powered analysis.");
      throw new Error("API key is not configured. Ask the administrator to set up GROQ_API_KEY.");
    }
    
    console.log("Sending request to GROQ API");
    
    // Call GROQ API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are a highly experienced, compassionate educator with deep subject expertise and a talent for providing personalized, actionable feedback. Your guidance is warm, specific, and never feels formulaic or AI-generated. You excel at identifying knowledge gaps and creating tailored advice that feels like it's coming from a caring human mentor who knows the student well." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from GROQ API (${response.status}): ${errorText}`);
      throw new Error(`GROQ API error: ${response.status}`);
    }
    
    const groqResponse = await response.json();
    const analysis = groqResponse.choices[0].message.content;
    
    console.log("Analysis successfully generated");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        examStats: {
          totalQuestions: examData.length,
          answeredQuestions: examData.filter(q => q.student_answer).length,
          correctAnswers: correctCount,
          score: score
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-exam-results function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to analyze exam results" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
