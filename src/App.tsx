import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import RegisterModal from "@/components/auth/RegisterModal";
import LoginModal from "@/components/auth/LoginModal";
import KYCVerificationModal from "@/components/auth/KYCVerificationModal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import SearchResults from "./pages/SearchResults";
import Messages from "./pages/Messages";

// Admin Imports
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => {
    initialize();
  }, [initialize]);
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <RegisterModal />
          <LoginModal />
          <KYCVerificationModal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/annonce/:id" element={<ListingDetail />} />
            <Route path="/deposer" element={<CreateListing />} />
            <Route path="/annonces" element={<SearchResults />} />
            <Route path="/messages" element={<Messages />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="moderation" element={<AdminModeration />} />
                <Route path="kyc" element={<AdminKYC />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="categories" element={<AdminDashboard />} /> {/* Placeholder if no dedicated file yet */}
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
