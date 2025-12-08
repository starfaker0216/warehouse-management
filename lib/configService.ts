import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// Get all colors
export const getColors = async (): Promise<string[]> => {
  try {
    const configRef = doc(db, "config", "colors");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
      return configSnap.data().list || [];
    }
    // Return default colors if not exists
    return [
      "Đen",
      "Trắng",
      "Xanh",
      "Đỏ",
      "Vàng",
      "Hồng",
      "Titanium Blue",
      "Titanium Black",
      "Ocean Blue",
      "Ice Blue",
    ];
  } catch (error) {
    console.error("Error getting colors:", error);
    return [];
  }
};

// Add a new color
export const addColor = async (color: string): Promise<void> => {
  try {
    const colors = await getColors();
    if (!colors.includes(color)) {
      const configRef = doc(db, "config", "colors");
      await setDoc(configRef, { list: [...colors, color] }, { merge: true });
    }
  } catch (error) {
    console.error("Error adding color:", error);
    throw error;
  }
};

// Get all suppliers
export const getSuppliers = async (): Promise<string[]> => {
  try {
    const configRef = doc(db, "config", "suppliers");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
      return configSnap.data().list || [];
    }
    // Return default suppliers if not exists
    return [
      "Nhà cung cấp A",
      "Nhà cung cấp B",
      "Nhà cung cấp C",
      "Apple Store",
      "Samsung Store",
    ];
  } catch (error) {
    console.error("Error getting suppliers:", error);
    return [];
  }
};

// Add a new supplier
export const addSupplier = async (supplier: string): Promise<void> => {
  try {
    const suppliers = await getSuppliers();
    if (!suppliers.includes(supplier)) {
      const configRef = doc(db, "config", "suppliers");
      await setDoc(configRef, { list: [...suppliers, supplier] }, { merge: true });
    }
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw error;
  }
};

