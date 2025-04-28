import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, File, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubjectTest {
  id: string;
  name: string;
  description: string | null;
  year: number;
  created_at: string;
}

interface TestFile {
  id: string;
  file_name: string;
  file_type: 'questions' | 'answers';
  file_url: string;
}

export const SubjectTests = () => {
  const {
    subjectId
  } = useParams<{
    subjectId: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();
  const [tests, setTests] = useState<SubjectTest[]>([]);
  const [newTestName, setNewTestName] = useState('');
  const [newTestYear, setNewTestYear] = useState(new Date().getFullYear());
  const [newTestDescription, setNewTestDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, [subjectId]);

  const fetchTests = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('subject_tests').select('*').eq('subject_id', subjectId).order('year', {
        ascending: false
      });
      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error(t('subjects.tests.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsCreating(true);
    try {
      const {
        error
      } = await supabase.from('subject_tests').insert({
        subject_id: subjectId,
        name: newTestName,
        description: newTestDescription || null,
        year: newTestYear,
        user_id: user.id
      });
      if (error) throw error;
      toast.success(t('subjects.tests.create_success'));
      setNewTestName('');
      setNewTestDescription('');
      setNewTestYear(new Date().getFullYear());
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error(t('subjects.tests.create_error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = async (testId: string, fileType: 'questions' | 'answers', file: File) => {
    if (!user) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${testId}_${fileType}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('subject-files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('subject-files')
        .getPublicUrl(filePath);

      const { error: fileError } = await supabase
        .from('test_files')
        .insert({
          test_id: testId,
          file_type: fileType,
          file_name: file.name,
          file_url: publicUrl,
          user_id: user.id
        });

      if (fileError) throw fileError;

      toast.success(t('subjects.tests.file_upload_success'));
      fetchTests();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('subjects.tests.file_upload_error'));
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('subject_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      
      toast.success(t('subjects.tests.delete_success'));
      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(t('subjects.tests.delete_error'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('subjects.tests.create_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testName">{t('subjects.tests.name')}</Label>
              <Input id="testName" value={newTestName} onChange={e => setNewTestName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testYear">{t('subjects.tests.year')}</Label>
              <Input id="testYear" type="number" value={newTestYear} onChange={e => setNewTestYear(Number(e.target.value))} required min="1900" max={new Date().getFullYear() + 1} />
            </div>
            
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t('common.loading') : t('subjects.tests.create')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map(test => (
          <Card key={test.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{test.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {test.year} - {new Date(test.created_at).toLocaleDateString()}
                  </p>
                  {test.description && <p className="text-sm text-muted-foreground mt-1">{test.description}</p>}
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteTest(test.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="file"
                    id={`questions-${test.id}`}
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(test.id, 'questions', e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor={`questions-${test.id}`}
                    className="flex items-center gap-2 justify-center w-full p-2 border rounded-md cursor-pointer hover:bg-secondary/50"
                  >
                    <FileText className="size-4" />
                    {t('subjects.tests.upload_questions')}
                  </label>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <input
                    type="file"
                    id={`answers-${test.id}`}
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(test.id, 'answers', e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor={`answers-${test.id}`}
                    className="flex items-center gap-2 justify-center w-full p-2 border rounded-md cursor-pointer hover:bg-secondary/50"
                  >
                    <File className="size-4" />
                    {t('subjects.tests.upload_answers')}
                  </label>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to={`/subjects/${subjectId}/tests/${test.id}`}>
                      Take Test
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {!loading && tests.length === 0 && <Card className="p-8 text-center text-muted-foreground">
          <p>{t('subjects.tests.no_tests')}</p>
        </Card>}
      </div>
    </div>
  );
};
