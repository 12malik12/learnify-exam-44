
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { subjects } from "@/utils/subjects";
import { ChevronRight } from "lucide-react";

const SubjectGrid = () => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-scale-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      const children = gridRef.current.children;
      for (let i = 0; i < children.length; i++) {
        observer.observe(children[i]);
        (children[i] as HTMLElement).style.opacity = "0";
      }
    }

    return () => observer.disconnect();
  }, []);

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/subjects/${subjectId}`);
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-10 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Explore Subjects
          </h2>
          <p className="mt-4 max-w-[700px] text-muted-foreground md:text-lg">
            Choose from a variety of subjects covered in the Ethiopian national exam curriculum. 
            Each subject includes comprehensive study materials and practice questions.
          </p>
        </div>

        <div 
          ref={gridRef} 
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {subjects.slice(0, 8).map((subject) => (
            <div
              key={subject.id}
              className="cursor-pointer opacity-0 flex flex-col rounded-xl border transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-1 overflow-hidden"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div className={`${subject.color} p-4`}>
                <span className="text-4xl">{subject.icon}</span>
                <h3 className="mt-2 text-lg font-semibold">{subject.name}</h3>
                {subject.nameAm && (
                  <p className="text-sm opacity-75">{subject.nameAm}</p>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subject.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{subject.numQuestions} questions</span>
                  <div className="flex items-center text-primary hover:underline">
                    <span>Study</span>
                    <ChevronRight className="size-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;
