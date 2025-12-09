// Script to create admin account
// Run this once to create the admin account
import { createEmployee } from "./authService";

/**
 * Creates the default admin account
 * - Employee Code: admin
 * - Password: 1102
 * - Role: admin
 * - Name: Administrator
 */
export const createAdminAccount = async (): Promise<string> => {
  try {
    const employeeId = await createEmployee(
      "admin", // mã nhân viên
      "1102", // mật khẩu
      "Administrator", // tên
      "admin" // role
    );
    console.log("Admin account created successfully with ID:", employeeId);
    return employeeId;
  } catch (error) {
    console.error("Error creating admin account:", error);
    throw error;
  }
};

// Usage:
// You can call this function from browser console after importing:
// import { createAdminAccount } from "./lib/createAdminAccount";
// createAdminAccount();


