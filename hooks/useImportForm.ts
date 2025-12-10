import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addImportRecord, ImportRecord } from "../lib/importService";
import { getPhones, Phone, updatePhone } from "../lib/phoneService";
import {
  getColors,
  addColor,
  colorExists,
  getSuppliers,
  addSupplier,
  supplierExists
} from "../lib/configService";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export interface ImportFormData {
  phoneId: string;
  importDate: Date;
  phoneType: string;
  totalQuantity: number;
  quantity: number;
  imei: string;
  color: string;
  importPrice: number;
  supplier: string;
  imeiType: string;
  note: string;
}

const initialFormData: ImportFormData = {
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
};

export function useImportForm() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ImportFormData>(initialFormData);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [showAddColor, setShowAddColor] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const processColorAndSupplier = async (
    colorName: string,
    supplierName: string
  ) => {
    // Xử lý color: thêm vào collection nếu chưa có
    if (colorName) {
      try {
        const colorAlreadyExists = await colorExists(colorName);
        if (!colorAlreadyExists) {
          await addColor(colorName);
          const updatedColors = await getColors();
          setColors(updatedColors);
        }
      } catch (colorError) {
        console.error("Error processing color:", colorError);
      }

      if (showAddColor && newColor.trim()) {
        setNewColor("");
        setShowAddColor(false);
      }
    }

    // Xử lý supplier: thêm vào collection nếu chưa có
    if (supplierName) {
      try {
        const supplierAlreadyExists = await supplierExists(supplierName);
        if (!supplierAlreadyExists) {
          await addSupplier(supplierName);
          const updatedSuppliers = await getSuppliers();
          setSuppliers(updatedSuppliers);
        }
      } catch (supplierError) {
        console.error("Error processing supplier:", supplierError);
      }

      if (showAddSupplier && newSupplier.trim()) {
        setNewSupplier("");
        setShowAddSupplier(false);
      }
    }
  };

  const updatePhoneInventory = async (updatedFormData: ImportFormData) => {
    if (
      updatedFormData.phoneId &&
      updatedFormData.color &&
      updatedFormData.quantity > 0
    ) {
      const selectedPhone = phones.find(
        (p) => p.id === updatedFormData.phoneId
      );
      if (selectedPhone) {
        const updatedData = [...selectedPhone.data];
        const colorIndex = updatedData.findIndex(
          (item) => item.color === updatedFormData.color
        );

        if (colorIndex >= 0) {
          updatedData[colorIndex] = {
            ...updatedData[colorIndex],
            quantity:
              updatedData[colorIndex].quantity + updatedFormData.quantity
          };
        } else {
          updatedData.push({
            color: updatedFormData.color,
            quantity: updatedFormData.quantity
          });
        }

        const newTotalQuantity =
          selectedPhone.totalQuantity + updatedFormData.quantity;

        await updatePhone(updatedFormData.phoneId, {
          data: updatedData,
          totalQuantity: newTotalQuantity
        });

        const updatedPhones = await getPhones();
        setPhones(updatedPhones);
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPriceInputValue("");
    setShowAddColor(false);
    setShowAddSupplier(false);
    setNewColor("");
    setNewSupplier("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.color || !formData.color.trim()) {
      toast.error("Vui lòng chọn màu sắc!");
      setLoading(false);
      return;
    }

    if (!formData.supplier || !formData.supplier.trim()) {
      toast.error("Vui lòng chọn nhà cung cấp!");
      setLoading(false);
      return;
    }

    try {
      const colorName =
        showAddColor && newColor.trim()
          ? newColor.trim()
          : formData.color?.trim() || "";

      const supplierName =
        showAddSupplier && newSupplier.trim()
          ? newSupplier.trim()
          : formData.supplier?.trim() || "";

      const updatedFormData = {
        ...formData,
        color: colorName,
        supplier: supplierName
      };

      await processColorAndSupplier(colorName, supplierName);
      await addImportRecord(updatedFormData);
      await updatePhoneInventory(updatedFormData);

      resetForm();
      toast.success("Phiếu nhập hàng đã được tạo thành công!");
    } catch (err) {
      console.error("Error adding import record:", err);
      setError("Không thể thêm phiếu nhập hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
