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
import BottomNav from "@/components/navigation/BottomNav";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import SearchResults from "./pages/SearchResults";
import Messages from "./pages/Messages";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Profile from "./pages/Profile";
import CGU from "./pages/CGU";
import Confidentialite from "./pages/Confidentialite";
import ResetPassword from "./pages/ResetPassword";
import SellerProfile from "./pages/SellerProfile";

// Admin Imports
import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

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
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/vendeur/:userId" element={<SellerProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="moderation" element={<AdminModeration />} />
                <Route path="kyc" element={<AdminKYC />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
