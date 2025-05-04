
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Book, User, Home, Notebook, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { signOut, user, userRole, isAdmin } = useAuth();

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

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t("auth.signout_success"));
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("auth.signout_error"));
    }
  };

  // Simplified navigation items
  const navItems = [
    { name: t("nav.home"), path: "/", icon: <Home className="size-4" /> },
    { name: t("nav.subjects"), path: "/subjects", icon: <Book className="size-4" /> },
    { name: t("nav.exams"), path: "/exam", icon: <Notebook className="size-4" /> },
    { name: t("nav.profile"), path: "/profile", icon: <User className="size-4" /> },
  ];

  // Admin-specific navigation items
  const adminNavItems = isAdmin() ? [
    { 
      name: t("nav.admin") || "Admin", 
      path: "/admin", 
      icon: <Shield className="size-4" /> 
    }
  ] : [];

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
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red bg-clip-text text-transparent font-bold">{t("app.name")}</span>
          <span className="inline sm:hidden bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red bg-clip-text text-transparent font-bold">{t("app.name.short")}</span>
          
          {userRole && (
            <Badge variant={isAdmin() ? "destructive" : "secondary"} className="ml-2">
              {userRole}
            </Badge>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors",
                location.pathname === item.path
                  ? "bg-ethiopia-green text-white"
                  : "text-foreground/80 hover:bg-ethiopia-green/10 hover:text-ethiopia-green"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors",
                location.pathname === item.path
                  ? "bg-red-500 text-white"
                  : "text-red-500 hover:bg-red-500/10"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="size-4" />
              {t("auth.signout")}
            </Button>
          )}
          
          <LanguageSwitcher />
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-x-0 top-0 z-50 min-h-screen w-full bg-white p-8 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={closeMenu}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red flex items-center justify-center text-white font-bold">
                    E
                  </div>
                  <span className="bg-gradient-to-r from-ethiopia-green via-ethiopia-yellow to-ethiopia-red bg-clip-text text-transparent">{t("app.name")}</span>
                  
                  {userRole && (
                    <Badge variant={isAdmin() ? "destructive" : "secondary"} className="ml-2">
                      {userRole}
                    </Badge>
                  )}
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
                        ? "bg-ethiopia-green text-white"
                        : "hover:bg-ethiopia-green/10 hover:text-ethiopia-green"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                
                {adminNavItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={cn(
                      `flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors animate-fade-up-${index + navItems.length + 1}`,
                      location.pathname === item.path
                        ? "bg-red-500 text-white"
                        : "text-red-500 hover:bg-red-500/10"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                
                {user && (
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center gap-3 mt-2 text-red-500 hover:bg-red-500/10 justify-start font-medium px-4 py-3 rounded-lg"
                  >
                    <LogOut className="size-4" />
                    {t("auth.signout")}
                  </Button>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
