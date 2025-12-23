import { create } from "zustand";
import toast from "react-hot-toast";
import { PhoneDetail } from "../lib/phoneDetailService";
import { recyclePhoneDetail } from "../lib/phoneRecycleService";
import {
  formatCurrencyInput,
  parseCurrencyInput
} from "../utils/currencyUtils";

interface SubmitArgs {
  phoneDetail: PhoneDetail;
  onSave: (
    id: string,
    data: { color: string; salePrice: number; status: string; imei: string }
  ) => Promise<void>;
  colors: string[];
  fetchColors: () => Promise<void>;
  addColor: (colorName: string) => Promise<void>;
  onClose: () => void;
}

interface DeleteArgs {
  phoneDetail: PhoneDetail;
  onDeleted?: () => Promise<void>;
  onClose: () => void;
}

interface EditPhoneDetailState {
  color: string;
  status: string;
  imei: string;
  salePrice: number;
  salePriceInputValue: string;
  loading: boolean;
  deleting: boolean;
  setColor: (value: string) => void;
  setStatus: (value: string) => void;
  setImei: (value: string) => void;
  setSalePrice: (value: number) => void;
  setSalePriceInputValue: (value: string) => void;
  initialize: (phoneDetail: PhoneDetail | null, isOpen: boolean) => void;
  handleSubmit: (args: SubmitArgs) => Promise<void>;
  handleDelete: (args: DeleteArgs) => Promise<void>;
}

const initialState = {
  color: "",
  status: "",
  imei: "",
  salePrice: 0,
  salePriceInputValue: "",
  loading: false,
  deleting: false
};

export const useEditPhoneDetailStore = create<EditPhoneDetailState>(
  (set, get) => ({
    ...initialState,

    setColor: (value) => set({ color: value }),
    setStatus: (value) => set({ status: value }),
    setImei: (value) => set({ imei: value }),
    setSalePrice: (value) => set({ salePrice: value }),
    setSalePriceInputValue: (value) => set({ salePriceInputValue: value }),

    initialize: (phoneDetail, isOpen) => {
      if (!phoneDetail || !isOpen) return;
      set({
        color: phoneDetail.color || "",
        status: phoneDetail.status || "",
        imei: phoneDetail.imei || "",
        salePrice: phoneDetail.salePrice || 0,
        salePriceInputValue: phoneDetail.salePrice
          ? formatCurrencyInput(phoneDetail.salePrice)
          : ""
      });
    },

    handleSubmit: async ({
      phoneDetail,
      onSave,
      colors,
      fetchColors,
      addColor,
      onClose
    }) => {
      if (!phoneDetail) return;

      const state = get();
      const { color, status, imei, salePrice, salePriceInputValue } = state;

      if (!color.trim()) {
        toast.error("Vui lòng nhập màu sắc");
        return;
      }

      const parsedSalePrice = salePriceInputValue
        ? parseCurrencyInput(salePriceInputValue)
        : salePrice;

      if (parsedSalePrice <= 0) {
        toast.error("Vui lòng nhập giá bán hợp lệ");
        return;
      }

      set({ loading: true });
      try {
        const trimmedColor = color.trim();

        // Nếu màu mới, thêm vào collection
        if (trimmedColor && !colors.includes(trimmedColor)) {
          try {
            await addColor(trimmedColor);
            await fetchColors();
          } catch (err) {
            console.error("Error adding color:", err);
            // vẫn tiếp tục lưu
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
        set({ loading: false });
      }
    },

    handleDelete: async ({ phoneDetail, onDeleted, onClose }) => {
      if (!phoneDetail) return;

      const confirmed = window.confirm("Bạn có chắc chắn muốn xóa máy này?");
      if (!confirmed) return;

      set({ deleting: true });
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
        set({ deleting: false });
      }
    }
  })
);
