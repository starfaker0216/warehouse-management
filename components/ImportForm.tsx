"use client";

import { useState, useEffect } from "react";
import { addImportRecord, ImportRecord } from "../lib/importService";
import { getPhones, Phone } from "../lib/phoneService";
import {
  getColors,
  addColor,
  getSuppliers,
  addSupplier
} from "../lib/configService";

interface ImportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportForm({
  isOpen,
  onClose,
  onSuccess
}: ImportFormProps) {
  const [formData, setFormData] = useState<
    Omit<ImportRecord, "id" | "createdAt" | "updatedAt">
  >({
    phoneId: "",
    importDate: new Date(),
    phoneType: "",
    totalQuantity: 0,
    quantity: 0,
    imei: "",
    color: "",
    importPrice: 0,
    supplier: "",
    imeiType: "",
    note: ""
  });

  const [phones, setPhones] = useState<Phone[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [showAddColor, setShowAddColor] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [phonesData, colorsData, suppliersData] = await Promise.all([
        getPhones(),
        getColors(),
        getSuppliers()
      ]);
      setPhones(phonesData);
      setColors(colorsData);
      setSuppliers(suppliersData);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Add new color if needed
      if (showAddColor && newColor.trim()) {
        await addColor(newColor.trim());
        setColors([...colors, newColor.trim()]);
        setFormData({ ...formData, color: newColor.trim() });
        setNewColor("");
        setShowAddColor(false);
      }

      // Add new supplier if needed
      if (showAddSupplier && newSupplier.trim()) {
        await addSupplier(newSupplier.trim());
        setSuppliers([...suppliers, newSupplier.trim()]);
        setFormData({ ...formData, supplier: newSupplier.trim() });
        setNewSupplier("");
        setShowAddSupplier(false);
      }

      await addImportRecord(formData);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Error adding import record:", err);
      setError("Không thể thêm phiếu nhập hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      phoneId: "",
      importDate: new Date(),
      phoneType: "",
      totalQuantity: 0,
      quantity: 0,
      imei: "",
      color: "",
      importPrice: 0,
      supplier: "",
      imeiType: "",
      note: ""
    });
    setError(null);
    setNewColor("");
    setNewSupplier("");
    setShowAddColor(false);
    setShowAddSupplier(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Phiếu Nhập Hàng
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <svg
              className="h-6 w-6"
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

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ID Máy */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ID Máy <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.phoneId}
                onChange={(e) =>
                  setFormData({ ...formData, phoneId: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">Chọn máy</option>
                {phones.map((phone) => (
                  <option key={phone.id} value={phone.id}>
                    {phone.name} - {phone.model}
                  </option>
                ))}
              </select>
            </div>

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

            {/* Loại Máy */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Loại Máy <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phoneType}
                onChange={(e) =>
                  setFormData({ ...formData, phoneType: e.target.value })
                }
                placeholder="Ví dụ: Smartphone, Tablet..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>

            {/* Số Lượng Tổng */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Số Lượng Tổng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.totalQuantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalQuantity: parseInt(e.target.value) || 0
                  })
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

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
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
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

            {/* Màu Sắc */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Màu Sắc <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {!showAddColor ? (
                  <div className="flex gap-2">
                    <select
                      required
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    >
                      <option value="">Chọn màu</option>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddColor(true)}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      + Mới
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Nhập màu mới"
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddColor(false);
                        setNewColor("");
                      }}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Giá Nhập */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Giá Nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.importPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importPrice: parseFloat(e.target.value) || 0
                  })
                }
                placeholder="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
              {formData.importPrice > 0 && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(formData.importPrice)}
                </p>
              )}
            </div>

            {/* Nhà Cung Cấp */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nhà Cung Cấp <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {!showAddSupplier ? (
                  <div className="flex gap-2">
                    <select
                      required
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    >
                      <option value="">Chọn nhà cung cấp</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier} value={supplier}>
                          {supplier}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddSupplier(true)}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      + Mới
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
                      placeholder="Nhập nhà cung cấp mới"
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSupplier(false);
                        setNewSupplier("");
                      }}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
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
              onClick={handleClose}
              className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu Phiếu Nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
