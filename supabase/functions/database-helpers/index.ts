
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
