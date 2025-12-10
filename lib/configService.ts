import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export interface Color {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get all colors
export const getColors = async (): Promise<string[]> => {
  try {
    const colorsRef = collection(db, "colors");
    const querySnapshot = await getDocs(colorsRef);
    const colors = querySnapshot.docs.map((doc) => doc.data().name);
    return colors.sort();
  } catch (error) {
    console.error("Error getting colors:", error);
    return [];
  }
};

// Get all color objects
export const getColorObjects = async (): Promise<Color[]> => {
  try {
    const colorsRef = collection(db, "colors");
    const querySnapshot = await getDocs(colorsRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting color objects:", error);
    return [];
  }
};

// Check if color exists
export const colorExists = async (colorName: string): Promise<boolean> => {
  try {
    const colorsRef = collection(db, "colors");
    const q = query(colorsRef, where("name", "==", colorName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking color:", error);
    return false;
  }
};

// Add a new color
export const addColor = async (colorName: string): Promise<string> => {
  try {
    const trimmedColorName = colorName.trim();

    // Check if color already exists
    const exists = await colorExists(trimmedColorName);

    if (exists) {
      // Get existing color ID
      const colorsRef = collection(db, "colors");
      const q = query(colorsRef, where("name", "==", trimmedColorName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
    }

    // Add new color
    const colorsRef = collection(db, "colors");
    const newColor = {
      name: trimmedColorName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(colorsRef, newColor);
    return docRef.id;
  } catch (error) {
    console.error("Error adding color:", error);
    throw error;
  }
};

// Get all suppliers
export const getSuppliers = async (): Promise<string[]> => {
  try {
    const suppliersRef = collection(db, "suppliers");
    const querySnapshot = await getDocs(suppliersRef);
    const suppliers = querySnapshot.docs.map((doc) => doc.data().name);
    return suppliers.sort();
  } catch (error) {
    console.error("Error getting suppliers:", error);
    return [];
  }
};

// Get all supplier objects
export const getSupplierObjects = async (): Promise<Supplier[]> => {
  try {
    const suppliersRef = collection(db, "suppliers");
    const querySnapshot = await getDocs(suppliersRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting supplier objects:", error);
    return [];
  }
};

// Check if supplier exists
export const supplierExists = async (
  supplierName: string
): Promise<boolean> => {
  try {
    const suppliersRef = collection(db, "suppliers");
    const q = query(suppliersRef, where("name", "==", supplierName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking supplier:", error);
    return false;
  }
};

// Add a new supplier
export const addSupplier = async (supplierName: string): Promise<string> => {
  try {
    const trimmedSupplierName = supplierName.trim();

    // Check if supplier already exists
    const exists = await supplierExists(trimmedSupplierName);

    if (exists) {
      // Get existing supplier ID
      const suppliersRef = collection(db, "suppliers");
      const q = query(suppliersRef, where("name", "==", trimmedSupplierName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
    }

    // Add new supplier
    const suppliersRef = collection(db, "suppliers");
    const newSupplier = {
      name: trimmedSupplierName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(suppliersRef, newSupplier);
    return docRef.id;
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw error;
  }
};
