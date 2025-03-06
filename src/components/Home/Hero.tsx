
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BarChart3, Clock, Award } from "lucide-react";
import { Button } from "../UI/Button";

const Hero = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      const children = statsRef.current.children;
      for (let i = 0; i < children.length; i++) {
        observer.observe(children[i]);
      }
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-white to-secondary/30"
        aria-hidden="true"
      />
      
      {/* Floating graphics */}
      <div
        className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-ethiopia-green/5 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-ethiopia-yellow/5 blur-[100px]"
        aria-hidden="true"
      />
      
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex animate-fade-down items-center rounded-full bg-ethiopia-green/5 px-3 py-1 text-sm font-medium text-ethiopia-green">
            <span className="sm:hidden">New platform for students</span>
            <span className="hidden sm:inline">The first Ethiopian national exam preparation platform</span>
          </div>
          
          <h1 className="animate-fade-up text-balance font-bold tracking-tighter text-4xl md:text-5xl lg:text-6xl">
            Prepare for Your Future<br />
            <span className="bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red bg-clip-text text-transparent">
              One Exam at a Time
            </span>
          </h1>
          
          <p className="max-w-[600px] animate-fade-up text-muted-foreground md:text-lg/relaxed lg:text-xl/relaxed">
            The ultimate exam preparation app for Ethiopian 12th-grade students. 
            Practice with past papers, track your progress, and excel in your national exams.
          </p>
          
          <div className="mt-2 flex animate-fade-up flex-wrap gap-4">
            <Button asChild size="lg" className="animate-shimmer">
              <Link to="/subjects">Start Studying <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/exam">Try Mock Exams</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div 
          ref={statsRef}
          className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center opacity-0">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">12+</h3>
            <p className="text-sm text-muted-foreground">School Subjects</p>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center opacity-0">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="size-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">1000+</h3>
            <p className="text-sm text-muted-foreground">Practice Questions</p>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center opacity-0">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">24/7</h3>
            <p className="text-sm text-muted-foreground">Progress Tracking</p>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center opacity-0">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Award className="size-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">500+</h3>
            <p className="text-sm text-muted-foreground">Students Helped</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
