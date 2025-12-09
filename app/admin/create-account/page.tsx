"use client";

import { useState } from "react";
import { createEmployee } from "../../../lib/authService";
import type { EmployeeRole } from "../../../lib/authService";

export default function CreateAccountPage() {
  const [employeeCode, setEmployeeCode] = useState("admin");
  const [password, setPassword] = useState("1102");
  const [name, setName] = useState("Administrator");
  const [role, setRole] = useState<EmployeeRole>("admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const employeeId = await createEmployee(
        employeeCode.trim(),
        password,
        name.trim(),
        role
      );
      setMessage({
        type: "success",
        text: `Tài khoản đã được tạo thành công! ID: ${employeeId}`
      });
      // Reset form
      setEmployeeCode("");
      setPassword("");
      setName("");
      setRole("employee");
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tạo tài khoản. Vui lòng thử lại."
      });
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const employeeId = await createEmployee(
        "admin",
        "1102",
        "Administrator",
        "admin"
      );
      setMessage({
        type: "success",
        text: `Tài khoản admin đã được tạo thành công! ID: ${employeeId}`
      });
    } catch (error: unknown) {
      let errorMessage =
        "Không thể tạo tài khoản admin. Có thể tài khoản đã tồn tại.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Tạo Tài Khoản Nhân Viên
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo tài khoản mới cho nhân viên hoặc quản trị viên
          </p>
        </div>

        {/* Quick create admin button */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h2 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-300">
            Tạo Tài Khoản Admin Mặc Định
          </h2>
          <p className="mb-3 text-xs text-blue-700 dark:text-blue-400">
            Mã nhân viên: <strong>admin</strong> | Mật khẩu:{" "}
            <strong>1102</strong> | Phân quyền: <strong>admin</strong>
          </p>
          <button
            onClick={createAdminAccount}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
          >
            {loading ? "Đang tạo..." : "Tạo Tài Khoản Admin"}
          </button>
        </div>

        {/* Create custom account form */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Tạo Tài Khoản Tùy Chỉnh
          </h2>

          {message && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mã Nhân Viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="Nhập mã nhân viên"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mật Khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tên Nhân Viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhân viên"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phân Quyền <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="employee">Nhân viên</option>
                <option value="sale">Bán hàng</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
            >
              {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
