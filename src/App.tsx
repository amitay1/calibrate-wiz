import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Standards from "./pages/Standards";
import MyStandards from "./pages/MyStandards";
import AdminTenants from "./pages/AdminTenants";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/standards" element={<ProtectedRoute><Standards /></ProtectedRoute>} />
        <Route path="/my-standards" element={<ProtectedRoute><MyStandards /></ProtectedRoute>} />
        <Route path="/admin/tenants" element={<ProtectedRoute><AdminTenants /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [mountRouter, setMountRouter] = useState(false);

  useEffect(() => {
    // Mount router after a small delay to ensure splash screen is rendered first
    const timer = setTimeout(() => setMountRouter(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {mountRouter && (
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        )}
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
