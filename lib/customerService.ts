import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export interface Customer {
  id: string;
  phone: string;
  name: string;
  birthday?: string; // DD / MM / YYYY format
  address?: string;
  debt?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Convert Firestore document to Customer object
const docToCustomer = (doc: QueryDocumentSnapshot<DocumentData>): Customer => {
  const data = doc.data();
  return {
    id: doc.id,
    phone: data.phone || "",
    name: data.name || "",
    birthday: data.birthday || undefined,
    address: data.address || undefined,
    debt: data.debt || undefined,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get customer by phone number
export const getCustomerByPhone = async (
  phone: string
): Promise<Customer | null> => {
  try {
    if (!phone || !phone.trim()) {
      return null;
    }

    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("phone", "==", phone.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return docToCustomer(querySnapshot.docs[0]);
  } catch (error) {
    console.error("Error getting customer by phone:", error);
    throw error;
  }
};

// Add a new customer
export const addCustomer = async (
  phone: string,
  name: string,
  birthday?: string,
  address?: string,
  debt?: number
): Promise<string> => {
  try {
    if (!phone || !phone.trim() || !name || !name.trim()) {
      throw new Error("Phone and name are required");
    }

    const customersRef = collection(db, "customers");
    const newCustomer = {
      phone: phone.trim(),
      name: name.trim(),
      ...(birthday && { birthday: birthday.trim() }),
      ...(address && { address: address.trim() }),
      ...(debt !== undefined && debt !== null && { debt }),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(customersRef, newCustomer);
    return docRef.id;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

// Update an existing customer
export const updateCustomer = async (
  customerId: string,
  name: string,
  birthday?: string,
  address?: string,
  debt?: number
): Promise<void> => {
  try {
    if (!customerId || !name || !name.trim()) {
      throw new Error("Customer ID and name are required");
    }

    const customerRef = doc(db, "customers", customerId);
    const updateData: Record<string, unknown> = {
      name: name.trim(),
      updatedAt: Timestamp.now()
    };

    if (birthday !== undefined) {
      updateData.birthday = birthday.trim() || null;
    }
    if (address !== undefined) {
      updateData.address = address.trim() || null;
    }
    if (debt !== undefined && debt !== null) {
      updateData.debt = debt;
    }

    await updateDoc(customerRef, updateData);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};
