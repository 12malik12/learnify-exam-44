import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileDown, File, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { subjects } from "@/utils/subjects";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubjectTests } from "@/components/Subjects/SubjectTests";

interface ResourceFile {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  created_at: string | null;
  user_id: string | null;
}

const SubjectResources = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const subject = subjects.find(s => s.id === subjectId);
  
  if (!subject) {
    navigate("/subjects");
    return null;
  }

  useEffect(() => {
    fetchResources();
  }, [subjectId]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error(t("subjects.file_upload.error_loading"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t("subjects.file_upload.no_file"));
      return;
    }
    
    if (!user) {
      toast.error(t("auth.must_be_logged_in"));
      return;
    }

    setUploading(true);

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

      const { error: resourceError } = await supabase
        .from('resources')
        .insert({
          subject_id: subjectId,
          user_id: user.id,
          title: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_name: fileName,
          description: `File uploaded for ${subject.name}`
        });

      if (resourceError) {
        throw resourceError;
      }

      toast.success(t("subjects.file_upload.success"));
      setFile(null);
      
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';

      fetchResources();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t("subjects.file_upload.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDeleteResource = async (resourceId: string, fileName: string | null) => {
    if (!user) {
      toast.error(t("auth.must_be_logged_in"));
      return;
    }

    try {
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('subject-files')
          .remove([fileName]);
          
        if (storageError) throw storageError;
      }
      
      const { error: dbError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (dbError) throw dbError;
      
      toast.success(t("subjects.file_delete_success"));
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error(t("subjects.file_delete_error"));
    }
  };

  const getFileTypeIcon = (fileType: string | null) => {
    if (!fileType) return <File className="size-6" />;
    
    if (fileType.includes("pdf")) {
      return <File className="size-6 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <File className="size-6 text-green-500" />;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return <File className="size-6 text-blue-500" />;
    } else {
      return <File className="size-6" />;
    }
  };

  const isOwner = (resourceUserId: string | null): boolean => {
    return user?.id === resourceUserId;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <div className={`${subject.color.split(' ')[0]} rounded-full p-2 text-2xl`}>
                  {subject.icon}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                {language === "en" ? subject.name : subject.nameAm || subject.name} {t("subjects.resources")}
              </h1>
              
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                {t("subjects.resources_subtitle")}
              </p>

              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate("/subjects")}
              >
                {t("common.back_to_subjects")}
              </Button>
            </div>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-8">
          <Tabs defaultValue="resources" className="space-y-6">
            <TabsList>
              <TabsTrigger value="resources">{t("subjects.resources")}</TabsTrigger>
              <TabsTrigger value="tests">{t("subjects.tests.title")}</TabsTrigger>
            </TabsList>

            <TabsContent value="resources">
              <section className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("subjects.file_upload.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <input 
                        type="file" 
                        id="file-upload"
                        onChange={handleFileChange} 
                        className="hidden"
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
                      >
                        <File className="size-4" />
                        {file ? file.name : t("subjects.file_upload.browse")}
                      </label>
                      <Button 
                        onClick={handleUpload} 
                        disabled={!file || uploading}
                        className="inline-flex items-center gap-2"
                      >
                        <Upload className="size-4" />
                        {uploading ? t("subjects.file_upload.uploading") : t("subjects.file_upload.upload")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h2 className="text-2xl font-bold mb-6">{t("subjects.resources_list")}</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : resources.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                      <p>{t("subjects.no_resources")}</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {resources.map((resource) => (
                        <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getFileTypeIcon(resource.file_type)}
                              <div>
                                <h3 className="font-medium">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(resource.file_url, resource.title)}
                              >
                                <FileDown className="size-4 mr-2" />
                                {t("subjects.download")}
                              </Button>
                              
                              {isOwner(resource.user_id) && (
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleDeleteResource(resource.id, resource.file_name)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="tests">
              <SubjectTests />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubjectResources;
