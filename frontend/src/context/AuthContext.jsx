  // src/context/AuthContext.jsx
  import { createContext, useContext, useEffect, useState } from "react";
  import api from "../api/axios"; // adjust path to match your project

  const AuthContext = createContext(null);

  export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined); // undefined = still checking

    useEffect(() => {
      api.get("/users/me")
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }, []);

    return (
      <AuthContext.Provider value={{ user, setUser }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export const useAuth = () => useContext(AuthContext);