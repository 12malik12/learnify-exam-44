
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://deno.land/x/openai@v1.3.0/mod.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");

if (!apiKey) {
  console.error("OPENAI_API_KEY is not set");
  Deno.exit(1);
}

const openai = new OpenAI(apiKey);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { questionCount, subject, unitObjective, examId } = await req.json();

    if (!questionCount || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing questionCount or subject" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const prompt = generateChallengingQuestionPrompt(subject, unitObjective);
      console.log("Prompting OpenAI with:", prompt);

      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices[0]?.message?.content;
      console.log("Received from OpenAI:", content);

      if (content) {
        try {
          const question = JSON.parse(content);
          question.id = `${examId}-${i}`; // Assign a unique ID
          question.subject = subject; // Add subject to the question
          questions.push(question);
        } catch (jsonError) {
          console.error("Failed to parse JSON:", jsonError);
          return new Response(
            JSON.stringify({ error: "Failed to parse JSON from OpenAI" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        console.error("No content received from OpenAI");
        return new Response(
          JSON.stringify({ error: "No content received from OpenAI" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ questions: questions, source: 'ai' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function execution error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateChallengingQuestionPrompt(subject: string, unitObjective?: string) {
  return `Generate a challenging multiple-choice question about ${subject}${unitObjective ? ` focusing on ${unitObjective}` : ''}.
The response should be in this JSON format only, no other text:
{
  "question_text": "The actual question text here",
  "option_a": "First option",
  "option_b": "Second option",
  "option_c": "Third option",
  "option_d": "Fourth option",
  "correct_answer": "A or B or C or D",
  "explanation": "Detailed explanation of why the correct answer is right"
}`;
}
