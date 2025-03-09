
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import LanguageSwitcher from "@/components/Layout/LanguageSwitcher";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass shadow-sm border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/placeholder.svg" alt="Logo" className="w-8 h-8" />
            <span className="font-bold hidden md:inline-block">EduPrep</span>
          </Link>
          
          <nav className="hidden md:flex items-center ml-6 space-x-4">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-foreground/60'}`}
            >
              {t("nav.home")}
            </Link>
            <Link 
              to="/subjects" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.includes('/subjects') ? 'text-primary' : 'text-foreground/60'}`}
            >
              {t("nav.subjects")}
            </Link>
            <Link 
              to="/exam" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.includes('/exam') ? 'text-primary' : 'text-foreground/60'}`}
            >
              {t("nav.exam")}
            </Link>
            <Link 
              to="/ai-assistant" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.includes('/ai-assistant') ? 'text-primary' : 'text-foreground/60'}`}
            >
              {t("nav.ai")}
            </Link>
            <Link 
              to="/profile" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.includes('/profile') ? 'text-primary' : 'text-foreground/60'}`}
            >
              {t("nav.profile")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="rounded-full md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent"
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/subjects"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent"
                >
                  {t("nav.subjects")}
                </Link>
                <Link
                  to="/exam"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent"
                >
                  {t("nav.exam")}
                </Link>
                <Link
                  to="/ai-assistant"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent"
                >
                  {t("nav.ai")}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent"
                >
                  {t("nav.profile")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
