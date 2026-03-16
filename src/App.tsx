import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Retry wrapper for lazy imports: if a JS chunk fails to download (flaky
// network, CDN hiccup), retry once before propagating the error. This is the
// most common cause of "first load fails, reload works" in Vite SPAs.
function lazyWithRetry<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(() =>
    importFn().catch((err) => {
      console.warn("[chunk-load] Failed on first attempt, retrying…", err);
      return importFn();
    })
  );
}

// Lazy load pages for code splitting - reduces initial bundle size
const Index = lazyWithRetry(() => import("./pages/Index"));
const BookPage = lazyWithRetry(() => import("./pages/BookPage"));
const GalleryPage = lazyWithRetry(() => import("./pages/GalleryPage"));
const ContactPage = lazyWithRetry(() => import("./pages/ContactPage"));
const AuthPage = lazyWithRetry(() => import("./pages/AuthPage"));
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const PrivacyPolicyPage = lazyWithRetry(() => import("./pages/PrivacyPolicyPage"));
const TermsAndConditionsPage = lazyWithRetry(() => import("./pages/TermsAndConditionsPage"));
const CancellationPolicyPage = lazyWithRetry(() => import("./pages/CancellationPolicyPage"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

// Minimal loading fallback for better perceived performance
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-forest border-t-transparent animate-spin" />
      <span className="text-muted-foreground text-sm">Cargando...</span>
    </div>
  </div>
);

const App = () => {
  // Create QueryClient inside the component so that if the ErrorBoundary resets
  // (re-mounts App), any cached query state from the failed render is cleared.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/book" element={<BookPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsAndConditionsPage />} />
                <Route path="/cancellation" element={<CancellationPolicyPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
