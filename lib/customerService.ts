import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export interface Customer {
  id: string;
  phone: string;
  name: string;
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
  name: string
): Promise<string> => {
  try {
    if (!phone || !phone.trim() || !name || !name.trim()) {
      throw new Error("Phone and name are required");
    }

    const customersRef = collection(db, "customers");
    const newCustomer = {
      phone: phone.trim(),
      name: name.trim(),
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
