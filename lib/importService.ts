import {
  collection,
  doc,
  getDocs,
  getDoc,
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
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export interface ImportRecord {
  id: string;
  phoneId: string; // id máy
  importDate: Date; // ngày nhập
  phoneType: string; // loại máy
  quantity: number; // số lượng
  phoneDetailIds: string[]; // danh sách các id của phoneDetails
  supplier: string; // nhà cung cấp
  note: string; // ghi chú
  employeeId: string; // id người nhập dữ liệu
  employeeName: string; // tên người nhập dữ liệu
  warehouseId?: string; // id kho
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
    quantity: data.quantity || data.phoneDetailIds?.length || 0,
    phoneDetailIds: data.phoneDetailIds || [],
    supplier: data.supplier || "",
    note: data.note || "",
    employeeId: data.employeeId || "",
    employeeName: data.employeeName || "",
    warehouseId: data.warehouseId || undefined,
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

// Get count of import records with filters
export const getImportRecordsCount = async (filters: {
  warehouseId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}): Promise<number> => {
  try {
    const importsRef = collection(db, "imports");
    let q = query(importsRef, orderBy("importDate", "desc"));

    // Apply warehouse filter
    if (filters.warehouseId) {
      q = query(q, where("warehouseId", "==", filters.warehouseId));
    }

    // Apply date filters
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      q = query(q, where("importDate", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      q = query(q, where("importDate", "<=", endTimestamp));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error("Error getting import records count:", error);
    throw error;
  }
};

// Get import records with limit (for merging with exports)
export const getImportRecordsWithLimit = async (
  filters: {
    warehouseId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  limitCount: number
): Promise<ImportRecord[]> => {
  try {
    const importsRef = collection(db, "imports");
    let q = query(importsRef, orderBy("importDate", "desc"));

    // Apply warehouse filter
    if (filters.warehouseId) {
      q = query(q, where("warehouseId", "==", filters.warehouseId));
    }

    // Apply date filters
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      q = query(q, where("importDate", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      q = query(q, where("importDate", "<=", endTimestamp));
    }

    // Apply limit
    q = query(q, limit(limitCount));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToImportRecord);
  } catch (error) {
    console.error("Error getting import records with limit:", error);
    throw error;
  }
};

// Get import records with filters and pagination
export const getImportRecordsPaginated = async (
  filters: {
    warehouseId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  },
  page: number = 1,
  itemsPerPage: number = 20
): Promise<{
  records: ImportRecord[];
  totalCount: number;
  hasMore: boolean;
}> => {
  try {
    const importsRef = collection(db, "imports");
    let q = query(importsRef, orderBy("importDate", "desc"));

    // Apply warehouse filter
    if (filters.warehouseId) {
      q = query(q, where("warehouseId", "==", filters.warehouseId));
    }

    // Apply date filters
    if (filters.startDate) {
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      q = query(q, where("importDate", ">=", startTimestamp));
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      q = query(q, where("importDate", "<=", endTimestamp));
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
    const records = querySnapshot.docs.map(docToImportRecord);
    const hasMore = startIndex + records.length < totalCount;

    return { records, totalCount, hasMore };
  } catch (error) {
    console.error("Error getting paginated import records:", error);
    throw error;
  }
};

// Get a single import record by id
export const getImportRecordById = async (
  id: string
): Promise<ImportRecord | null> => {
  try {
    const importRef = doc(db, "imports", id);
    const docSnapshot = await getDoc(importRef);
    if (docSnapshot.exists()) {
      return docToImportRecord(
        docSnapshot as QueryDocumentSnapshot<DocumentData>
      );
    }
    return null;
  } catch (error) {
    console.error("Error getting import record by id:", error);
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
    const updateData: Record<string, unknown> = {
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
