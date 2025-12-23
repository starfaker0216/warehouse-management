import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export interface Phone {
  id: string;
  name: string;
  updatedBy?: {
    employeeId: string;
    employeeName: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

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
  return {
    id: doc.id,
    name: data.name || "",
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

// Get all phones with optional search
export const getPhones = async (searchTerm?: string): Promise<Phone[]> => {
  try {
    const phonesRef = collection(db, "phones");
    const hasSearch = searchTerm && searchTerm.trim();

    const q = query(phonesRef);
    const querySnapshot = await getDocs(q);
    let phones = querySnapshot.docs.map(docToPhone);

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

    // Sort theo createdAt
    phones.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime; // desc
    });

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

    // Generate search keywords
    const searchKeywords = generateSearchKeywords(phoneData.name);

    const newPhone = {
      ...phoneData,
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
