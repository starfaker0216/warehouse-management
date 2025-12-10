import { create } from "zustand";
import {
  Employee,
  login as loginService,
  getAuthFromStorage,
  saveAuthToStorage,
  removeAuthFromStorage
} from "../lib/authService";

interface AuthState {
  employee: Employee | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (employeeCode: string, password: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  employee: null,
  loading: true,
  isAuthenticated: false,

  initialize: () => {
    const savedAuth = getAuthFromStorage();
    set({
      employee: savedAuth,
      loading: false,
      isAuthenticated: !!savedAuth
    });
  },

  login: async (employeeCode: string, password: string) => {
    set({ loading: true });
    try {
      const employeeData = await loginService(employeeCode, password);
      if (employeeData) {
        saveAuthToStorage(employeeData);
        set({
          employee: employeeData,
          loading: false,
          isAuthenticated: true
        });
        return true;
      }
      set({ loading: false });
      return false;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    removeAuthFromStorage();
    set({
      employee: null,
      isAuthenticated: false
    });
  }
}));
