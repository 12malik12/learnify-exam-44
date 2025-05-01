
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
    
    // Enhanced prompt for GROQ with more specific instructions for personalization
    const prompt = `
Analyze this student's performance on a multiple-choice exam where they scored ${score}% (${correctCount} correct out of ${totalQuestions} questions).

Each question includes the full text, answer choices, the student's selected answer, and the correct answer.

Based on this data, provide a detailed and personalized analysis with these sections:

1. Performance Summary (Around 200 words)
   - Summarize the student's performance with specific details about score, strong areas, and weak areas
   - Use a warm, encouraging, and personalized tone like a real tutor
   - Mention 1-2 specific concepts they clearly understand well
   - Point out patterns in their incorrect answers (if any)

2. Identified Knowledge Gaps (Around 200 words)
   - Name the precise topics or concepts they struggled with based on incorrect answers
   - For each weak area, explain exactly why it might be challenging for them
   - Link these weak areas to specific questions they missed
   - Use a constructive, not critical, tone

3. Concepts to Review (Around 200 words)
   - List 3-5 specific subtopics they should review based on their performance
   - Explain each concept briefly and why it's important to understand
   - For each concept, mention how it connects to other important topics

4. Recommended Study Strategy (Around 200 words)
   - Suggest 3-5 actionable, concrete study activities for their specific weak areas
   - Recommend specific learning techniques tailored to their performance patterns
   - Include estimated time commitments for each activity
   - Use a motivating, encouraging tone that emphasizes growth
   - End with a positive, personalized note of encouragement

Here is the exam result data:
${formattedExamData}

Important: Be specific, detailed, and personal in your analysis. Mention actual topics and concepts from the questions. Write as a supportive, knowledgeable tutor who is genuinely interested in helping the student improve.
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
          { role: "system", content: "You are an educational expert with years of experience analyzing student performance and providing insightful, personalized feedback. You excel at identifying specific knowledge gaps and creating tailored learning plans. Your feedback is always specific, actionable, encouraging, and personalized—never generic or templated." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
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
