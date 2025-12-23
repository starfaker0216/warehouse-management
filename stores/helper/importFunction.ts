import { useConfigStore } from "../useConfigStore";
import { useAuthStore } from "../useAuthStore";
import { addPhoneDetails } from "../../lib/phoneDetailService";
import {
  colorExists,
  addColor,
  supplierExists,
  addSupplier
} from "../../lib/configService";
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

  // Process each color individually
  const allColors = items
    .map((item) => item.color.trim())
    .filter((color) => color);
  const uniqueColors = [...new Set(allColors)];

  // Check and add each color if it doesn't exist
  const colorPromises = uniqueColors.map(async (color) => {
    const exists = await colorExists(color);
    if (!exists) {
      await addColor(color);
    }
  });

  await Promise.all(colorPromises);

  // Refresh colors in store after adding new ones
  if (colorPromises.length > 0) {
    await useConfigStore.getState().fetchColors();
  }

  // Process supplier
  if (supplierName) {
    const supplierExistsResult = await supplierExists(supplierName);
    if (!supplierExistsResult) {
      await addSupplier(supplierName);
      // Refresh suppliers in store after adding new one
      await useConfigStore.getState().fetchSuppliers();
    }
  }

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

// Create phone details helper
export const createPhoneDetails = async (
  phoneId: string,
  warehouseId: string,
  items: ImportItem[]
): Promise<string[]> => {
  if (!phoneId || !warehouseId || items.length === 0) {
    return [];
  }

  const employee = useAuthStore.getState().employee;
  if (!employee) {
    throw new Error("Employee not found");
  }

  const phoneDetailsData = items.map((item) => ({
    phoneId,
    warehouseId,
    color: item.color.trim(),
    imei: item.imei.trim(),
    importPrice: item.importPrice,
    salePrice: item.salePrice,
    status: item.status.trim(),
    updatedBy: {
      employeeId: employee.id || "",
      employeeName: employee.name || ""
    }
  }));

  return await addPhoneDetails(phoneDetailsData);
};
