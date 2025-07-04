import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as ShadcnThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * APP COMPONENT WITH PROVIDER HIERARCHY
 *
 * The provider hierarchy is carefully ordered to ensure proper functionality:
 *
 * 1. QueryClientProvider - For data fetching and caching
 * 2. ShadcnThemeProvider - For basic theme switching (legacy)
 * 3. ThemeProvider - For advanced theme management with real-time updates
 * 4. AuthProvider - For user authentication and profile management
 * 5. TooltipProvider - For UI tooltips
 *
 * This structure allows:
 * - Real-time theme updates from settings page
 * - Avatar updates reflected immediately in header
 * - Consistent state management across the application
 * - Proper data fetching with authentication context
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ShadcnThemeProvider defaultTheme="system" storageKey="aiml-info-theme">
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ShadcnThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
