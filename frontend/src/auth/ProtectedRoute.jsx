import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute ({ children }) {
  const { user } = useAuth();
  console.log("AUTH USER:", user);
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// export default ProtectedRoute;