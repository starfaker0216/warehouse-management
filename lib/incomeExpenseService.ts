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

export type IncomeExpenseType = "income" | "expense"; // "Thu" | "Chi"

export interface IncomeExpenseRecord {
  id: string;
  type: IncomeExpenseType; // "income" (Thu) hoặc "expense" (Chi)
  category: string; // Loại Thu / Loại Chi
  amount: number; // Tiền thu / Tiền chi
  note: string; // Ghi chú
  employeeId: string; // id người nhập dữ liệu
  employeeName: string; // tên người nhập dữ liệu
  warehouseId?: string; // id kho
  createdAt?: Date;
  updatedAt?: Date;
}

// Convert Firestore document to IncomeExpenseRecord object
const docToIncomeExpenseRecord = (
  doc: QueryDocumentSnapshot<DocumentData>
): IncomeExpenseRecord => {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type || "income",
    category: data.category || "",
    amount: data.amount || 0,
    note: data.note || "",
    employeeId: data.employeeId || "",
    employeeName: data.employeeName || "",
    warehouseId: data.warehouseId || undefined,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get all income/expense records
export const getIncomeExpenseRecords = async (): Promise<
  IncomeExpenseRecord[]
> => {
  try {
    const recordsRef = collection(db, "incomeExpenses");
    const q = query(recordsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToIncomeExpenseRecord);
  } catch (error) {
    console.error("Error getting income/expense records:", error);
    throw error;
  }
};

// Add a new income/expense record
export const addIncomeExpenseRecord = async (
  recordData: Omit<
    IncomeExpenseRecord,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<string> => {
  try {
    const recordsRef = collection(db, "incomeExpenses");
    const newRecord = {
      ...recordData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(recordsRef, newRecord);
    return docRef.id;
  } catch (error) {
    console.error("Error adding income/expense record:", error);
    throw error;
  }
};

// Update an income/expense record
export const updateIncomeExpenseRecord = async (
  id: string,
  recordData: Partial<
    Omit<IncomeExpenseRecord, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> => {
  try {
    const recordRef = doc(db, "incomeExpenses", id);
    const updateData: Record<string, unknown> = {
      ...recordData,
      updatedAt: Timestamp.now()
    };

    await updateDoc(recordRef, updateData);
  } catch (error) {
    console.error("Error updating income/expense record:", error);
    throw error;
  }
};

// Delete an income/expense record
export const deleteIncomeExpenseRecord = async (
  id: string
): Promise<void> => {
  try {
    const recordRef = doc(db, "incomeExpenses", id);
    await deleteDoc(recordRef);
  } catch (error) {
    console.error("Error deleting income/expense record:", error);
    throw error;
  }
};
