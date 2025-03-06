
import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import Hero from "@/components/Home/Hero";
import SubjectGrid from "@/components/Home/SubjectGrid";
import FeatureCard from "@/components/Home/FeatureCard";
import { BrainCircuit, Sparkles, LayoutDashboard, BookOpen, Network, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
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
                {t("home.features.title")}
              </h2>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-lg">
                {t("home.features.subtitle")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title={t("feature.ai.title")}
                description={t("feature.ai.description")}
                icon={BrainCircuit}
              />
              <FeatureCard
                title={t("feature.analytics.title")}
                description={t("feature.analytics.description")}
                icon={LayoutDashboard}
              />
              <FeatureCard
                title={t("feature.offline.title")}
                description={t("feature.offline.description")}
                icon={Network}
              />
              <FeatureCard
                title={t("feature.questions.title")}
                description={t("feature.questions.description")}
                icon={BookOpen}
              />
              <FeatureCard
                title={t("feature.time.title")}
                description={t("feature.time.description")}
                icon={Clock}
              />
              <FeatureCard
                title={t("feature.language.title")}
                description={t("feature.language.description")}
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
                  {t("home.cta.title")}
                </h2>
                <p className="mx-auto mt-4 max-w-[800px] text-primary-foreground/80 md:text-lg">
                  {t("home.cta.subtitle")}
                </p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Link to="/subjects">{t("home.cta.browse")}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ethiopia"
                    className="border border-white/20"
                  >
                    <Link to="/exam">{t("home.cta.take")}</Link>
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
