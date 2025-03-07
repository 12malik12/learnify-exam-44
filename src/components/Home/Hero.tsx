
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BarChart3, Clock, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const Hero = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
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
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24">
      {/* Background elements */}
      <div 
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/80 via-background to-background"
        aria-hidden="true"
      />
      
      {/* Decorative shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10">
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
          <circle cx="400" cy="400" r="400" fill="url(#paint0_radial_12_2)" />
          <defs>
            <radialGradient id="paint0_radial_12_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(90) scale(400)">
              <stop stopColor="#078930" />
              <stop offset="1" stopColor="#078930" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      
      <div 
        className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-ethiopia-yellow/10 blur-3xl"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Badge with glow effect */}
          <div className="inline-flex animate-fade-down items-center rounded-full bg-white shadow-md shadow-ethiopia-green/10 border border-ethiopia-green/10 px-3 py-1 text-sm font-medium text-ethiopia-green relative">
            <span className="absolute inset-0 rounded-full bg-ethiopia-green/5 animate-pulse" style={{animationDuration: '3s'}}></span>
            <Star className="h-3.5 w-3.5 mr-1" />
            <span className="relative">{t("home.hero.new")}</span>
          </div>
          
          <h1 className="animate-fade-up text-balance font-bold tracking-tighter text-4xl md:text-5xl lg:text-6xl">
            {t("home.hero.title")}<br />
            <span className="bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red bg-clip-text text-transparent">
              {t("app.slogan")}
            </span>
          </h1>
          
          <p className="max-w-[600px] animate-fade-up text-muted-foreground md:text-lg/relaxed lg:text-xl/relaxed">
            {t("home.hero.subtitle")}
          </p>
          
          <div className="mt-4 flex animate-fade-up flex-wrap gap-4">
            <Button 
              asChild 
              size="lg" 
              className="relative overflow-hidden group"
              variant="ethiopia"
            >
              <Link to="/subjects">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red opacity-0 group-hover:opacity-10 transition-opacity"></span>
                {t("home.hero.start")} <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-ethiopia-green/20 hover:border-ethiopia-green/40 text-ethiopia-green hover:text-ethiopia-green/90 hover:bg-ethiopia-green/5">
              <Link to="/exam">{t("home.hero.tryExams")}</Link>
            </Button>
          </div>
        </div>

        {/* Floating education icons */}
        <div className="absolute top-20 left-10 animate-float hidden lg:block">
          <div className="w-16 h-16 rounded-2xl rotate-12 bg-white/80 shadow-lg flex items-center justify-center text-ethiopia-green">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        
        <div className="absolute top-0 right-20 animate-float-delayed hidden lg:block">
          <div className="w-16 h-16 rounded-2xl -rotate-12 bg-white/80 shadow-lg flex items-center justify-center text-ethiopia-green">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Stats with improved styling */}
        <div 
          ref={statsRef}
          className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-white/50 backdrop-blur-sm shadow-sm p-4 text-center opacity-0 hover:shadow-md transition-shadow">
            <div className="flex size-12 items-center justify-center rounded-full bg-ethiopia-green/10">
              <BookOpen className="size-5 text-ethiopia-green" />
            </div>
            <h3 className="text-2xl font-bold">12+</h3>
            <p className="text-sm text-muted-foreground">School Subjects</p>
          </div>
          
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-white/50 backdrop-blur-sm shadow-sm p-4 text-center opacity-0 hover:shadow-md transition-shadow">
            <div className="flex size-12 items-center justify-center rounded-full bg-ethiopia-green/10">
              <Clock className="size-5 text-ethiopia-green" />
            </div>
            <h3 className="text-2xl font-bold">1000+</h3>
            <p className="text-sm text-muted-foreground">Practice Questions</p>
          </div>
          
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-white/50 backdrop-blur-sm shadow-sm p-4 text-center opacity-0 hover:shadow-md transition-shadow">
            <div className="flex size-12 items-center justify-center rounded-full bg-ethiopia-green/10">
              <BarChart3 className="size-5 text-ethiopia-green" />
            </div>
            <h3 className="text-2xl font-bold">24/7</h3>
            <p className="text-sm text-muted-foreground">Progress Tracking</p>
          </div>
          
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-white/50 backdrop-blur-sm shadow-sm p-4 text-center opacity-0 hover:shadow-md transition-shadow">
            <div className="flex size-12 items-center justify-center rounded-full bg-ethiopia-green/10">
              <Award className="size-5 text-ethiopia-green" />
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
