
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const teacherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  call_link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema> & {
  resumeFile?: FileList;
};

export interface TeacherFormProps {
  onSuccess?: () => void;
}

export const TeacherForm = ({ onSuccess }: TeacherFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      call_link: "",
    },
  });
  
  const onSubmit = async (data: TeacherFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add a teacher");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let resumeUrl = null;
      let resumeFilename = null;
      
      // Handle file upload if there's a file
      if (data.resumeFile && data.resumeFile.length > 0) {
        const file = data.resumeFile[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('teacher_resumes')
          .upload(filePath, file);
          
        if (uploadError) {
          throw new Error(`Error uploading resume: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = await supabase.storage
          .from('teacher_resumes')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // Valid for 1 year
          
        if (publicUrlData) {
          resumeUrl = publicUrlData.signedUrl;
          resumeFilename = file.name;
        }
      }
      
      // Insert teacher data in database
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          name: data.name,
          subject: data.subject,
          call_link: data.call_link || null,
          resume_url: resumeUrl,
          resume_filename: resumeFilename,
          created_by: user.id,
        });
        
      if (teacherError) {
        throw new Error(`Error creating teacher: ${teacherError.message}`);
      }
      
      toast.success("Teacher added successfully!");
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast.error(error.message || "Failed to add teacher");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter teacher's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="resumeFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Resume (PDF or DOC)</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  className="cursor-pointer"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="call_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Call Link (e.g., https://meet.jit.si/RoomName)</FormLabel>
              <FormControl>
                <Input placeholder="Enter Jitsi meet link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Teacher
        </Button>
      </form>
    </Form>
  );
};
