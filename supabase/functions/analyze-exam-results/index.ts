
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
Subject/Topic: ${question.subject || 'Not specified'}
Explanation: ${question.explanation || 'Not provided'}
      `;
    }).join("\n\n");
    
    // Calculate basic stats for more personalized prompt
    const totalQuestions = examData.length;
    let correctCount = 0;
    const incorrectQuestions = [];
    
    examData.forEach((q, index) => {
      if (q.student_answer === q.correct_answer) {
        correctCount++;
      } else {
        incorrectQuestions.push({
          questionNum: index + 1,
          question: q
        });
      }
    });
    
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // Group questions by topic if subject is provided
    const subjectsByQuestion = {};
    let mainSubject = "";
    
    examData.forEach((q, index) => {
      if (q.subject) {
        subjectsByQuestion[index + 1] = q.subject;
        if (!mainSubject) mainSubject = q.subject;
      }
    });
    
    // Enhanced prompt for GROQ with clearer structure requirements
    const prompt = `
As an exceptional educator with decades of experience, provide a detailed, personalized analysis of a student's exam performance. They scored ${score}% (${correctCount} correct out of ${totalQuestions} questions) on their ${mainSubject || ""} exam.

Your analysis MUST be organized into THREE DISTINCT SECTIONS (do not include these section headers in your response):

1. OVERVIEW SECTION:
   Provide a comprehensive and encouraging assessment of the student's performance. Include:
   - A detailed summary of their overall performance with specific strengths
   - Concrete observations about question-answering patterns
   - Notable areas of mastery
   - A positive but honest assessment of their current understanding level
   
   Write this section in a warm, conversational tone that acknowledges their effort while being specific about their achievements.

2. AREAS TO IMPROVE SECTION:
   You MUST analyze EACH incorrect question individually (${incorrectQuestions.length} questions total). For EACH incorrect question:
   - Begin with "Question X:" (where X is the question number)
   - Identify the specific topic/concept being tested
   - Explain precisely why their chosen answer was incorrect using specific details from the question
   - Describe the conceptual misunderstanding that likely led to their error
   - Clarify the correct approach and reasoning
   - End each question analysis with a brief takeaway lesson

   Be thorough - do not skip ANY incorrect question. This section should help the student understand exactly where and why they made each mistake.

3. NEXT STEPS SECTION:
   Focus EXCLUSIVELY on practical study strategies and resources that directly address the identified weak areas. Include:
   - Specific, actionable study methods for each topic where mistakes were made
   - Concrete resources (books, websites, videos) with actual names/titles when possible
   - A clear, immediate action plan they can implement (what to do tomorrow)
   - Skills to practice and concepts to review further
   - End with genuinely encouraging words that motivate ongoing effort

General requirements:
- Write in a warm, conversational tone as if speaking directly to the student
- Do NOT include section headers or formatting marks
- Be specific and factual - reference actual question content
- Keep your analysis concise but thorough (450-650 words)
- Avoid generic advice - tailor recommendations specifically to the student's mistakes

Here is the exam result data:
${formattedExamData}

IMPORTANT: Make absolutely certain that you address EVERY incorrect question in the Areas to Improve section. Do not group questions together or skip any. Number each question analysis clearly.
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
