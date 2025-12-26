import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  getDoc
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
  phoneDetailId: string; // id phoneDetail để reference
  installmentPayment: number; // trả góp
  bankTransfer: number; // chuyển khoản
  cashPayment: number; // tiền mặt
  otherPayment: string; // khác
  employeeId: string; // id người nhập dữ liệu
  employeeName: string; // tên người nhập dữ liệu
  warehouseId?: string; // id kho
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
    phoneDetailId: data.phoneDetailId || "",
    installmentPayment: data.installmentPayment || 0,
    bankTransfer: data.bankTransfer || 0,
    cashPayment: data.cashPayment || 0,
    otherPayment: data.otherPayment || "",
    employeeId: data.employeeId || "",
    employeeName: data.employeeName || "",
    warehouseId: data.warehouseId || undefined,
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

// Get count of export records with filters
export const getExportRecordsCount = async (filters: {
  warehouseId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}): Promise<number> => {
  try {
    const exportsRef = collection(db, "exports");
    let q = query(exportsRef, orderBy("createdAt", "desc"));

    // Apply warehouse filter
    if (filters.warehouseId) {
      q = query(q, where("warehouseId", "==", filters.warehouseId));
    }

    // Apply date filters
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      q = query(q, where("createdAt", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      q = query(q, where("createdAt", "<=", endTimestamp));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error("Error getting export records count:", error);
    throw error;
  }
};

// Get export records with limit (for merging with imports)
export const getExportRecordsWithLimit = async (
  filters: {
    warehouseId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  limitCount: number
): Promise<ExportRecord[]> => {
  try {
    const exportsRef = collection(db, "exports");
    let q = query(exportsRef, orderBy("createdAt", "desc"));

    // Apply warehouse filter
    if (filters.warehouseId) {
      q = query(q, where("warehouseId", "==", filters.warehouseId));
    }

    // Apply date filters
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      q = query(q, where("createdAt", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      q = query(q, where("createdAt", "<=", endTimestamp));
    }

    // Apply limit
    q = query(q, limit(limitCount));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToExportRecord);
  } catch (error) {
    console.error("Error getting export records with limit:", error);
    throw error;
  }
};

// Get export records with filters and pagination
export const getExportRecordsPaginated = async (
  filters: {
    warehouseId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  page: number = 1,
  itemsPerPage: number = 20
): Promise<{
  records: ExportRecord[];
  totalCount: number;
  hasMore: boolean;
}> => {
  try {
    const exportsRef = collection(db, "exports");
    let q = query(exportsRef, orderBy("createdAt", "desc"));

    // Apply warehouse filter
    if (filters.warehouseId) {
      q = query(q, where("warehouseId", "==", filters.warehouseId));
    }

    // Apply date filters
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      q = query(q, where("createdAt", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      q = query(q, where("createdAt", "<=", endTimestamp));
    }

    // Get total count (first query without limit)
    const countSnapshot = await getDocs(q);
    const totalCount = countSnapshot.docs.length;

    // Apply pagination
    const startIndex = (page - 1) * itemsPerPage;
    if (startIndex > 0 && countSnapshot.docs.length > startIndex) {
      const startAfterDoc = countSnapshot.docs[startIndex - 1];
      q = query(q, startAfter(startAfterDoc), limit(itemsPerPage));
    } else {
      q = query(q, limit(itemsPerPage));
    }

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(docToExportRecord);
    const hasMore = startIndex + records.length < totalCount;

    return { records, totalCount, hasMore };
  } catch (error) {
    console.error("Error getting paginated export records:", error);
    throw error;
  }
};

// Get a single export record by id
export const getExportRecordById = async (
  id: string
): Promise<ExportRecord | null> => {
  try {
    const exportRef = doc(db, "exports", id);
    const docSnapshot = await getDoc(exportRef);
    if (docSnapshot.exists()) {
      return docToExportRecord(
        docSnapshot as QueryDocumentSnapshot<DocumentData>
      );
    }
    return null;
  } catch (error) {
    console.error("Error getting export record by id:", error);
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
    const updateData: Record<string, unknown> = {
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
