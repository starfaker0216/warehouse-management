"use client";

import { useState, useEffect } from "react";
import { Phone, addPhone } from "../lib/phoneService";
import { usePhoneStore } from "../stores/usePhoneStore";

interface PhoneSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (phone: Phone) => void;
  onPhoneAdded?: (phone: Phone) => void;
}

export default function PhoneSelector({
  isOpen,
  onClose,
  onSelect,
  onPhoneAdded
}: PhoneSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [newPhoneName, setNewPhoneName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { phones, loading, fetchPhones } = usePhoneStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch phones from Firebase with search query
  useEffect(() => {
    if (isOpen) {
      fetchPhones(debouncedSearchQuery);
    }
  }, [isOpen, debouncedSearchQuery, fetchPhones]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setNewPhoneName("");
      setError(null);
      setIsAdding(false);
    }
  }, [isOpen]);

  const handleAddPhone = async () => {
    if (!newPhoneName.trim()) {
      setError("Vui lòng nhập tên máy");
      return;
    }

    setError(null);
    setIsAdding(true);

    try {
      const newPhoneData: Omit<Phone, "id" | "createdAt" | "updatedAt"> = {
        name: newPhoneName.trim()
      };

      const phoneId = await addPhone(newPhoneData);

      // Create the new phone object
      const newPhone: Phone = {
        id: phoneId,
        ...newPhoneData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Refresh the list
      await fetchPhones(debouncedSearchQuery);

      // Call onPhoneAdded if provided
      if (onPhoneAdded) {
        onPhoneAdded(newPhone);
      }

      // Select the newly added phone
      onSelect(newPhone);
      setNewPhoneName("");
      onClose();
    } catch (err) {
      console.error("Error adding phone:", err);
      setError("Không thể thêm máy mới. Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelectPhone = (phone: Phone) => {
    onSelect(phone);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-xl dark:bg-zinc-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Chọn Loại Máy
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm máy..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
          </div>
        </div>

        {/* Phone List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <div className="mb-4 inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              <p>Đang tải...</p>
            </div>
          ) : phones.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              {searchQuery ? "Không tìm thấy máy nào" : "Chưa có máy nào"}
            </div>
          ) : (
            <div className="space-y-2">
              {phones.map((phone: Phone) => (
                <button
                  key={phone.id}
                  onClick={() => handleSelectPhone(phone)}
                  className="w-full text-left p-4 rounded-lg border border-zinc-200 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {phone.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add New Phone Section */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Thêm Máy Mới
            </label>
            <input
              type="text"
              value={newPhoneName}
              onChange={(e) => setNewPhoneName(e.target.value)}
              placeholder="Nhập tên máy"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
          </div>
          <button
            onClick={handleAddPhone}
            disabled={isAdding || !newPhoneName.trim()}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-zinc-900"
          >
            {isAdding ? "Đang thêm..." : "Thêm Máy Mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
