import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) return null;

  // Redirect to login, but store the current location in state (optional)
  return user ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}
