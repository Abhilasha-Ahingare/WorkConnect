import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!token;

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // Verify token on app start
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     if (!token) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     try {
  //       // Verify token and get user data
  //       const response = await api.get("/users/profile");
  //       if (response.data?.user) {
  //         setUser(response.data.user);
  //       } else {
  //         throw new Error("User data not found");
  //       }
  //     } catch (error) {
  //       console.error("Token verification failed:", error);
  //       // Clear invalid token and user data
  //       logout();
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   verifyToken();
  // }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isLoading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
