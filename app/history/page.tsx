"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/common/Loading";
import HistoryFilter from "../../components/history/HistoryFilter";
import HistoryTable from "../../components/history/HistoryTable";
import Pagination from "../../components/history/Pagination";
import { useHistoryStore } from "../../stores/useHistoryStore";
import { useWarehouseStore } from "../../stores/useWarehouseStore";
import { formatDate } from "../../utils/dateUtils";

export default function HistoryPage() {
  const router = useRouter();
  const { employee, isAuthenticated, loading: authLoading } = useAuth();
  const {
    historyItems,
    loading,
    error,
    startDate,
    endDate,
    startDateInput,
    endDateInput,
    selectedWarehouseId,
    selectedType,
    currentPage,
    totalCount,
    setStartDateInput,
    setEndDateInput,
    setSelectedWarehouseId,
    setSelectedType,
    setCurrentPage,
    fetchHistory,
    applyFilter,
    clearFilter,
    resetError,
    getTotalPages
  } = useHistoryStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && employee?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [authLoading, isAuthenticated, employee?.role, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && employee?.role === "admin") {
      if (warehouses.length === 0) {
        fetchWarehouses();
      }
      fetchHistory();
    }
  }, [
    authLoading,
    isAuthenticated,
    employee?.role,
    fetchHistory,
    warehouses.length,
    fetchWarehouses
  ]);

  const handleClearFilter = () => {
    clearFilter();
  };

  const handleWarehouseChange = async (warehouseId: string | null) => {
    setSelectedWarehouseId(warehouseId);
    await fetchHistory();
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || employee?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Lịch Sử Nhập / Xuất
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Xem lại lịch sử nhập hàng và xuất hàng
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

        <HistoryFilter
          startDateInput={startDateInput}
          endDateInput={endDateInput}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
          selectedType={selectedType}
          onStartDateChange={setStartDateInput}
          onEndDateChange={setEndDateInput}
          onWarehouseChange={handleWarehouseChange}
          onTypeChange={(type) => {
            setSelectedType(type);
            fetchHistory();
          }}
          onApply={applyFilter}
          onClear={handleClearFilter}
        />

        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Kho đang xem:</span>{" "}
          {selectedWarehouseId
            ? warehouses.find((w) => w.id === selectedWarehouseId)?.name ||
              selectedWarehouseId
            : "Tất cả kho"}
          <span className="ml-3">
            <span className="font-medium">Loại:</span>{" "}
            {selectedType === "all"
              ? "Tất cả"
              : selectedType === "import"
              ? "Nhập hàng"
              : "Xuất hàng"}
          </span>
          {(startDate || endDate) && (
            <span className="ml-3">
              Khoảng thời gian:{" "}
              {startDate ? formatDate(startDate) : "Không giới hạn"} -{" "}
              {endDate ? formatDate(endDate) : "Không giới hạn"}
            </span>
          )}
        </div>

        {loading ? (
          <Loading message="Đang tải lịch sử..." />
        ) : (
          <>
            <div className="mb-6">
              <Pagination
                currentPage={currentPage}
                totalPages={getTotalPages()}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  fetchHistory();
                }}
              />
            </div>
            <HistoryTable items={historyItems} warehouses={warehouses} />
            {historyItems.length > 10 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={getTotalPages()}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    fetchHistory();
                  }}
                />
              </div>
            )}
            <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Hiển thị {historyItems.length} / {totalCount} bản ghi
            </div>
          </>
        )}
      </div>
    </div>
  );
}
