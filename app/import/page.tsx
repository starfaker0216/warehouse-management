"use client";

import { useRouter } from "next/navigation";
import { useImportForm } from "../../hooks/useImportForm";
import PhoneSelector from "../../components/PhoneSelector";
import PhoneTypeField from "../../components/import/PhoneTypeField";
import ColorSelectorField from "../../components/import/ColorSelectorField";
import SupplierSelectorField from "../../components/import/SupplierSelectorField";
import DateInputField from "../../components/import/DateInputField";
import ItemPriceInput from "../../components/import/ItemPriceInput";
import { Toaster } from "react-hot-toast";
import { formatDate } from "../../utils/dateUtils";
import { useEffect } from "react";

export default function ImportPage() {
  const router = useRouter();
  const {
    formData,
    setFormData,
    colors,
    suppliers,
    warehouseName,
    newColor,
    setNewColor,
    newSupplier,
    setNewSupplier,
    showAddColor,
    setShowAddColor,
    showAddSupplier,
    setShowAddSupplier,
    loading,
    error,
    showPhoneSelector,
    setShowPhoneSelector,
    dateInputValue,
    setDateInputValue,
    isDateFocused,
    setIsDateFocused,
    authLoading,
    isAuthenticated,
    handlePhoneSelect,
    handlePhoneAdded,
    handleSubmit
  } = useImportForm();

  // Initialize and sync date input value with formData.importDate when not focused
  useEffect(() => {
    if (!isDateFocused && formData.importDate) {
      const formatted = formatDate(formData.importDate);
      setDateInputValue(formatted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.importDate, isDateFocused]);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Phiếu Nhập Hàng
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Thêm phiếu nhập hàng mới vào hệ thống
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Loại Máy */}
              <PhoneTypeField
                phoneType={formData.phoneType}
                onOpenSelector={() => setShowPhoneSelector(true)}
              />
              {/* Số Lượng */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Số Lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {/* Date Input */}
              <DateInputField
                importDate={formData.importDate}
                dateInputValue={dateInputValue}
                isDateFocused={isDateFocused}
                onDateChange={(date) =>
                  setFormData({ ...formData, importDate: date })
                }
                onDateInputValueChange={setDateInputValue}
                onDateFocus={setIsDateFocused}
              />

              {/* Supplier Selector */}
              <SupplierSelectorField
                suppliers={suppliers}
                selectedSupplier={formData.supplier}
                newSupplier={newSupplier}
                showAddSupplier={showAddSupplier}
                onSupplierChange={(supplier) =>
                  setFormData({ ...formData, supplier })
                }
                onNewSupplierChange={setNewSupplier}
                onShowAddSupplier={setShowAddSupplier}
              />

              {/* Kho */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Kho
                </label>
                <input
                  type="text"
                  value={warehouseName}
                  readOnly
                  disabled
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
                />
              </div>

              {/* Ghi Chú */}
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

            {/* Dynamic Items List */}
            {formData.quantity > 0 &&
              formData.items &&
              formData.items.length > 0 && (
                <div className="mt-6 space-y-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Thông tin thiết bị
                  </h3>
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800/50"
                    >
                      <h4 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Thiết bị {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Color Selector */}
                        <ColorSelectorField
                          colors={colors}
                          selectedColor={item.color}
                          newColor={newColor}
                          showAddColor={showAddColor}
                          onColorChange={(color) => {
                            const updatedItems = [...formData.items];
                            updatedItems[index] = {
                              ...updatedItems[index],
                              color
                            };
                            setFormData({ ...formData, items: updatedItems });
                          }}
                          onNewColorChange={setNewColor}
                          onShowAddColor={setShowAddColor}
                        />

                        {/* IMEI */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            IMEI <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={item.imei}
                            onChange={(e) => {
                              const updatedItems = [...formData.items];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                imei: e.target.value
                              };
                              setFormData({ ...formData, items: updatedItems });
                            }}
                            placeholder="Nhập IMEI"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                          />
                        </div>

                        {/* Giá Nhập */}
                        <ItemPriceInput
                          value={item.importPrice}
                          index={index}
                          label="Giá Nhập"
                          onValueChange={(price) => {
                            const updatedItems = [...formData.items];
                            updatedItems[index] = {
                              ...updatedItems[index],
                              importPrice: price
                            };
                            setFormData({ ...formData, items: updatedItems });
                          }}
                        />

                        {/* Giá Bán */}
                        <ItemPriceInput
                          value={item.salePrice}
                          index={index}
                          label="Giá Bán"
                          onValueChange={(price) => {
                            const updatedItems = [...formData.items];
                            updatedItems[index] = {
                              ...updatedItems[index],
                              salePrice: price
                            };
                            setFormData({ ...formData, items: updatedItems });
                          }}
                        />

                        {/* Tình trạng máy */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Tình trạng máy
                          </label>
                          <input
                            type="text"
                            value={item.status}
                            onChange={(e) => {
                              const updatedItems = [...formData.items];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                status: e.target.value
                              };
                              setFormData({ ...formData, items: updatedItems });
                            }}
                            placeholder="Nhập tình trạng máy"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                {loading ? "Đang lưu..." : "Lưu Phiếu Nhập"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Phone Selector Modal */}
      <PhoneSelector
        isOpen={showPhoneSelector}
        onClose={() => setShowPhoneSelector(false)}
        onSelect={handlePhoneSelect}
        onPhoneAdded={handlePhoneAdded}
      />

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
