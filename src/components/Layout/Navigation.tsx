
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Home, 
  PencilRuler, 
  User, 
  BarChart3, 
  Bot, 
  Shield,
  School
} from "lucide-react";

const Navigation = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Custom navigation item component
  const NavItem = ({ 
    to, 
    icon, 
    children 
  }: { 
    to: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
  }) => {
    const isActive = location.pathname === to || 
      (to !== '/' && location.pathname.startsWith(to));
    
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          className={cn(
            navigationMenuTriggerStyle(),
            "flex gap-2 items-center",
            isActive && "bg-accent text-accent-foreground"
          )}
          onClick={() => navigate(to)}
        >
          {icon}
          <span>{children}</span>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };
  
  return (
    <NavigationMenu className="max-w-none justify-start">
      <NavigationMenuList className="flex-wrap space-x-0 space-y-0 md:space-x-2 md:space-y-0">
        <NavItem to="/" icon={<Home className="h-4 w-4" />}>
          {t("navigation.home")}
        </NavItem>
        
        <NavItem to="/subjects" icon={<BookOpen className="h-4 w-4" />}>
          {t("navigation.subjects")}
        </NavItem>
        
        <NavItem to="/exam" icon={<PencilRuler className="h-4 w-4" />}>
          {t("navigation.exam")}
        </NavItem>
        
        <NavItem to="/teacher-connect" icon={<School className="h-4 w-4" />}>
          {t("navigation.teacherConnect") || "Teacher Connect"}
        </NavItem>
        
        <NavItem to="/profile" icon={<User className="h-4 w-4" />}>
          {t("navigation.profile")}
        </NavItem>
        
        <NavItem to="/performance" icon={<BarChart3 className="h-4 w-4" />}>
          {t("navigation.performance")}
        </NavItem>
        
        <NavItem to="/ai-assistant" icon={<Bot className="h-4 w-4" />}>
          {t("navigation.aiAssistant")}
        </NavItem>
        
        {isAdmin && isAdmin() && (
          <NavItem to="/admin" icon={<Shield className="h-4 w-4 text-red-500" />}>
            {t("navigation.admin")}
          </NavItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
