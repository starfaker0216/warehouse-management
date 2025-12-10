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
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export interface Phone {
  id: string;
  name: string;
  model: string;
  price: number;
  data: Array<{ color: string; quantity: number }>;
  totalQuantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to calculate status based on totalQuantity
const calculateStatus = (
  totalQuantity: number
): "in_stock" | "low_stock" | "out_of_stock" => {
  if (totalQuantity === 0) return "out_of_stock";
  if (totalQuantity < 10) return "low_stock";
  return "in_stock";
};

// Convert Firestore document to Phone object
const docToPhone = (doc: QueryDocumentSnapshot<DocumentData>): Phone => {
  const data = doc.data();
  const phoneData = data.data || [];
  const totalQuantity =
    data.totalQuantity !== undefined
      ? data.totalQuantity
      : phoneData.reduce(
          (sum: number, item: { color: string; quantity: number }) =>
            sum + (item.quantity || 0),
          0
        );

  return {
    id: doc.id,
    name: data.name || "",
    model: data.model || "",
    price: data.price || 0,
    data: phoneData,
    totalQuantity: totalQuantity,
    status: data.status || calculateStatus(totalQuantity),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
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
export const addPhone = async (
  phoneData: Omit<Phone, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const phonesRef = collection(db, "phones");
    const status = calculateStatus(phoneData.totalQuantity);
    const newPhone = {
      ...phoneData,
      status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
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
      updatedAt: Timestamp.now()
    };

    // Recalculate status if totalQuantity is being updated
    if (phoneData.totalQuantity !== undefined) {
      updateData.status = calculateStatus(phoneData.totalQuantity);
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
