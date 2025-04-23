
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface SubjectFileUploadProps {
  subjectId: string;
}

export const SubjectFileUpload: React.FC<SubjectFileUploadProps> = ({ subjectId }) => {
  const [file, setFile] = useState<File | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t('subjects.file_upload.no_file'));
      return;
    }

    if (!user) {
      toast.error(t('auth.must_be_logged_in'));
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${subjectId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('subject-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            subject_id: subjectId,
            user_id: user.id
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('subject-files')
        .getPublicUrl(filePath);

      // Save file metadata to resources table
      const { error: resourceError } = await supabase
        .from('resources')
        .insert({
          subject_id: subjectId,
          user_id: user.id,
          title: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_name: fileName,
          description: `File uploaded for ${subjectId}`
        });

      if (resourceError) {
        throw resourceError;
      }

      toast.success(t('subjects.file_upload.success'));
      setFile(null);
      
      // Clear file input
      const input = document.getElementById(`file-upload-${subjectId}`) as HTMLInputElement;
      if (input) input.value = '';

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('subjects.file_upload.error'));
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-md">
      <input 
        type="file" 
        id={`file-upload-${subjectId}`}
        onChange={handleFileChange} 
        className="hidden"
      />
      <label 
        htmlFor={`file-upload-${subjectId}`} 
        className="cursor-pointer inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm hover:bg-secondary/80"
      >
        <File className="size-4" />
        {file ? file.name : t('subjects.file_upload.browse')}
      </label>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleUpload} 
        disabled={!file || !user}
        className="ml-auto"
      >
        <Upload className="size-4 mr-2" />
        {t('subjects.file_upload.upload')}
      </Button>
    </div>
  );
};
