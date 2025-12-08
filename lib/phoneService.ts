import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Phone {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  storage: string;
  price: number;
  quantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to calculate status based on quantity
const calculateStatus = (quantity: number): "in_stock" | "low_stock" | "out_of_stock" => {
  if (quantity === 0) return "out_of_stock";
  if (quantity < 10) return "low_stock";
  return "in_stock";
};

// Convert Firestore document to Phone object
const docToPhone = (doc: QueryDocumentSnapshot<DocumentData>): Phone => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "",
    brand: data.brand || "",
    model: data.model || "",
    color: data.color || "",
    storage: data.storage || "",
    price: data.price || 0,
    quantity: data.quantity || 0,
    status: data.status || calculateStatus(data.quantity || 0),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

// Get all phones
export const getPhones = async (): Promise<Phone[]> => {
  try {
    const phonesRef = collection(db, "phones");
    const q = query(phonesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToPhone);
  } catch (error) {
    console.error("Error getting phones:", error);
    throw error;
  }
};

// Add a new phone
export const addPhone = async (phoneData: Omit<Phone, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const phonesRef = collection(db, "phones");
    const status = calculateStatus(phoneData.quantity);
    const newPhone = {
      ...phoneData,
      status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(phonesRef, newPhone);
    return docRef.id;
  } catch (error) {
    console.error("Error adding phone:", error);
    throw error;
  }
};

// Update a phone
export const updatePhone = async (
  id: string,
  phoneData: Partial<Omit<Phone, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const phoneRef = doc(db, "phones", id);
    const updateData: any = {
      ...phoneData,
      updatedAt: Timestamp.now(),
    };
    
    // Recalculate status if quantity is being updated
    if (phoneData.quantity !== undefined) {
      updateData.status = calculateStatus(phoneData.quantity);
    }
    
    await updateDoc(phoneRef, updateData);
  } catch (error) {
    console.error("Error updating phone:", error);
    throw error;
  }
};

// Delete a phone
export const deletePhone = async (id: string): Promise<void> => {
  try {
    const phoneRef = doc(db, "phones", id);
    await deleteDoc(phoneRef);
  } catch (error) {
    console.error("Error deleting phone:", error);
    throw error;
  }
};

