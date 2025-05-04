
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck, Shield, Settings } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users with their roles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Get user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("*");
          
        if (rolesError) throw rolesError;

        // Map users and roles
        setUsers(userRoles || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      // First check if the user already has the admin role
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      
      if (existingRole) {
        toast.info("User is already an admin");
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      
      if (error) throw error;
      
      toast.success("User promoted to admin");
      
      // Refresh user list
      const { data: updatedRoles } = await supabase
        .from("user_roles")
        .select("*");
        
      setUsers(updatedRoles || []);
    } catch (error: any) {
      console.error("Error promoting user:", error);
      toast.error(error.message || "Failed to promote user");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 px-4">
        <div className="container mx-auto py-8">
          <div className="flex items-center mb-8">
            <Shield className="h-8 w-8 mr-4 text-red-500" />
            <h1 className="text-3xl font-bold">
              {t("admin.title") || "Admin Dashboard"}
            </h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  {t("admin.users") || "Users"}
                </CardTitle>
                <CardDescription>
                  {t("admin.users_description") || "Manage user accounts and roles"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userRole) => (
                        <TableRow key={userRole.id}>
                          <TableCell className="font-mono text-xs truncate max-w-[120px]">
                            {userRole.user_id}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${userRole.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {userRole.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {userRole.role !== 'admin' && userRole.user_id !== user?.id && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePromoteToAdmin(userRole.user_id)}
                              >
                                Make Admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  {t("admin.settings") || "System Settings"}
                </CardTitle>
                <CardDescription>
                  {t("admin.settings_description") || "Configure application settings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  System configuration options will be available here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
