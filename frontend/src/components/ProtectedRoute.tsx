import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/mockDb";

interface Props {
  role: Role;
  redirectTo: string;
  children: ReactNode;
}

export function ProtectedRoute({ role, redirectTo, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user || user.role !== role) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
