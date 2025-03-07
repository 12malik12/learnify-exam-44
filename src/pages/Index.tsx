
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import Hero from "@/components/Home/Hero";
import SubjectGrid from "@/components/Home/SubjectGrid";
import FeatureCard from "@/components/Home/FeatureCard";
import { BrainCircuit, Sparkles, LayoutDashboard, BookOpen, Network, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import AIAssistantButton from "@/components/AIAssistant/AIAssistantButton";
import AIAssistantDialog from "@/components/AIAssistant/AIAssistantDialog";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { t } = useLanguage();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  useEffect(() => {
    // Show particles after a delay for better performance
    const timer = setTimeout(() => setShowParticles(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Decorative background elements */}
      {showParticles && (
        <>
          <div 
            className="fixed -top-40 right-20 w-72 h-72 bg-ethiopia-green/20 rounded-full blur-3xl opacity-70 animate-pulse"
            style={{animationDuration: '15s'}}
            aria-hidden="true"
          />
          <div 
            className="fixed top-60 -left-20 w-80 h-80 bg-ethiopia-yellow/20 rounded-full blur-3xl opacity-70 animate-pulse"
            style={{animationDuration: '20s'}}
            aria-hidden="true"
          />
          <div 
            className="fixed -bottom-40 right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70 animate-pulse"
            style={{animationDuration: '25s'}}
            aria-hidden="true"
          />
        </>
      )}
      
      <main className="flex-grow flex flex-col">
        <Hero />
        
        {/* Testimonial section */}
        <section className="py-16 overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="relative">
              {/* Decorative background element */}
              <div 
                className="absolute -top-10 -right-10 w-64 h-64 bg-ethiopia-green/10 rounded-full blur-3xl"
                aria-hidden="true"
              />
              
              <Card className="border-none shadow-lg bg-gradient-to-br from-white to-secondary/30 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/3 flex justify-center">
                      <div className="relative w-48 h-48 md:w-64 md:h-64">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ethiopia-green via-ethiopia-yellow to-ethiopia-red opacity-20 animate-pulse" />
                        <img 
                          src="/placeholder.svg" 
                          alt="Student" 
                          className="absolute inset-2 object-cover rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 relative">
                      <svg 
                        className="absolute top-0 left-0 w-12 h-12 text-ethiopia-green/20 transform -translate-x-6 -translate-y-6" 
                        fill="currentColor" 
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                      </svg>
                      
                      <p className="text-lg md:text-2xl font-medium text-foreground mb-4 italic">
                        {t("home.testimonial.quote")}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <p className="text-sm md:text-base font-semibold">
                          {t("home.testimonial.name")} 
                          <span className="text-muted-foreground font-normal ml-2">
                            {t("home.testimonial.school")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <SubjectGrid />
        
        {/* Features Section - with improved design */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Decorative background elements */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-white via-secondary/30 to-white"
            aria-hidden="true"
          />
          <div 
            className="absolute top-1/4 left-0 w-full h-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ethiopia-green/5 via-transparent to-transparent"
            aria-hidden="true"
          />
          
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center text-center mb-12 md:mb-16">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-ethiopia-green to-primary">
                {t("home.features.title")}
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                {t("home.features.subtitle")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title={t("feature.ai.title")}
                description={t("feature.ai.description")}
                icon={BrainCircuit}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              />
              <FeatureCard
                title={t("feature.analytics.title")}
                description={t("feature.analytics.description")}
                icon={LayoutDashboard}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              />
              <FeatureCard
                title={t("feature.offline.title")}
                description={t("feature.offline.description")}
                icon={Network}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              />
              <FeatureCard
                title={t("feature.questions.title")}
                description={t("feature.questions.description")}
                icon={BookOpen}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              />
              <FeatureCard
                title={t("feature.time.title")}
                description={t("feature.time.description")}
                icon={Clock}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              />
              <FeatureCard
                title={t("feature.language.title")}
                description={t("feature.language.description")}
                icon={Sparkles}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
              />
            </div>
          </div>
        </section>

        {/* CTA Section - with improved visuals */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Background gradient and pattern */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-ethiopia-green via-ethiopia-green to-primary"
                aria-hidden="true"
              />
              
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10" 
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                  backgroundSize: '24px 24px'
                }}
                aria-hidden="true"
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center p-8 md:p-12 lg:p-16">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/10 backdrop-blur-sm mb-6">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                
                <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl mb-4">
                  {t("home.cta.title")}
                </h2>
                <p className="mx-auto max-w-[800px] text-white/90 md:text-lg mb-8 lg:mb-12">
                  {t("home.cta.subtitle")}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white text-ethiopia-green hover:bg-white/90 shadow-lg transition-all duration-300"
                  >
                    <Link to="/subjects">{t("home.cta.browse")}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-white border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                  >
                    <Link to="/exam">{t("home.cta.take")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <AIAssistantButton onClick={() => setAiDialogOpen(true)} />
      <AIAssistantDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
      
      <Footer />
    </div>
  );
};

export default Index;
