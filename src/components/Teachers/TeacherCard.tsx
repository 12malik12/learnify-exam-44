
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  resume_url?: string;
  resume_filename?: string;
  call_link?: string;
  created_at: string;
}

interface TeacherCardProps {
  teacher: Teacher;
}

export const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const handleJoinCall = () => {
    if (teacher.call_link) {
      window.open(teacher.call_link, "_blank");
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between">
          <span>{teacher.name}</span>
          <span className="text-sm font-normal text-muted-foreground mt-2 sm:mt-0">
            {teacher.subject}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Available since {formatDistanceToNow(new Date(teacher.created_at), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {teacher.resume_url && (
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={teacher.resume_url} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2" />
              Resume {teacher.resume_filename && `(${teacher.resume_filename.split('.').pop()})`}
            </a>
          </Button>
        )}
        {teacher.call_link && (
          <Button onClick={handleJoinCall} className="flex-1">
            <Video className="h-4 w-4 mr-2" />
            Join Video Call
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
