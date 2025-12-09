import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

export type EmployeeRole = "admin" | "manager" | "sale" | "employee";

export interface Employee {
  id: string;
  employeeCode: string; // mã nhân viên
  password: string; // mật khẩu (nên hash trong production)
  name: string;
  role?: EmployeeRole;
  createdAt?: Date;
}

// Simple hash function (for demo - in production use bcrypt or similar)
const hashPassword = (password: string): string => {
  // Simple hash - in production, use proper hashing like bcrypt
  return btoa(password);
};

// Login with employee code and password
// Simple verification from Firestore - no tokens needed
export const login = async (
  employeeCode: string,
  password: string
): Promise<Employee | null> => {
  try {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("employeeCode", "==", employeeCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const employeeDoc = querySnapshot.docs[0];
    const employeeData = employeeDoc.data();

    // Compare password (hashed)
    const hashedPassword = hashPassword(password);
    if (employeeData.password !== hashedPassword) {
      return null;
    }

    return {
      id: employeeDoc.id,
      employeeCode: employeeData.employeeCode,
      password: "", // Don't return password
      name: employeeData.name || "",
      role: employeeData.role || "employee",
      createdAt: employeeData.createdAt?.toDate()
    };
  } catch (error) {
    throw error;
  }
};

// Get employee by ID
export const getEmployee = async (id: string): Promise<Employee | null> => {
  try {
    const employeeRef = doc(db, "employees", id);
    const employeeSnap = await getDoc(employeeRef);

    if (!employeeSnap.exists()) {
      return null;
    }

    const data = employeeSnap.data();
    return {
      id: employeeSnap.id,
      employeeCode: data.employeeCode,
      password: "", // Don't return password
      name: data.name || "",
      role: data.role || "employee",
      createdAt: data.createdAt?.toDate()
    };
  } catch (error) {
    throw error;
  }
};

// Check if employee code already exists
export const checkEmployeeExists = async (
  employeeCode: string
): Promise<boolean> => {
  try {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("employeeCode", "==", employeeCode));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    throw error;
  }
};

// Create a new employee (for admin use)
export const createEmployee = async (
  employeeCode: string,
  password: string,
  name: string,
  role: string = "employee"
): Promise<string> => {
  try {
    // Validate inputs
    if (!employeeCode || !password || !name) {
      throw new Error("Mã nhân viên, mật khẩu và tên là bắt buộc");
    }

    // Check if employee code already exists
    const exists = await checkEmployeeExists(employeeCode);
    if (exists) {
      throw new Error(`Mã nhân viên "${employeeCode}" đã tồn tại`);
    }

    const employeesRef = collection(db, "employees");
    const hashedPassword = hashPassword(password);
    const newEmployee = {
      employeeCode: employeeCode.trim(),
      password: hashedPassword,
      name: name.trim(),
      role: role || "employee",
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(employeesRef, newEmployee);
    return docRef.id;
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      // Check for specific Firebase errors
      if (
        error.message.includes("does not exist") ||
        error.message.includes("database")
      ) {
        throw new Error(
          "Firestore database chưa được tạo. Vui lòng tạo database trong Firebase Console:\n" +
            "1. Vào Firebase Console (https://console.firebase.google.com/)\n" +
            "2. Chọn project warehouse-management-837db\n" +
            "3. Vào Firestore Database\n" +
            "4. Click 'Create database'\n" +
            "5. Chọn chế độ (Test mode hoặc Production mode)\n" +
            "6. Chọn location và click 'Enable'"
        );
      }
      if (
        error.message.includes("permission") ||
        error.message.includes("PERMISSION_DENIED")
      ) {
        throw new Error(
          "Không có quyền truy cập. Vui lòng kiểm tra Firestore Security Rules trong Firebase Console."
        );
      }
      throw error;
    }
    throw new Error(
      "Không thể tạo tài khoản. Vui lòng kiểm tra kết nối Firebase."
    );
  }
};

// Store auth in localStorage
export const saveAuthToStorage = (employee: Employee): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth", JSON.stringify(employee));
  }
};

// Get auth from localStorage
export const getAuthFromStorage = (): Employee | null => {
  if (typeof window !== "undefined") {
    const authData = localStorage.getItem("auth");
    if (authData) {
      return JSON.parse(authData);
    }
  }
  return null;
};

// Remove auth from localStorage
export const removeAuthFromStorage = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth");
  }
};
