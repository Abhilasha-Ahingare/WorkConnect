import { Navigate } from "react-router-dom";
import { UserAuth } from "../contexts/AuthContext";


const ProtectRoutes = ({ children, role }) => {
  const { user, isLoading, isLogIn } = UserAuth();

  // ✅ Important: Wait until loading finishes
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-xl font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  // ✅ Redirect if not logged in
  if (!isLogIn || !user) {
    return <Navigate to="/login" />;
  }

  // ✅ Check role match (if any)
  if (role && !role.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectRoutes;
