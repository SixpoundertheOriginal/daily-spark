
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import AuthForm from "./components/Auth/AuthForm";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-nexus-bg-primary via-nexus-bg-secondary to-[#1a1335]">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-nexus-accent-purple"></div>
      </div>
    );
  }
  
  if (!session) {
    return <AuthForm />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [supabaseInitialized, setSupabaseInitialized] = useState<boolean>(false);
  const [supabaseError, setSupabaseError] = useState<boolean>(false);

  useEffect(() => {
    // Check if Supabase is properly initialized
    const checkSupabase = async () => {
      try {
        // Simple health check - just try to get session
        await supabase.auth.getSession();
        setSupabaseInitialized(true);
      } catch (error) {
        console.error("Supabase initialization error:", error);
        setSupabaseError(true);
      }
    };
    
    checkSupabase();
  }, []);

  // If there's a Supabase error, show a user-friendly screen
  if (supabaseError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-nexus-bg-primary via-nexus-bg-secondary to-[#1a1335] p-4 text-center">
        <div className="glass-card max-w-md p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-light text-gradient">Connection Error</h2>
          <p className="mb-6 text-nexus-text-secondary">
            Unable to connect to the database. Please check your connection or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="primary-gradient w-full rounded-xl px-4 py-2 text-white"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show loading until we confirm Supabase is ready
  if (!supabaseInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-nexus-bg-primary via-nexus-bg-secondary to-[#1a1335]">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-nexus-accent-purple"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
