"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { Employee } from "../lib/authService";
import { useAuthStore } from "../stores/useAuthStore";

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  login: (employeeCode: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { employee, loading, isAuthenticated, login, logout, initialize } =
    useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AuthContext.Provider
      value={{
        employee,
        loading,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
