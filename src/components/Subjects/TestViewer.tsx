
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ExamQuestion from '@/components/Exam/ExamQuestion';
import { Json } from '@/integrations/supabase/types';

// Define the Question interface to match our database structure
interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  question_number: number;
}

// Define the shape of data received from the database
interface DatabaseQuestionRow {
  id: string;
  question_text: string;
  options: Json;
  correct_answer: string;
  explanation: string | null;
  question_number: string;
  created_at?: string;
  updated_at?: string;
  difficulty?: string;
  tags?: string[] | null;
}

export const TestViewer = () => {
  const params = useParams();
  const testId = params.testId;
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchQuestions();
    }
  }, [testId]);

  const fetchQuestions = async () => {
    if (!testId) return;

    try {
      // Use explicit type assertion for the data returned from Supabase
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId)
        .order('question_number');

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform database questions into our Question interface format
        // Use type assertion to avoid deep type instantiation
        const formattedQuestions = (data as any[]).map((q) => {
          // Safely handle options which might be a JSON object or string
          let optionsObj: Record<string, string> = {};
          
          if (typeof q.options === 'object' && q.options !== null) {
            optionsObj = q.options as Record<string, string>;
          }
          
          return {
            id: q.id,
            question_text: q.question_text,
            option_a: String(optionsObj.a || ''),
            option_b: String(optionsObj.b || ''),
            option_c: String(optionsObj.c || ''),
            option_d: String(optionsObj.d || ''),
            correct_answer: q.correct_answer || '',
            explanation: q.explanation,
            question_number: Number(q.question_number) || 0
          };
        });
        
        setQuestions(formattedQuestions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit answers');
      return;
    }

    try {
      // Create user responses for analytics
      // Note: This is commented out because the user_responses table doesn't exist yet
      /*
      const responses = Object.entries(userAnswers).map(([questionId, selectedAnswer]) => {
        const question = questions.find(q => q.id === questionId);
        return {
          user_id: user.id,
          question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: question?.correct_answer === selectedAnswer
        };
      });

      const { error } = await supabase
        .from('user_responses')
        .insert(responses);

      if (error) throw error;
      */
      
      setShowResults(true);
      toast.success('Test submitted successfully!');
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Failed to submit answers');
    }
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <ExamQuestion
          key={question.id}
          question={question}
          selectedAnswer={userAnswers[question.id] || null}
          onSelectAnswer={(answer) => handleAnswerSelect(question.id, answer)}
          showCorrectAnswer={showResults}
          questionNumber={index + 1}
        />
      ))}
      
      {!showResults && (
        <Button 
          onClick={handleSubmit}
          disabled={Object.keys(userAnswers).length !== questions.length}
          className="w-full mt-4"
        >
          Submit Test
        </Button>
      )}

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              Score: {
                Object.entries(userAnswers).filter(([questionId]) => {
                  const question = questions.find(q => q.id === questionId);
                  return question?.correct_answer === userAnswers[questionId];
                }).length
              } / {questions.length}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
