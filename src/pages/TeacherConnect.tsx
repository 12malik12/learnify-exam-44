
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { TeachersList } from "@/components/Teachers/TeachersList";
import { TeacherForm } from "@/components/Teachers/TeacherForm";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, UserPlus } from "lucide-react";

const TeacherConnect = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("view");
  
  const handleRefresh = () => {
    // Force a re-render of the TeachersList component when a new teacher is added
    setActiveTab("view");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              {t("teacherConnect.title") || "Teacher Connect"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("teacherConnect.description") || "Connect with subject teachers for expert guidance"}
            </p>
          </div>
          
          {isAdmin() ? (
            <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="view">View Teachers</TabsTrigger>
                  <TabsTrigger value="add">Add Teacher</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="view">
                <TeachersList />
              </TabsContent>
              
              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Add New Teacher
                    </CardTitle>
                    <CardDescription>
                      Add a teacher's details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeacherForm onSuccess={handleRefresh} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <TeachersList />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherConnect;
