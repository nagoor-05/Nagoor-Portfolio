import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("portfolio-admin-token")) {
      setLoading(false);
      return;
    }
    authApi.me().then(setUser).catch(() => localStorage.removeItem("portfolio-admin-token")).finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const result = await authApi.login(credentials);
    localStorage.setItem("portfolio-admin-token", result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem("portfolio-admin-token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
