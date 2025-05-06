
import { createClient } from '@supabase/supabase-js';
import { createInsertUserExamFunction, createInsertStudySessionFunction, createInsertUserActivityFunction } from './index';

// Edge function to deploy our database helper functions
Deno.serve(async (req) => {
  try {
    // Get Supabase admin credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    // Deploy the RPC functions
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
    
    return new Response(
      JSON.stringify({ 
        message: 'Database helper functions deployed',
        results
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
