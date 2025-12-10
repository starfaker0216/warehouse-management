import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import { usePhoneStore } from "../stores/usePhoneStore";
import { useConfigStore } from "../stores/useConfigStore";
import { useImportFormStore } from "../stores/useImportFormStore";
import { Phone } from "../lib/phoneService";

export function useImportForm() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, initialize } = useAuthStore();
  const { phones, fetchPhones, setPhones } = usePhoneStore();
  const { colors, suppliers, fetchAll } = useConfigStore();
  const importFormStore = useImportFormStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPhones();
      fetchAll();
    }
  }, [isAuthenticated, fetchPhones, fetchAll]);

  const handlePhoneSelect = (phone: Phone) => {
    importFormStore.handlePhoneSelect(phone.id, phone.name);
  };

  const handlePhoneAdded = async (newPhone: Phone) => {
    // Add new phone to the list immediately
    setPhones([...phones, newPhone]);
    // Also reload to ensure consistency
    try {
      await fetchPhones();
    } catch (err) {
      console.error("Error reloading phones:", err);
    }
  };

  return {
    // Form data
    formData: importFormStore.formData,
    setFormData: importFormStore.setFormData,

    // Data
    phones,
    colors,
    suppliers,

    // New item states
    newColor: importFormStore.newColor,
    setNewColor: importFormStore.setNewColor,
    newSupplier: importFormStore.newSupplier,
    setNewSupplier: importFormStore.setNewSupplier,

    // UI states
    showAddColor: importFormStore.showAddColor,
    setShowAddColor: importFormStore.setShowAddColor,
    showAddSupplier: importFormStore.showAddSupplier,
    setShowAddSupplier: importFormStore.setShowAddSupplier,
    showPhoneSelector: importFormStore.showPhoneSelector,
    setShowPhoneSelector: importFormStore.setShowPhoneSelector,

    // Price input states
    priceInputValue: importFormStore.priceInputValue,
    setPriceInputValue: importFormStore.setPriceInputValue,
    isPriceFocused: importFormStore.isPriceFocused,
    setIsPriceFocused: importFormStore.setIsPriceFocused,

    // Loading and error
    loading: importFormStore.loading,
    error: importFormStore.error,

    // Auth
    authLoading,
    isAuthenticated,

    // Handlers
    handlePhoneSelect,
    handlePhoneAdded,
    handleSubmit: importFormStore.handleSubmit
  };
}
