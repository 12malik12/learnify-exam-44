
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
    
    // Enhanced prompt for GROQ with more structured and detailed requirements
    const prompt = `
As an expert educational analyst, provide a personalized, actionable exam analysis for a student who scored ${score}% (${correctCount} correct out of ${totalQuestions} questions).

Based on this exam data, create a detailed, encouraging feedback report with these sections:

1. PERFORMANCE SUMMARY (Around 200-250 words)
   - Start with a warm, personalized greeting that acknowledges their effort
   - Provide a clear overview of their performance: score, areas of strength, and areas needing improvement
   - Mention 2-3 specific topics they performed well on (be specific about concepts, not question numbers)
   - Identify 2-3 specific topics they struggled with, including the percentage they got wrong in each area
   - Use an encouraging tone that builds confidence while being honest about areas for improvement
   - Connect their performance to broader learning goals in this subject
   - End with a bridging statement to the next section

2. AREAS TO STRENGTHEN (Around 250-300 words)
   - For each weak area (at least 3), provide:
     * The specific topic/concept name
     * The percentage of questions they got wrong on this topic
     * A brief explanation of why this concept is important in the broader subject
     * Common misconceptions or errors students make with this topic (be specific about the errors this student likely made)
     * How mastering this concept connects to future learning or real-world applications
   - Explain the relationships between these weak areas if applicable
   - Use supportive language that normalizes struggling with difficult concepts
   - For each topic, add a "Key insight" that gives them one important principle to remember

3. PERSONALIZED STUDY PLAN (Around 300-350 words)
   - Create a detailed, day-by-day study plan for the next week
   - For each day, recommend specific activities like:
     * Review specific resources (be specific about what to read/watch)
     * Practice problems (suggest 3-5 types of problems to work on)
     * Self-testing strategies
     * Interactive learning activities
   - Include time estimates for each activity (e.g., "30 minutes reviewing formulas")
   - Suggest specific resources when possible (textbooks, online platforms, videos)
   - Include a mix of learning approaches (visual, practice, discussion, etc.)
   - Add study tips specific to the subject matter
   - Suggest a method for the student to track their progress
   - End with a concrete next step they should take immediately after reading this plan

4. MOTIVATIONAL CLOSING (Around 100-150 words)
   - Provide a genuine, motivating message that acknowledges both their strengths and areas for growth
   - Include a specific action-oriented encouragement
   - Share a relevant insight about learning this subject
   - End with a forward-looking statement that inspires confidence
   - Use a warm, personal tone as if speaking directly to the student
   - Include a memorable quote or phrase they can use as a study mantra

Format the response with clear headings and good paragraph breaks for readability. Use bullet points or numbered lists where appropriate. The tone should be like a supportive, experienced tutor who genuinely cares about the student's growth—professional but warm, never condescending.

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
          { role: "system", content: "You are an expert educational analyst with years of experience providing personalized, actionable feedback to students. You excel at identifying specific knowledge gaps and creating detailed, structured learning plans. Your feedback is always specific, encouraging, and tailored to the individual student—never generic or templated. You write in a warm, supportive tone that motivates students while being honest about areas for improvement." },
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
