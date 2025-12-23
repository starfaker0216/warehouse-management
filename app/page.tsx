"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { usePhoneStore } from "../stores/usePhoneStore";
import { usePhoneStatistics } from "../hooks/usePhoneStatistics";
import StatisticsCards from "../components/home/StatisticsCards";
import PhoneFilters from "../components/home/PhoneFilters";
import PhoneTable from "../components/home/PhoneTable";
import ListPhone from "../components/home/ListPhone";
import Loading from "../components/common/Loading";
import ErrorDisplay from "../components/common/ErrorDisplay";

export default function Home() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { listPhoneDetails, loading, error, fetchListPhoneDetails } =
    usePhoneStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Memoize handleSearchChange to prevent PhoneFilters from re-rendering
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch listPhoneDetails với search - chỉ khi auth đã load xong
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchListPhoneDetails(debouncedSearchTerm);
    }
  }, [
    authLoading,
    isAuthenticated,
    fetchListPhoneDetails,
    debouncedSearchTerm
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Note: Statistics might need to be updated to work with PhoneDetailView
  // For now, we'll pass empty array or adapt the hook
  const statistics = usePhoneStatistics([]);

  // Show loading while checking auth
  if (authLoading) {
    return <Loading />;
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Thống Kê Kho Hàng Điện Thoại
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Quản lý và theo dõi tồn kho sản phẩm điện thoại
          </p>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards statistics={statistics} />

        {/* Filters and Search - Always render to maintain focus */}
        <PhoneFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Loading or Error State */}
        {loading && (
          <div className="mb-6">
            <Loading message="Đang tải dữ liệu..." />
          </div>
        )}

        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Inventory Table - Desktop */}
            <div className="hidden md:block">
              <PhoneTable
                listPhoneDetails={listPhoneDetails}
                searchTerm={debouncedSearchTerm}
              />
            </div>

            {/* Summary */}
            <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
              Hiển thị {listPhoneDetails.length} sản phẩm
            </div>

            {/* Inventory List - Mobile */}
            <div className="md:hidden mt-6">
              <ListPhone listPhoneDetails={listPhoneDetails} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
