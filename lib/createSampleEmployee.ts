// Helper script to create sample employee
// Run this in browser console or create a separate admin page
import { createEmployee } from "./authService";

// Example: Create a sample employee
// Uncomment and run this function to create a test employee
export const createSampleEmployee = async () => {
  try {
    const employeeId = await createEmployee(
      "NV001", // mã nhân viên
      "123456", // mật khẩu
      "Nguyễn Văn A", // tên
      "admin" // role
    );
    console.log("Employee created with ID:", employeeId);
    return employeeId;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

// Usage:
// import { createSampleEmployee } from "./lib/createSampleEmployee";
// createSampleEmployee();
