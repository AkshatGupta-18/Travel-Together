// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    // On app load, verify with backend if cookie is still valid
    fetch("http://localhost:5000/api/users/me", {
      credentials: "include", // sends the httpOnly cookie
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))   // null if not authed
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);