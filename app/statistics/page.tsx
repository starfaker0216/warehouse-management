"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/common/Loading";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import StatisticsCards from "../../components/statistics/StatisticsCards";
import DateRangeFilter from "../../components/statistics/DateRangeFilter";
import { useStatisticsStore } from "../../stores/useStatisticsStore";
import { formatDate } from "../../utils/dateUtils";

export default function StatisticsPage() {
  const router = useRouter();
  const { employee, isAuthenticated, loading: authLoading } = useAuth();
  const {
    totalRemainingQuantity,
    totalInventoryValue,
    totalImportValue,
    totalExportValue,
    loading,
    error,
    startDate,
    endDate,
    startDateInput,
    endDateInput,
    setStartDateInput,
    setEndDateInput,
    applyDateFilter,
    fetchStatistics,
    clearDateFilter,
    resetError
  } = useStatisticsStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && employee?.role === "admin") {
      fetchStatistics();
    }
  }, [authLoading, isAuthenticated, employee?.role, fetchStatistics]);

  const handleClearFilter = () => {
    clearDateFilter();
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (employee?.role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <ErrorDisplay error="Trang chỉ dành cho quản trị viên." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Thống Kê
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tổng hợp tồn kho, tiền nhập và tiền xuất theo khoảng thời gian.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={resetError}
                className="text-xs font-semibold text-red-700 underline dark:text-red-300"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        <DateRangeFilter
          startDateInput={startDateInput}
          endDateInput={endDateInput}
          onStartDateChange={setStartDateInput}
          onEndDateChange={setEndDateInput}
          onApply={applyDateFilter}
          onClear={handleClearFilter}
        />

        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Kho:</span>{" "}
          {employee?.warehouseId || "Chưa gán kho"}
          {(startDate || endDate) && (
            <span className="ml-3">
              Khoảng thời gian:{" "}
              {startDate ? formatDate(startDate) : "Không giới hạn"} -{" "}
              {endDate ? formatDate(endDate) : "Không giới hạn"}
            </span>
          )}
        </div>

        {loading ? (
          <Loading message="Đang tải thống kê..." />
        ) : (
          <StatisticsCards
            totalRemainingQuantity={totalRemainingQuantity}
            totalInventoryValue={totalInventoryValue}
            totalImportValue={totalImportValue}
            totalExportValue={totalExportValue}
          />
        )}
      </div>
    </div>
  );
}

