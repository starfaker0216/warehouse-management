"use client";

import { useState, useEffect } from "react";
import { Phone } from "../../lib/phoneService";
import {
  formatCurrencyInput,
  parseCurrencyInput
} from "../../utils/currencyUtils";
import toast from "react-hot-toast";
import PriceInput from "../common/PriceInput";

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: Phone | null;
  onSave: (
    id: string,
    phoneData: {
      name: string;
      model: string;
      data: Array<{ color: string; quantity: number; price: number }>;
      condition?: string;
    }
  ) => Promise<void>;
}

export default function EditPhoneModal({
  isOpen,
  onClose,
  phone,
  onSave
}: EditPhoneModalProps) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("");
  const [data, setData] = useState<
    Array<{
      color: string;
      quantity: number;
      price: number;
      priceInputValue: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  // Initialize form when phone changes
  useEffect(() => {
    if (phone && isOpen) {
      setName(phone.name || "");
      setModel(phone.model || "");
      setCondition(phone.condition || "");
      setData(
        phone.data
          ? phone.data.map((item) => ({
              color: item.color || "",
              quantity: item.quantity || 0,
              price: item.price || 0,
              priceInputValue: item.price ? formatCurrencyInput(item.price) : ""
            }))
          : []
      );
    }
  }, [phone, isOpen]);

  const handleAddColor = () => {
    setData([
      ...data,
      { color: "", quantity: 0, price: 0, priceInputValue: "" }
    ]);
  };

  const handleRemoveColor = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleColorChange = (
    index: number,
    field: "color" | "quantity",
    value: string | number
  ) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: field === "quantity" ? Number(value) || 0 : value
    };
    setData(newData);
  };

  const handlePriceChange = (index: number, price: number) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      price
    };
    setData(newData);
  };

  const handlePriceInputChange = (index: number, inputValue: string) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      priceInputValue: inputValue
    };
    setData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) return;

    // Validation
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!model.trim()) {
      toast.error("Vui lòng nhập model");
      return;
    }

    // First, parse prices from inputValue to ensure we have the latest values
    const dataWithParsedPrices = data.map((item) => {
      const parsedPrice = item.priceInputValue
        ? parseCurrencyInput(item.priceInputValue)
        : item.price;
      return {
        ...item,
        price: parsedPrice > 0 ? parsedPrice : item.price
      };
    });

    // Filter out completely empty items (items with no fields filled)
    const nonEmptyItems = dataWithParsedPrices.filter(
      (item) => item.color.trim() || item.quantity > 0 || item.price > 0
    );

    if (nonEmptyItems.length === 0) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin màu sắc, số lượng và giá cho ít nhất một màu"
      );
      return;
    }

    // Validate that all non-empty items have all required fields
    const validData = nonEmptyItems.filter(
      (item) => item.color.trim() && item.quantity > 0 && item.price > 0
    );

    if (validData.length !== nonEmptyItems.length) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin màu sắc, số lượng và giá cho từng màu"
      );
      return;
    }

    if (validData.length === 0) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin màu sắc, số lượng và giá cho ít nhất một màu"
      );
      return;
    }

    setLoading(true);
    try {
      // Use validData which already has parsed prices
      const finalData = validData.map((item) => ({
        color: item.color.trim(),
        quantity: item.quantity,
        price: item.price
      }));

      await onSave(phone.id, {
        name: name.trim(),
        model: model.trim(),
        data: finalData,
        condition: condition.trim() || undefined
      });

      toast.success("Cập nhật sản phẩm thành công");
      onClose();
    } catch (error) {
      console.error("Error updating phone:", error);
      toast.error("Có lỗi xảy ra khi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !phone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Chỉnh sửa sản phẩm
          </h2>
          <button
            onClick={onClose}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          {/* Model */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              placeholder="Nhập model"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tình trạng máy
            </label>
            <textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400 resize-none"
              placeholder="Nhập tình trạng máy"
            />
          </div>

          {/* Data Array */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Màu sắc, số lượng và giá <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddColor}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                + Thêm màu
              </button>
            </div>

            {data.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {'Chưa có màu sắc nào. Nhấn "Thêm màu" để thêm.'}
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-lg border border-zinc-300 p-3 dark:border-zinc-700"
                  >
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Màu sắc
                      </label>
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) =>
                          handleColorChange(index, "color", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                        placeholder="Nhập màu sắc"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleColorChange(index, "quantity", e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400 [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <PriceInput
                        value={item.price}
                        inputValue={item.priceInputValue}
                        onValueChange={(price) =>
                          handlePriceChange(index, price)
                        }
                        onInputValueChange={(value) =>
                          handlePriceInputChange(index, value)
                        }
                        placeholder="Nhập giá"
                        id={`price-input-${index}`}
                        label="Giá"
                        maxSuggestions={3}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(index)}
                        className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
