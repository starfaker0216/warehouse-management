"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addImportRecord, ImportRecord } from "../../lib/importService";
import { getPhones, Phone } from "../../lib/phoneService";
import {
  getColors,
  addColor,
  getSuppliers,
  addSupplier
} from "../../lib/configService";
import { useAuth } from "../../contexts/AuthContext";
import PhoneSelector from "../../components/PhoneSelector";

export default function ImportPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
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
  const [success, setSuccess] = useState(false);
  const [showPhoneSelector, setShowPhoneSelector] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState<string>("");
  const [isPriceFocused, setIsPriceFocused] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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

  const handlePhoneSelect = (phone: Phone) => {
    setFormData({
      ...formData,
      phoneId: phone.id,
      phoneType: phone.name
    });
  };

  const handlePhoneAdded = async (newPhone: Phone) => {
    // Add new phone to the list immediately
    setPhones([...phones, newPhone]);
    // Also reload to ensure consistency
    try {
      const phonesData = await getPhones();
      setPhones(phonesData);
    } catch (err) {
      console.error("Error reloading phones:", err);
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
      setSuccess(true);
      // Reset form
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
      setPriceInputValue("");
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Error adding import record:", err);
      setError("Không thể thêm phiếu nhập hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const formatCurrencyInput = (amount: number): string => {
    if (amount === 0 || isNaN(amount)) return "";
    // Format với dấu phẩy ngăn cách hàng nghìn
    return amount.toLocaleString("vi-VN");
  };

  const parseCurrencyInput = (value: string): number => {
    // Loại bỏ tất cả ký tự không phải số
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? parseFloat(cleaned) : 0;
  };

  const formatPriceSuggest = (value: number): string => {
    if (value >= 1000000000) {
      const billions = value / 1000000000;
      // Làm tròn đến 2 chữ số thập phân, loại bỏ số 0 thừa, dùng dấu phẩy
      const rounded = Math.round(billions * 100) / 100;
      if (rounded % 1 === 0) {
        return `${rounded}B`;
      } else {
        return `${rounded
          .toFixed(2)
          .replace(/\.?0+$/, "")
          .replace(".", ",")}B`;
      }
    } else if (value >= 1000000) {
      const millions = value / 1000000;
      const rounded = Math.round(millions * 100) / 100;
      if (rounded % 1 === 0) {
        return `${rounded}M`;
      } else {
        return `${rounded
          .toFixed(2)
          .replace(/\.?0+$/, "")
          .replace(".", ",")}M`;
      }
    } else if (value >= 1000) {
      const thousands = value / 1000;
      const rounded = Math.round(thousands * 100) / 100;
      if (rounded % 1 === 0) {
        return `${rounded}K`;
      } else {
        return `${rounded
          .toFixed(2)
          .replace(/\.?0+$/, "")
          .replace(".", ",")}K`;
      }
    }
    return value.toString();
  };

  const getPriceSuggests = (inputValue: string): number[] => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num <= 0) return [];

    // Xác định số chữ số của số nhập vào (không tính phần thập phân)
    const numStr = Math.floor(num).toString();
    const numDigits = numStr.length;

    // Xác định hệ số nhân ban đầu dựa trên số chữ số
    let baseMultiplier: number;
    if (numDigits === 1) {
      // 1 chữ số: nhân với 1000, 10000, 100000, 1000000, 10000000
      baseMultiplier = 1000;
    } else if (numDigits === 2) {
      // 2 chữ số: nhân với 1000, 10000, 100000, 1000000, 10000000
      baseMultiplier = 1000;
    } else if (numDigits === 3) {
      // 3 chữ số: nhân với 100, 1000, 10000, 100000, 1000000
      baseMultiplier = 100;
    } else if (numDigits === 4) {
      // 4 chữ số: nhân với 100, 1000, 10000, 100000, 1000000
      baseMultiplier = 100;
    } else {
      // 5+ chữ số: nhân với 10, 100, 1000, 10000, 100000
      baseMultiplier = 10;
    }

    // Tạo 5 giá trị suggest
    const multipliers = [
      baseMultiplier,
      baseMultiplier * 10,
      baseMultiplier * 100,
      baseMultiplier * 1000,
      baseMultiplier * 10000
    ];
    return multipliers.map((mult) => num * mult);
  };

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

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                Phiếu nhập hàng đã được tạo thành công! Đang chuyển về trang
                chủ...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <form onSubmit={handleSubmit}>
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
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={
                      formData.phoneId
                        ? (() => {
                            const selectedPhone = phones.find(
                              (p) => p.id === formData.phoneId
                            );
                            return selectedPhone
                              ? selectedPhone.model
                              : formData.phoneId;
                          })()
                        : ""
                    }
                    onClick={() => setShowPhoneSelector(true)}
                    readOnly
                    placeholder="Chọn máy..."
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhoneSelector(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Loại Máy */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Loại Máy <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.phoneType}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneType: e.target.value })
                    }
                    onClick={() => setShowPhoneSelector(true)}
                    readOnly
                    placeholder="Chọn loại máy..."
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhoneSelector(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
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

              {/* Giá Nhập */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Giá Nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="price-input"
                  value={
                    priceInputValue ||
                    (formData.importPrice > 0
                      ? formatCurrencyInput(formData.importPrice)
                      : "")
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    // Parse giá trị nhập vào (loại bỏ tất cả ký tự không phải số)
                    const numValue = parseCurrencyInput(value);

                    // Lưu số thuần vào formData
                    setFormData({
                      ...formData,
                      importPrice: numValue
                    });

                    // Format lại và hiển thị trong input
                    if (numValue > 0) {
                      setPriceInputValue(formatCurrencyInput(numValue));
                    } else {
                      setPriceInputValue("");
                    }
                  }}
                  onFocus={() => {
                    setIsPriceFocused(true);
                    // Khi focus, hiển thị giá trị đã format
                    if (formData.importPrice > 0) {
                      setPriceInputValue(
                        formatCurrencyInput(formData.importPrice)
                      );
                    } else {
                      setPriceInputValue("");
                    }
                  }}
                  onBlur={() => {
                    setIsPriceFocused(false);
                    // Khi blur, format lại từ formData.importPrice
                    if (formData.importPrice > 0) {
                      setPriceInputValue(
                        formatCurrencyInput(formData.importPrice)
                      );
                    } else {
                      setPriceInputValue("");
                    }
                  }}
                  placeholder="0"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
                {formData.importPrice > 0 && !isPriceFocused && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatCurrency(formData.importPrice)}
                  </p>
                )}
                {isPriceFocused &&
                  priceInputValue &&
                  parseCurrencyInput(priceInputValue) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getPriceSuggests(priceInputValue).map(
                        (suggestValue, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => {
                              // Ngăn input bị blur khi click button
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // Cập nhật giá trị số vào formData
                              setFormData({
                                ...formData,
                                importPrice: suggestValue
                              });

                              // Format và hiển thị giá trị trong input
                              const formattedValue =
                                formatCurrencyInput(suggestValue);
                              setPriceInputValue(formattedValue);

                              // Đảm bảo input vẫn focus để hiển thị giá trị đã format
                              setIsPriceFocused(true);

                              // Focus lại input sau khi click
                              setTimeout(() => {
                                const input = document.getElementById(
                                  "price-input"
                                ) as HTMLInputElement;
                                if (input) {
                                  input.focus();
                                  // Đặt cursor ở cuối
                                  input.setSelectionRange(
                                    formattedValue.length,
                                    formattedValue.length
                                  );
                                }
                              }, 0);
                            }}
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                          >
                            {formatPriceSuggest(suggestValue)}
                          </button>
                        )
                      )}
                    </div>
                  )}
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
    </div>
  );
}
