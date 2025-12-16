"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useIncomeExpenseFormStore } from "../../stores/useIncomeExpenseFormStore";
import TypeSelectorField from "../../components/income-expense/TypeSelectorField";
import CategoryInputField from "../../components/income-expense/CategoryInputField";
import AmountInputField from "../../components/income-expense/AmountInputField";
import { Toaster } from "react-hot-toast";

export default function IncomeExpensePage() {
  const router = useRouter();
  const {
    isAuthenticated,
    loading: authLoading,
    initialize,
    employee
  } = useAuthStore();
  const {
    formData,
    setFormData,
    priceInputValue,
    setPriceInputValue,
    loading,
    error,
    handleSubmit
  } = useIncomeExpenseFormStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Check permissions - only admin and manager can access
  const hasPermission =
    isAuthenticated &&
    employee &&
    (employee.role === "admin" || employee.role === "manager");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasPermission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Không có quyền truy cập
          </h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Bạn cần quyền admin hoặc quản lý để truy cập trang này.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Thu / Chi
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Thêm bản ghi thu hoặc chi vào hệ thống
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
              {/* Type Selector */}
              <TypeSelectorField
                type={formData.type}
                onTypeChange={(type) => setFormData({ ...formData, type })}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category Input */}
              <CategoryInputField
                category={formData.category}
                type={formData.type}
                onCategoryChange={(category) =>
                  setFormData({ ...formData, category })
                }
              />

              {/* Amount Input */}
              <AmountInputField
                amount={formData.amount}
                type={formData.type}
                priceInputValue={priceInputValue}
                onAmountChange={(amount) =>
                  setFormData({ ...formData, amount })
                }
                onPriceInputValueChange={setPriceInputValue}
              />

              {/* Note */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ghi Chú
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  rows={3}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
              >
                {loading ? "Đang lưu..." : "Lưu Bản Ghi"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          success: {
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981"
            }
          }
        }}
      />
    </div>
  );
}
