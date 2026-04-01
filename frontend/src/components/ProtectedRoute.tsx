import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const isTokenExpired = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  if (!token || isTokenExpired(token)) {
    if (token) localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
