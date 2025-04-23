import React from "react";
import { Link } from "react-router-dom";
import { Award, Github, Instagram, Twitter } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
const Footer = () => {
  const {
    t
  } = useLanguage();
  const currentYear = new Date().getFullYear();
  return <footer className="w-full bg-secondary py-8 md:py-12">
      <div className="container grid gap-8 px-4 md:px-6 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Award className="size-5 text-ethiopia-green" />
            <span className="font-semibold">{t("app.name")}</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            {t("footer.description")}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:gap-6 lg:col-span-2">
          
          
          
        </div>
      </div>
      
      <div className="container mt-8 border-t border-border pt-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {currentYear} {t("app.name")}. {t("footer.copyright")}
          </p>
          <div className="flex items-center space-x-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground" aria-label="Twitter">
              <Twitter className="size-4" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground" aria-label="Instagram">
              <Instagram className="size-4" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground" aria-label="GitHub">
              <Github className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;