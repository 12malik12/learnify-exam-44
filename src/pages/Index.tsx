
import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import Hero from "@/components/Home/Hero";
import SubjectGrid from "@/components/Home/SubjectGrid";
import FeatureCard from "@/components/Home/FeatureCard";
import { BrainCircuit, Sparkles, LayoutDashboard, BookOpen, Network, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Hero />
        
        <SubjectGrid />
        
        {/* Features Section */}
        <section className="py-12 md:py-16 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Why Choose Learnify Ethiopia?
              </h2>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-lg">
                Our app provides everything you need to excel in your national exams.
                Study smarter, not harder with our comprehensive features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="AI-Powered Learning"
                description="Get personalized study recommendations and adaptive quizzes based on your performance."
                icon={BrainCircuit}
              />
              <FeatureCard
                title="Comprehensive Analytics"
                description="Track your progress and identify areas for improvement with detailed performance insights."
                icon={LayoutDashboard}
              />
              <FeatureCard
                title="Offline Access"
                description="Study anywhere, anytime, even without an internet connection with our offline mode."
                icon={Network}
              />
              <FeatureCard
                title="Past Exam Questions"
                description="Practice with real national exam questions from previous years to build confidence."
                icon={BookOpen}
              />
              <FeatureCard
                title="Time Management"
                description="Learn to manage your time effectively with timed mock exams that simulate the real test."
                icon={Clock}
              />
              <FeatureCard
                title="Multi-Language Support"
                description="Study in both Amharic and English to improve your understanding of concepts."
                icon={Sparkles}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12">
              {/* Gradient background */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-ethiopia-green/90"
                aria-hidden="true"
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Ready to start your exam preparation journey?
                </h2>
                <p className="mx-auto mt-4 max-w-[800px] text-primary-foreground/80 md:text-lg">
                  Begin studying today and take the first step towards achieving excellence in your national exams.
                  Our comprehensive platform is designed to help you succeed.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Link to="/subjects">Browse Subjects</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ethiopia"
                    className="border border-white/20"
                  >
                    <Link to="/exam">Take a Mock Exam</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
