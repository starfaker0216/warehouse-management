import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";

export interface Phone {
  id: string;
  name: string;
  data: Array<{ color: string; quantity: number; price: number }>;
  totalQuantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  condition?: string;
  warehouseId?: string; // id kho
  updatedBy?: {
    employeeId: string;
    employeeName: string;
  };
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

// Helper function to generate search keywords from phone data
const generateSearchKeywords = (name: string): string[] => {
  const text = `${name}`.toLowerCase();
  // Tách thành các từ và loại bỏ các ký tự đặc biệt
  const words = text
    .split(/\s+/)
    .flatMap((word) => {
      // Tách các từ có dấu gạch ngang hoặc dấu gạch dưới
      return word.split(/[-_]/);
    })
    .filter((word) => word.length > 0);

  // Thêm cả chuỗi gốc để hỗ trợ tìm kiếm chính xác
  const keywords = new Set([...words, text]);
  return Array.from(keywords);
};

// Convert Firestore document to Phone object
const docToPhone = (doc: QueryDocumentSnapshot<DocumentData>): Phone => {
  const data = doc.data();
  const phoneData =
    (data.data as Array<{
      color?: string;
      quantity?: number;
      price?: number;
    }>) || [];

  // Handle backward compatibility: add price field if missing (use 0 as default)
  const phoneDataWithPrice = phoneData.map((item) => ({
    color: item.color || "",
    quantity: item.quantity || 0,
    price: item.price !== undefined ? item.price : 0
  }));

  const totalQuantity =
    data.totalQuantity !== undefined
      ? data.totalQuantity
      : phoneDataWithPrice.reduce(
          (
            sum: number,
            item: { color: string; quantity: number; price: number }
          ) => sum + (item.quantity || 0),
          0
        );

  return {
    id: doc.id,
    name: data.name || "",
    data: phoneDataWithPrice,
    totalQuantity: totalQuantity,
    status: data.status || calculateStatus(totalQuantity),
    condition: data.condition || undefined,
    warehouseId: data.warehouseId || undefined,
    updatedBy: data.updatedBy || undefined,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get a single phone by id
export const getPhone = async (id: string): Promise<Phone | null> => {
  try {
    const phoneRef = doc(db, "phones", id);
    const docSnapshot = await getDoc(phoneRef);
    if (docSnapshot.exists()) {
      return docToPhone(docSnapshot as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  } catch (error) {
    console.error("Error getting phone:", error);
    throw error;
  }
};

// Get all phones with optional search and filter
export const getPhones = async (
  warehouseId: string,
  searchTerm?: string,
  filterStatus?: string
): Promise<Phone[]> => {
  try {
    const phonesRef = collection(db, "phones");
    const constraints: QueryConstraint[] = [];
    const hasSearch = searchTerm && searchTerm.trim();
    const hasStatusFilter = filterStatus && filterStatus !== "all";
    const hasFilter = hasSearch || hasStatusFilter;

    // Add warehouseId filter (required)
    constraints.push(where("warehouseId", "==", warehouseId));

    // Nếu có search, không dùng Firebase query với searchKeywords
    // vì documents cũ có thể chưa có field này
    // Thay vào đó, fetch tất cả rồi filter ở client
    if (!hasSearch) {
      // Chỉ dùng orderBy khi không có search và không có status filter để tránh cần composite index
      if (!hasStatusFilter) {
        // Nếu có warehouseId filter, cần composite index hoặc sort ở client
        // Tạm thời sort ở client để tránh cần composite index
      }
    }

    // Add status filter if provided
    if (hasStatusFilter) {
      constraints.push(where("status", "==", filterStatus));
    }

    const q = query(phonesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    let phones = querySnapshot.docs.map(docToPhone);

    // Filter by warehouseId ở client để đảm bảo hoạt động với documents cũ không có warehouseId
    phones = phones.filter((phone) => phone.warehouseId === warehouseId);

    // Filter search ở client để đảm bảo hoạt động với cả documents cũ và mới
    if (hasSearch) {
      const searchWords = searchTerm!
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      phones = phones.filter((phone) => {
        // Tạo searchable text từ id, name
        // Normalize: thay thế dấu gạch ngang và gạch dưới bằng space để dễ search
        const normalizedId = phone.id.toLowerCase().replace(/[-_]/g, " ");
        const normalizedName = phone.name.toLowerCase();

        const searchableText = `${normalizedId} ${normalizedName}`;

        // Kiểm tra tất cả các từ đều có trong searchableText
        // Sử dụng word boundary hoặc space để match chính xác hơn
        return searchWords.every((word) => {
          // Tìm word trong text, có thể là một từ riêng hoặc một phần của từ
          // Ví dụ: "17" có thể match "17" trong "iphone 17" hoặc "ip-17-256lock"
          const regex = new RegExp(
            word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
          );
          return regex.test(searchableText);
        });
      });
    }

    // Filter status ở client nếu có search (vì đã fetch tất cả)
    if (hasSearch && hasStatusFilter) {
      phones = phones.filter((phone) => phone.status === filterStatus);
    }

    // Sort ở client nếu có filter để đảm bảo luôn sort theo createdAt
    if (hasFilter) {
      phones.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // desc
      });
    }

    return phones;
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

    // Generate search keywords
    const searchKeywords = generateSearchKeywords(phoneData.name);

    const newPhone = {
      ...phoneData,
      status,
      searchKeywords,
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
  phoneData: Partial<Omit<Phone, "id" | "createdAt" | "updatedAt">>,
  employeeId?: string,
  employeeName?: string
): Promise<void> => {
  try {
    const phoneRef = doc(db, "phones", id);
    const updateData: Record<string, unknown> = {
      ...phoneData,
      updatedAt: Timestamp.now()
    };

    // Add employee info if provided
    if (employeeId && employeeName) {
      updateData.updatedBy = {
        employeeId,
        employeeName
      };
    }

    // Recalculate status if totalQuantity is being updated
    if (phoneData.totalQuantity !== undefined) {
      updateData.status = calculateStatus(phoneData.totalQuantity);
    }

    // Update searchKeywords if name is being updated
    if (phoneData.name !== undefined) {
      // Cần fetch document hiện tại để lấy name
      const currentDoc = await getDoc(phoneRef);
      const currentData = currentDoc.data();
      const name = phoneData.name ?? currentData?.name ?? "";
      updateData.searchKeywords = generateSearchKeywords(name);
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
