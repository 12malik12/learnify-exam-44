
import React, { useState, useEffect } from "react";
import { TeacherCard, Teacher } from "./TeacherCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const TeachersList = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTeachers();
    
    // Set up a realtime subscription to teachers table
    const channel = supabase
      .channel('teachers_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'teachers' 
        }, 
        () => {
          // Refetch teachers when any changes occur
          fetchTeachers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setTeachers(data || []);
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        Error loading teachers: {error}
      </div>
    );
  }
  
  if (teachers.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No teachers available at the moment.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.map((teacher) => (
        <TeacherCard key={teacher.id} teacher={teacher} />
      ))}
    </div>
  );
};
