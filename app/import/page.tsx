"use client";

import { useRouter } from "next/navigation";
import { useImportForm } from "../../hooks/useImportForm";
import PhoneSelector from "../../components/PhoneSelector";
import PhoneSelectorField from "../../components/import/PhoneSelectorField";
import ColorSelectorField from "../../components/import/ColorSelectorField";
import SupplierSelectorField from "../../components/import/SupplierSelectorField";
import PriceInputField from "../../components/import/PriceInputField";
import { Toaster } from "react-hot-toast";

export default function ImportPage() {
  const router = useRouter();
  const {
    formData,
    setFormData,
    phones,
    colors,
    suppliers,
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
    priceInputValue,
    setPriceInputValue,
    isPriceFocused,
    setIsPriceFocused,
    authLoading,
    isAuthenticated,
    handlePhoneSelect,
    handlePhoneAdded,
    handleSubmit
  } = useImportForm();

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
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Phone Selector Fields */}
              <PhoneSelectorField
                phones={phones}
                phoneId={formData.phoneId}
                phoneType={formData.phoneType}
                onOpenSelector={() => setShowPhoneSelector(true)}
              />

              {/* Color Selector */}
              <ColorSelectorField
                colors={colors}
                selectedColor={formData.color}
                newColor={newColor}
                showAddColor={showAddColor}
                onColorChange={(color) => setFormData({ ...formData, color })}
                onNewColorChange={setNewColor}
                onShowAddColor={setShowAddColor}
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

              {/* IMEI */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  IMEI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.imei}
                  onChange={(e) =>
                    setFormData({ ...formData, imei: e.target.value })
                  }
                  placeholder="Nhập IMEI"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
              </div>

              {/* Loại IMEI */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Loại IMEI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.imeiType}
                  onChange={(e) =>
                    setFormData({ ...formData, imeiType: e.target.value })
                  }
                  placeholder="Ví dụ: IMEI1, IMEI2, Dual IMEI..."
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
              </div>

              {/* Price Input */}
              <PriceInputField
                importPrice={formData.importPrice}
                priceInputValue={priceInputValue}
                isPriceFocused={isPriceFocused}
                onPriceChange={(price) =>
                  setFormData({ ...formData, importPrice: price })
                }
                onPriceInputValueChange={setPriceInputValue}
                onPriceFocus={setIsPriceFocused}
              />

              {/* Ngày Nhập */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ngày Nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.importDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      importDate: new Date(e.target.value)
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

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
        phones={phones}
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
