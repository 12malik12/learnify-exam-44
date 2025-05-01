
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
    
    // Construct the prompt for GROQ
    const prompt = `
Analyze the student's performance on this multiple-choice exam.

Each item includes the question, answer choices, student's answer, and correct answer.

Based on this data:
- Identify the student's weak areas and the concepts they struggle with
- Suggest specific topics or subtopics to review
- Recommend helpful materials, resources, or study tips

Here is the exam result data:
${formattedExamData}

Please provide a structured analysis with these sections:
1. Performance Summary (including a rough percentage score)
2. Identified Knowledge Gaps
3. Concepts to Review 
4. Recommended Study Strategy
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
          { role: "system", content: "You are an educational analyst specialized in identifying knowledge gaps and providing targeted learning recommendations." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
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
          answeredQuestions: examData.filter(q => q.student_answer).length
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
