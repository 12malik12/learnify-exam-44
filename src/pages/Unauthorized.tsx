
import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const Unauthorized = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {t("auth.unauthorized_title") || "Unauthorized Access"}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {t("auth.unauthorized_message") || "You don't have permission to access this page. Please contact an administrator if you believe this is an error."}
        </p>
        
        <Button asChild variant="default">
          <Link to="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back_to_home") || "Back to Home"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
