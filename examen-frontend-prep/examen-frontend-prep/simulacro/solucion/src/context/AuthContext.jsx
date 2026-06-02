import { createContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const value = {
    token,
    isAuthenticated: Boolean(token),
    login: (newToken) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    },
    logout: () => {
      localStorage.removeItem("token");
      setToken(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
