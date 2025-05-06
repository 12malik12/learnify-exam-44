
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
    // Get request body
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // If no body provided or invalid JSON, use empty object
    }
    
    const action = body.action || '';
    
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
    
    // Handle specific actions
    if (action === 'reset_profile') {
      // Get current user
      const authHeader = req.headers.get('Authorization') || '';
      let userId = null;
      
      if (authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const { data: userData, error: userError } = await supabase.auth.getUser(token);
          
          if (userError) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          userId = userData.user?.id;
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Missing authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Reset user data - remove from all relevant tables
      const resetResults = [];
      
      // First, query to check if user_profiles exists
      const { data: profilesTableCheck } = await supabase.rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_profiles'
        );` 
      });
      
      const profilesTableExists = profilesTableCheck?.[0]?.exists || false;
      
      if (profilesTableExists) {
        // Delete from user_profiles if table exists
        const { data: profileReset, error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', userId);
          
        resetResults.push({ table: 'user_profiles', success: !profileError });
      } else {
        // Create user_profiles table if it doesn't exist
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              display_name TEXT,
              grade TEXT,
              location TEXT,
              avatar_url TEXT,
              total_study_time INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own profile"
              ON public.user_profiles
              FOR SELECT
              USING (auth.uid() = id);
              
            CREATE POLICY "Users can update their own profile"
              ON public.user_profiles
              FOR UPDATE
              USING (auth.uid() = id);
          `
        });
      }
      
      // Check if user_activities exists
      const { data: activitiesTableCheck } = await supabase.rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_activities'
        );` 
      });
      
      const activitiesTableExists = activitiesTableCheck?.[0]?.exists || false;
      
      if (activitiesTableExists) {
        // Delete from user_activities if table exists
        const { data: activitiesReset, error: activitiesError } = await supabase
          .from('user_activities')
          .delete()
          .eq('user_id', userId);
          
        resetResults.push({ table: 'user_activities', success: !activitiesError });
      } else {
        // Create user_activities table if it doesn't exist
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_activities (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              activity_type TEXT NOT NULL,
              subject_id TEXT,
              title TEXT NOT NULL,
              details JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own activities"
              ON public.user_activities
              FOR SELECT
              USING (auth.uid() = user_id);
          `
        });
      }
      
      // Check if user_exams exists
      const { data: examsTableCheck } = await supabase.rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_exams'
        );` 
      });
      
      const examsTableExists = examsTableCheck?.[0]?.exists || false;
      
      if (examsTableExists) {
        // Delete from user_exams if table exists
        const { data: examsReset, error: examsError } = await supabase
          .from('user_exams')
          .delete()
          .eq('user_id', userId);
          
        resetResults.push({ table: 'user_exams', success: !examsError });
      } else {
        // Create user_exams table if it doesn't exist
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_exams (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              subject_id TEXT NOT NULL,
              score INTEGER NOT NULL,
              total_questions INTEGER NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own exams"
              ON public.user_exams
              FOR SELECT
              USING (auth.uid() = user_id);
          `
        });
      }
      
      // Check if study_sessions exists
      const { data: sessionsTableCheck } = await supabase.rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'study_sessions'
        );` 
      });
      
      const sessionsTableExists = sessionsTableCheck?.[0]?.exists || false;
      
      if (sessionsTableExists) {
        // Delete from study_sessions if table exists
        const { data: sessionsReset, error: sessionsError } = await supabase
          .from('study_sessions')
          .delete()
          .eq('user_id', userId);
          
        resetResults.push({ table: 'study_sessions', success: !sessionsError });
      } else {
        // Create study_sessions table if it doesn't exist
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS public.study_sessions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              subject_id TEXT NOT NULL,
              duration INTEGER NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own study sessions"
              ON public.study_sessions
              FOR SELECT
              USING (auth.uid() = user_id);
          `
        });
      }
      
      // Check if user_progress exists
      const { data: progressTableCheck } = await supabase.rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_progress'
        );` 
      });
      
      const progressTableExists = progressTableCheck?.[0]?.exists || false;
      
      if (progressTableExists) {
        // Delete from user_progress if table exists
        const { data: progressReset, error: progressError } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userId);
          
        resetResults.push({ table: 'user_progress', success: !progressError });
      } else {
        // Create user_progress table if it doesn't exist
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_progress (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              subject_id TEXT NOT NULL,
              progress_percentage INTEGER DEFAULT 0,
              last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              UNIQUE (user_id, subject_id)
            );
            
            ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own progress"
              ON public.user_progress
              FOR SELECT
              USING (auth.uid() = user_id);
              
            CREATE POLICY "Users can update their own progress"
              ON public.user_progress
              FOR UPDATE
              USING (auth.uid() = user_id);
          `
        });
      }
      
      // Create fresh new profile entry
      const { data: newProfile, error: newProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          display_name: '',
          total_study_time: 0
        })
        .select();
        
      resetResults.push({ table: 'user_profiles_create', success: !newProfileError, data: newProfile });
      
      // Return results
      result = { 
        data: { 
          message: 'User profile has been reset', 
          results: resetResults 
        }, 
        error: null 
      };
    }
    else if (action === 'deploy') {
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
    // Handle other function calls
    else if (body.p_subject_id) {
      if (body.p_score !== undefined) {
        // Handle insert_user_exam
        const { data, error } = await supabase.rpc('insert_user_exam', { 
          p_subject_id: body.p_subject_id,
          p_score: body.p_score,
          p_total_questions: body.p_total_questions
        });
        result = { data, error };
      } 
      else if (body.p_duration !== undefined) {
        // Handle insert_study_session
        const { data, error } = await supabase.rpc('insert_study_session', { 
          p_subject_id: body.p_subject_id,
          p_duration: body.p_duration
        });
        result = { data, error };
      }
      else if (body.p_activity_type !== undefined) {
        // Handle insert_user_activity
        const { data, error } = await supabase.rpc('insert_user_activity', { 
          p_activity_type: body.p_activity_type,
          p_subject_id: body.p_subject_id,
          p_title: body.p_title,
          p_details: body.p_details || {}
        });
        result = { data, error };
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action or parameters' }),
        { 
          status: 400,
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
