
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { subjects } from "@/utils/subjects";
import { Card } from "@/components/UI/Card";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const Subjects = () => {
  const navigate = useNavigate();
  const { subjectProgress } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);

  useEffect(() => {
    const results = subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.nameAm &&
          subject.nameAm.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSubjects(results);
  }, [searchTerm]);

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/subjects/${subjectId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Header */}
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <BookOpen className="mr-1 size-3.5" />
                <span>All Subjects</span>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                Browse Study Materials
              </h1>
              
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Choose a subject to start learning and prepare for your exams
                with comprehensive study materials.
              </p>
              
              {/* Search bar */}
              <div className="relative mt-8 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-full border bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Subject Grid */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredSubjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <div className={`${subject.color} p-4 -mx-5 -mt-5 mb-4`}>
                    <div className="flex justify-between items-start">
                      <span className="text-4xl">{subject.icon}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-xs">Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-black/10">
                            <div
                              className="h-2 rounded-full bg-current"
                              style={{
                                width: `${subjectProgress[subject.id] || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {subjectProgress[subject.id] || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{subject.name}</h3>
                    {subject.nameAm && (
                      <p className="text-sm opacity-75">{subject.nameAm}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {subject.description}
                    </p>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {subject.numLessons} lessons
                      </span>
                      <div className="flex items-center text-primary">
                        <span>Study now</span>
                        <ChevronRight className="size-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {filteredSubjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No subjects found matching "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subjects;
