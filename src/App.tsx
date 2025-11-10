import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrandThemeProvider } from "@/contexts/BrandThemeContext";
import { useBrandSettings, brandSettingsToTheme } from "@/hooks/useBrandSettings";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import StoryBuilder from "./pages/StoryBuilder";
import StoryViewer from "./pages/StoryViewer";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { data: brandSettings } = useBrandSettings();
  const theme = brandSettings ? brandSettingsToTheme(brandSettings) : null;

  return (
    <BrandThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/story/:id/edit" element={<StoryBuilder />} />
        <Route path="/story/:id" element={<StoryViewer />} />
        <Route path="/story/preview" element={<StoryViewer />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrandThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
