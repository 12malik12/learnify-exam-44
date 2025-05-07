
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "../LanguageSwitcher";
import Navigation from "./Navigation";
import { Sidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-background/90 backdrop-blur-md z-50 border-b">
      <div className="container flex flex-col py-3">
        {/* Top bar with logo and user controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger className="mr-4 md:hidden">
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 pt-6">
                <Sidebar className="h-full" />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-xl">{t("app.name")}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ModeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full h-9 w-9">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>{t("navigation.profile")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>{t("auth.signOut")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button onClick={() => navigate('/auth')} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">{t("auth.signIn")}</button>
            )}
          </div>
        </div>
        
        {/* Navigation menu - hidden on mobile */}
        <div className="hidden md:block">
          <Navigation />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
