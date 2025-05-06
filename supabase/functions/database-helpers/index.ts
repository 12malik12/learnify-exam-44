
// PostgreSQL functions for our app to use via RPC

// Function to insert a user exam record
export const createInsertUserExamFunction = `
CREATE OR REPLACE FUNCTION insert_user_exam(
  p_subject_id TEXT,
  p_score INTEGER,
  p_total_questions INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO user_exams (user_id, subject_id, score, total_questions)
  VALUES (auth.uid(), p_subject_id, p_score, p_total_questions)
  RETURNING jsonb_build_object('id', id) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
`;

// Function to insert a study session record
export const createInsertStudySessionFunction = `
CREATE OR REPLACE FUNCTION insert_study_session(
  p_subject_id TEXT,
  p_duration INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO study_sessions (user_id, subject_id, duration)
  VALUES (auth.uid(), p_subject_id, p_duration)
  RETURNING jsonb_build_object('id', id) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
`;

// Function to insert a user activity record
export const createInsertUserActivityFunction = `
CREATE OR REPLACE FUNCTION insert_user_activity(
  p_activity_type TEXT,
  p_subject_id TEXT,
  p_title TEXT,
  p_details JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO user_activities (user_id, activity_type, subject_id, title, details)
  VALUES (auth.uid(), p_activity_type, p_subject_id, p_title, p_details)
  RETURNING jsonb_build_object('id', id) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
`;

// CORS headers for API requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle database function calls directly
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the function name from the URL
    const url = new URL(req.url);
    const functionName = url.pathname.split('/').pop();
    
    // Get request body
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // If no body provided or invalid JSON, use empty object
    }
    
    // Get Supabase admin credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create admin client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    let result;
    
    // Handle specific function calls
    if (functionName === 'insert_user_exam') {
      const { p_subject_id, p_score, p_total_questions } = body;
      result = await supabase.rpc('insert_user_exam', { 
        p_subject_id, 
        p_score, 
        p_total_questions 
      });
    } 
    else if (functionName === 'insert_study_session') {
      const { p_subject_id, p_duration } = body;
      result = await supabase.rpc('insert_study_session', { 
        p_subject_id, 
        p_duration
      });
    } 
    else if (functionName === 'insert_user_activity') {
      const { p_activity_type, p_subject_id, p_title, p_details } = body;
      result = await supabase.rpc('insert_user_activity', { 
        p_activity_type, 
        p_subject_id, 
        p_title, 
        p_details
      });
    }
    else if (functionName === 'deploy') {
      // Deploy the functions
      const queries = [
        createInsertUserExamFunction,
        createInsertStudySessionFunction, 
        createInsertUserActivityFunction
      ];
      
      const results = [];
      for (const query of queries) {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          results.push({ success: false, message: error.message });
        } else {
          results.push({ success: true, message: 'Deployed successfully' });
        }
      }
      
      result = { data: { message: 'Database helper functions deployed', results }, error: null };
    }
    else {
      return new Response(
        JSON.stringify({ error: 'Function not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.error ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
