
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ExamQuestion from '@/components/Exam/ExamQuestion';

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

// Define the shape of options from database as a simple interface
interface OptionsType {
  a: string;
  b: string;
  c: string;
  d: string;
}

// Define explicit type for URL parameters
interface TestParams {
  testId?: string;
  subjectId?: string;
}

export const TestViewer = () => {
  // Explicitly type the params to avoid deep type inference
  const params = useParams<TestParams>();
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
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId)
        .order('question_number');

      if (error) throw error;
      
      // Transform data to match our Question interface
      if (data && data.length > 0) {
        const formattedQuestions: Question[] = data.map(q => {
          // Ensure options is treated as a simple object
          let options: OptionsType = { a: '', b: '', c: '', d: '' };
          
          // Handle different possible formats of options
          if (q.options && typeof q.options === 'object') {
            // Use a simple any type casting to avoid complex inference
            const opts = q.options as any;
            options = {
              a: typeof opts.a === 'string' ? opts.a : '',
              b: typeof opts.b === 'string' ? opts.b : '',
              c: typeof opts.c === 'string' ? opts.c : '',
              d: typeof opts.d === 'string' ? opts.d : ''
            };
          }
          
          return {
            id: q.id,
            question_text: q.question_text,
            option_a: options.a,
            option_b: options.b,
            option_c: options.c,
            option_d: options.d,
            correct_answer: q.correct_answer || '',
            explanation: q.explanation || null,
            question_number: parseInt(q.question_number) || 0
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
