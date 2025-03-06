
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Book, User, Home, Notebook, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="size-4" /> },
    { name: "Subjects", path: "/subjects", icon: <Book className="size-4" /> },
    { name: "Exams", path: "/exam", icon: <Notebook className="size-4" /> },
    { name: "Profile", path: "/profile", icon: <User className="size-4" /> },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-bold text-xl" 
          onClick={closeMenu}
        >
          <Award className="size-6 text-ethiopia-green" />
          <span className="hidden sm:inline">Learnify Ethiopia</span>
          <span className="inline sm:hidden">Learnify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:text-primary hover:bg-primary/5"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-x-0 top-0 z-50 min-h-screen w-full bg-white p-8 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={closeMenu}>
                  <Award className="size-6 text-ethiopia-green" />
                  <span>Learnify Ethiopia</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <nav className="mt-8 flex flex-col gap-3">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={cn(
                      `flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors animate-fade-up-${index + 1}`,
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
