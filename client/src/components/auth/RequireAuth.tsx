import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./AuthProvider";
import PreLoader from "../../pages/components/PreLoader";

/**
 * Route-level guard. Redirects anonymous visitors to the login page and keeps
 * the requested destination so they can be returned there after signing in.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PreLoader />;
  if (!user) {
    return <Navigate to="/session/new" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
