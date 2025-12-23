"use client";

import { useState, useEffect } from "react";
import { PhoneDetail } from "../../lib/phoneDetailService";
import { recyclePhoneDetail } from "../../lib/phoneRecycleService";
import {
  formatCurrencyInput,
  parseCurrencyInput
} from "../../utils/currencyUtils";
import toast from "react-hot-toast";
import PriceInput from "../common/PriceInput";
import ColorSelectorField from "../import/ColorSelectorField";
import { useConfigStore } from "../../stores/useConfigStore";

interface EditPhoneDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneDetail: PhoneDetail | null;
  onSave: (
    id: string,
    phoneDetailData: {
      color: string;
      salePrice: number;
      status: string;
      imei: string;
    }
  ) => Promise<void>;
  onDeleted?: () => Promise<void>;
}

export default function EditPhoneDetailModal({
  isOpen,
  onClose,
  phoneDetail,
  onSave,
  onDeleted
}: EditPhoneDetailModalProps) {
  const [color, setColor] = useState("");
  const [status, setStatus] = useState("");
  const [imei, setImei] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [salePriceInputValue, setSalePriceInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { colors, fetchColors, addColor } = useConfigStore();

  // Fetch colors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchColors();
    }
  }, [isOpen, fetchColors]);

  // Initialize form when phoneDetail changes
  useEffect(() => {
    if (phoneDetail && isOpen) {
      setColor(phoneDetail.color || "");
      setStatus(phoneDetail.status || "");
      setImei(phoneDetail.imei || "");
      setSalePrice(phoneDetail.salePrice || 0);
      setSalePriceInputValue(
        phoneDetail.salePrice ? formatCurrencyInput(phoneDetail.salePrice) : ""
      );
    }
  }, [phoneDetail, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneDetail) return;

    // Validation
    if (!color.trim()) {
      toast.error("Vui lòng nhập màu sắc");
      return;
    }

    // Parse salePrice from inputValue
    const parsedSalePrice = salePriceInputValue
      ? parseCurrencyInput(salePriceInputValue)
      : salePrice;

    if (parsedSalePrice <= 0) {
      toast.error("Vui lòng nhập giá bán hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const trimmedColor = color.trim();

      // Check if color is new (not in the colors list) and add it to collection
      if (trimmedColor && !colors.includes(trimmedColor)) {
        try {
          await addColor(trimmedColor);
          // Refresh colors list
          await fetchColors();
        } catch (err) {
          console.error("Error adding color:", err);
          // Continue even if adding color fails
        }
      }

      await onSave(phoneDetail.id, {
        color: trimmedColor,
        salePrice: parsedSalePrice,
        status: status.trim(),
        imei: imei.trim()
      });

      toast.success("Cập nhật thông tin máy thành công");
      onClose();
    } catch (error) {
      console.error("Error updating phone detail:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin máy");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !phoneDetail) return null;

  const handleDelete = async () => {
    if (!phoneDetail) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa máy này?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await recyclePhoneDetail(phoneDetail);

      if (onDeleted) {
        await onDeleted();
      }

      toast.success("Đã chuyển máy vào kho thu hồi");
      onClose();
    } catch (error) {
      console.error("Error recycling phone detail:", error);
      toast.error("Không thể chuyển vào kho thu hồi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Chỉnh sửa thông tin máy
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
          {/* Phone Name (read-only) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tên sản phẩm
            </label>
            <input
              type="text"
              value={phoneDetail.name || "Chưa có tên"}
              disabled
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          {/* Color */}
          <ColorSelectorField
            colors={colors}
            selectedColor={color}
            onColorChange={setColor}
          />

          {/* IMEI */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              IMEI
            </label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              placeholder="Nhập IMEI"
            />
          </div>

          {/* Sale Price */}
          <div>
            <PriceInput
              value={salePrice}
              inputValue={salePriceInputValue}
              onValueChange={(price) => setSalePrice(price)}
              onInputValueChange={(value) => setSalePriceInputValue(value)}
              placeholder="Nhập giá bán"
              id="sale-price-input"
              label="Giá bán"
              maxSuggestions={3}
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tình trạng máy
            </label>
            <textarea
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400 resize-none"
              placeholder="Nhập tình trạng máy"
            />
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
              type="button"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="rounded-lg border border-red-500 bg-white px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-500/70 dark:bg-zinc-800 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              {deleting ? "Đang xoá..." : "Xoá"}
            </button>

            <button
              type="submit"
              disabled={loading || deleting}
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
