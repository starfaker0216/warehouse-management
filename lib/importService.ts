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

export interface ImportRecord {
  id: string;
  phoneId: string; // id máy
  importDate: Date; // ngày nhập
  phoneType: string; // loại máy
  quantity: number; // số lượng
  imei: string; // imei
  color: string; // màu sắc
  importPrice: number; // giá nhập
  supplier: string; // nhà cung cấp
  imeiType: string; // loại imei
  note: string; // ghi chú
  employeeId: string; // id người nhập dữ liệu
  employeeName: string; // tên người nhập dữ liệu
  createdAt?: Date;
  updatedAt?: Date;
}

// Convert Firestore document to ImportRecord object
const docToImportRecord = (
  doc: QueryDocumentSnapshot<DocumentData>
): ImportRecord => {
  const data = doc.data();
  return {
    id: doc.id,
    phoneId: data.phoneId || "",
    importDate: data.importDate?.toDate() || new Date(),
    phoneType: data.phoneType || "",
    quantity: data.quantity || 0,
    imei: data.imei || "",
    color: data.color || "",
    importPrice: data.importPrice || 0,
    supplier: data.supplier || "",
    imeiType: data.imeiType || "",
    note: data.note || "",
    employeeId: data.employeeId || "",
    employeeName: data.employeeName || "",
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get all import records
export const getImportRecords = async (): Promise<ImportRecord[]> => {
  try {
    const importsRef = collection(db, "imports");
    const q = query(importsRef, orderBy("importDate", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToImportRecord);
  } catch (error) {
    console.error("Error getting import records:", error);
    throw error;
  }
};

// Add a new import record
export const addImportRecord = async (
  importData: Omit<ImportRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const importsRef = collection(db, "imports");
    const newImport = {
      ...importData,
      importDate: Timestamp.fromDate(importData.importDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(importsRef, newImport);
    return docRef.id;
  } catch (error) {
    console.error("Error adding import record:", error);
    throw error;
  }
};

// Update an import record
export const updateImportRecord = async (
  id: string,
  importData: Partial<Omit<ImportRecord, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const importRef = doc(db, "imports", id);
    const updateData: any = {
      ...importData,
      updatedAt: Timestamp.now()
    };

    if (importData.importDate) {
      updateData.importDate = Timestamp.fromDate(importData.importDate);
    }

    await updateDoc(importRef, updateData);
  } catch (error) {
    console.error("Error updating import record:", error);
    throw error;
  }
};

// Delete an import record
export const deleteImportRecord = async (id: string): Promise<void> => {
  try {
    const importRef = doc(db, "imports", id);
    await deleteDoc(importRef);
  } catch (error) {
    console.error("Error deleting import record:", error);
    throw error;
  }
};
