import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "@/pages/user/Landing";
import UserLogin from "@/pages/user/UserLogin";
import UserRegister from "@/pages/user/UserRegister";
import BookService from "@/pages/user/BookService";
import MyBookings from "@/pages/user/MyBookings";
import TrackHelper from "@/pages/user/TrackHelper";

import ProviderLogin from "@/pages/provider/ProviderLogin";
import ProviderRegister from "@/pages/provider/ProviderRegister";
import ProviderDashboard from "@/pages/provider/ProviderDashboard";
import ProviderEarnings from "@/pages/provider/ProviderEarnings";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageProviders from "@/pages/admin/ManageProviders";
import ManageBookings from "@/pages/admin/ManageBookings";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* User portal */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/book" element={<BookService />} />
            <Route path="/my-bookings" element={<ProtectedRoute role="user" redirectTo="/login"><MyBookings /></ProtectedRoute>} />
            <Route path="/track" element={<ProtectedRoute role="user" redirectTo="/login"><TrackHelper /></ProtectedRoute>} />

            {/* Provider portal */}
            <Route path="/provider/login" element={<ProviderLogin />} />
            <Route path="/provider/register" element={<ProviderRegister />} />
            <Route path="/provider/dashboard" element={<ProtectedRoute role="provider" redirectTo="/provider/login"><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/earnings" element={<ProtectedRoute role="provider" redirectTo="/provider/login"><ProviderEarnings /></ProtectedRoute>} />

            {/* Admin portal */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/providers" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><ManageProviders /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><ManageBookings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
