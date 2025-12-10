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

export interface ExportRecord {
  id: string;
  customerPhone: string; // số điện thoại khách hàng
  customerName: string; // tên khách hàng
  phoneName: string; // tên máy (tự động điền, không thể đổi)
  color: string; // màu sắc (tự động điền, không thể đổi)
  imei: string; // imei
  salePrice: number; // giá bán
  gift: string; // tặng kèm
  note: string; // ghi chú
  phoneId: string; // id máy để reference
  installmentPayment: number; // trả góp
  bankTransfer: number; // chuyển khoản
  cashPayment: number; // tiền mặt
  otherPayment: string; // khác
  createdAt?: Date;
  updatedAt?: Date;
}

// Convert Firestore document to ExportRecord object
const docToExportRecord = (
  doc: QueryDocumentSnapshot<DocumentData>
): ExportRecord => {
  const data = doc.data();
  return {
    id: doc.id,
    customerPhone: data.customerPhone || "",
    customerName: data.customerName || "",
    phoneName: data.phoneName || "",
    color: data.color || "",
    imei: data.imei || "",
    salePrice: data.salePrice || 0,
    gift: data.gift || "",
    note: data.note || "",
    phoneId: data.phoneId || "",
    installmentPayment: data.installmentPayment || 0,
    bankTransfer: data.bankTransfer || 0,
    cashPayment: data.cashPayment || 0,
    otherPayment: data.otherPayment || "",
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get all export records
export const getExportRecords = async (): Promise<ExportRecord[]> => {
  try {
    const exportsRef = collection(db, "exports");
    const q = query(exportsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToExportRecord);
  } catch (error) {
    console.error("Error getting export records:", error);
    throw error;
  }
};

// Add a new export record
export const addExportRecord = async (
  exportData: Omit<ExportRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const exportsRef = collection(db, "exports");
    const newExport = {
      ...exportData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(exportsRef, newExport);
    return docRef.id;
  } catch (error) {
    console.error("Error adding export record:", error);
    throw error;
  }
};

// Update an export record
export const updateExportRecord = async (
  id: string,
  exportData: Partial<Omit<ExportRecord, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const exportRef = doc(db, "exports", id);
    const updateData: any = {
      ...exportData,
      updatedAt: Timestamp.now()
    };

    await updateDoc(exportRef, updateData);
  } catch (error) {
    console.error("Error updating export record:", error);
    throw error;
  }
};

// Delete an export record
export const deleteExportRecord = async (id: string): Promise<void> => {
  try {
    const exportRef = doc(db, "exports", id);
    await deleteDoc(exportRef);
  } catch (error) {
    console.error("Error deleting export record:", error);
    throw error;
  }
};
