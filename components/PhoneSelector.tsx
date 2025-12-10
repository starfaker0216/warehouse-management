"use client";

import { useState, useEffect, useMemo } from "react";
import { Phone, addPhone } from "../lib/phoneService";

interface PhoneSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (phone: Phone) => void;
  phones: Phone[];
  onPhoneAdded?: (phone: Phone) => void;
}

export default function PhoneSelector({
  isOpen,
  onClose,
  onSelect,
  phones,
  onPhoneAdded
}: PhoneSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPhoneId, setNewPhoneId] = useState("");
  const [newPhoneName, setNewPhoneName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter phones based on search query
  const filteredPhones = useMemo(() => {
    if (!searchQuery.trim()) {
      return phones;
    }
    const query = searchQuery.toLowerCase();
    return phones.filter(
      (phone) =>
        phone.name.toLowerCase().includes(query) ||
        phone.brand.toLowerCase().includes(query) ||
        phone.model.toLowerCase().includes(query) ||
        phone.id.toLowerCase().includes(query)
    );
  }, [phones, searchQuery]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setNewPhoneId("");
      setNewPhoneName("");
      setError(null);
      setIsAdding(false);
    }
  }, [isOpen]);

  const handleAddPhone = async () => {
    if (!newPhoneId.trim() || !newPhoneName.trim()) {
      setError("Vui lòng nhập đầy đủ ID máy và tên máy");
      return;
    }

    setError(null);
    setIsAdding(true);

    try {
      const newPhoneData: Omit<Phone, "id" | "createdAt" | "updatedAt"> = {
        name: newPhoneName.trim(),
        brand: "",
        model: newPhoneId.trim(), // Store custom ID in model field
        color: "",
        storage: "",
        price: 0,
        quantity: 0,
        status: "out_of_stock"
      };

      const phoneId = await addPhone(newPhoneData);
      
      // Create the new phone object
      const newPhone: Phone = {
        id: phoneId,
        ...newPhoneData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Call onPhoneAdded if provided to refresh the list
      if (onPhoneAdded) {
        onPhoneAdded(newPhone);
      }

      // Select the newly added phone
      onSelect(newPhone);
      setNewPhoneId("");
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
          {filteredPhones.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              {searchQuery ? "Không tìm thấy máy nào" : "Chưa có máy nào"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhones.map((phone) => (
                <button
                  key={phone.id}
                  onClick={() => handleSelectPhone(phone)}
                  className="w-full text-left p-4 rounded-lg border border-zinc-200 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {phone.name}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {phone.brand && `${phone.brand} • `}
                    {phone.model && `ID: ${phone.model} • `}
                    Firestore ID: {phone.id}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add New Phone Section */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Thêm Máy Mới
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ID Máy
              </label>
              <input
                type="text"
                value={newPhoneId}
                onChange={(e) => setNewPhoneId(e.target.value)}
                placeholder="Nhập ID máy"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tên Máy
              </label>
              <input
                type="text"
                value={newPhoneName}
                onChange={(e) => setNewPhoneName(e.target.value)}
                placeholder="Nhập tên máy"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>
          </div>
          <button
            onClick={handleAddPhone}
            disabled={isAdding || !newPhoneId.trim() || !newPhoneName.trim()}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-zinc-900"
          >
            {isAdding ? "Đang thêm..." : "Thêm Máy Mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

