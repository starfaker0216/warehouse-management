"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  Employee,
  login as loginService,
  getAuthFromStorage,
  saveAuthToStorage,
  removeAuthFromStorage
} from "../lib/authService";

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  login: (employeeCode: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(() => {
    // Initialize from localStorage
    if (typeof window !== "undefined") {
      return getAuthFromStorage();
    }
    return null;
  });
  const [loading] = useState(false);

  const login = async (
    employeeCode: string,
    password: string
  ): Promise<boolean> => {
    try {
      const employeeData = await loginService(employeeCode, password);
      if (employeeData) {
        setEmployee(employeeData);
        saveAuthToStorage(employeeData);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setEmployee(null);
    removeAuthFromStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        loading,
        login,
        logout,
        isAuthenticated: !!employee
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
