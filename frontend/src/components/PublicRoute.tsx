import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
