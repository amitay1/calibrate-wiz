import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UIToaster } from "@/components/ui/toaster-wrapper";
import { SonnerToaster } from "@/components/ui/sonner-toaster";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Standards from "./pages/Standards";
import MyStandards from "./pages/MyStandards";
import AdminTenants from "./pages/AdminTenants";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/standards" element={<Standards />} />
          <Route path="/my-standards" element={<MyStandards />} />
          <Route path="/admin/tenants" element={<AdminTenants />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
    <UIToaster />
    <SonnerToaster />
  </QueryClientProvider>
);

export default App;
