import { updatePhone as updatePhoneService } from "../../lib/phoneService";
import { usePhoneStore } from "../usePhoneStore";
import { useConfigStore } from "../useConfigStore";
import { useAuthStore } from "../useAuthStore";
import toast from "react-hot-toast";
import { ImportFormData, ImportItem } from "../../types/importTypes";

// Validation helpers
export const validateFormData = (
  formData: ImportFormData,
  setLoading: (loading: boolean) => void
): boolean => {
  if (!formData.phoneType || !formData.phoneType.trim()) {
    toast.error("Vui lòng chọn loại máy!");
    setLoading(false);
    return false;
  }

  if (!formData.quantity || formData.quantity <= 0) {
    toast.error("Vui lòng nhập số lượng lớn hơn 0!");
    setLoading(false);
    return false;
  }

  if (!formData.items || formData.items.length !== formData.quantity) {
    toast.error("Vui lòng nhập đầy đủ thông tin cho tất cả các thiết bị!");
    setLoading(false);
    return false;
  }

  if (!formData.supplier || !formData.supplier.trim()) {
    toast.error("Vui lòng chọn nhà cung cấp!");
    setLoading(false);
    return false;
  }

  return true;
};

export const validateItems = (
  items: ImportItem[],
  setLoading: (loading: boolean) => void
): boolean => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.color || !item.color.trim()) {
      toast.error(`Vui lòng chọn màu sắc cho thiết bị ${i + 1}!`);
      setLoading(false);
      return false;
    }
    if (!item.imei || !item.imei.trim()) {
      toast.error(`Vui lòng nhập IMEI cho thiết bị ${i + 1}!`);
      setLoading(false);
      return false;
    }
    if (!item.importPrice || item.importPrice <= 0) {
      toast.error(`Vui lòng nhập giá nhập cho thiết bị ${i + 1}!`);
      setLoading(false);
      return false;
    }
  }
  return true;
};

// Data processing helpers
export const processSupplierAndColors = async (
  items: ImportItem[],
  supplier: string,
  newSupplier: string,
  showAddSupplier: boolean
): Promise<string> => {
  const supplierName =
    showAddSupplier && newSupplier.trim()
      ? newSupplier.trim()
      : supplier?.trim() || "";

  const allColors = items.map((item) => item.color.trim());
  const uniqueColors = [...new Set(allColors)];

  await useConfigStore
    .getState()
    .processColorAndSupplier(uniqueColors.join(","), supplierName);

  return supplierName;
};

export const getEmployeeInfo = () => {
  const employee = useAuthStore.getState().employee;
  return {
    employeeId: employee?.id || "",
    employeeName: employee?.name || "",
    warehouseId: employee?.warehouseId || undefined
  };
};

// Inventory update helper
export const updatePhoneInventory = async (
  phoneId: string,
  items: ImportItem[],
  quantity: number
): Promise<void> => {
  const phones = usePhoneStore.getState().phones;
  if (!phoneId || items.length === 0) {
    return;
  }

  const selectedPhone = phones.find((p) => p.id === phoneId);
  if (!selectedPhone) {
    return;
  }

  const employee = useAuthStore.getState().employee;
  const employeeId = employee?.id || "";
  const employeeName = employee?.name || "";

  const updatedData = [...selectedPhone.data];
  const colorMap = new Map<string, number>();

  // Count quantity by color
  items.forEach((item) => {
    const color = item.color.trim();
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  });

  // Update inventory by color
  colorMap.forEach((count, color) => {
    const colorIndex = updatedData.findIndex((item) => item.color === color);

    if (colorIndex >= 0) {
      updatedData[colorIndex] = {
        ...updatedData[colorIndex],
        quantity: updatedData[colorIndex].quantity + count
      };
    } else {
      updatedData.push({
        color,
        quantity: count,
        price: 0
      });
    }
  });

  const newTotalQuantity = selectedPhone.totalQuantity + quantity;

  await updatePhoneService(
    phoneId,
    {
      data: updatedData,
      totalQuantity: newTotalQuantity
    },
    employeeId,
    employeeName
  );

  // Refresh phones
  await usePhoneStore.getState().fetchPhones();
};
