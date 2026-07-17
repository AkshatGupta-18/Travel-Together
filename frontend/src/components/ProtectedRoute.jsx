// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Still fetching auth status — show nothing (or a spinner)
  if (user === undefined) return <div>Loading...</div>;

  // Not logged in — kick to login page
  if (user === null) return <Navigate to="/login" replace />;

  // Logged in — render the page
  return children;
}