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
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
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

// Helper function to generate search keywords from phone data
const generateSearchKeywords = (
  id: string,
  name: string,
  model: string
): string[] => {
  const text = `${id} ${name} ${model}`.toLowerCase();
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

// Get all phones with optional search and filter
export const getPhones = async (
  searchTerm?: string,
  filterStatus?: string
): Promise<Phone[]> => {
  try {
    const phonesRef = collection(db, "phones");
    const constraints: QueryConstraint[] = [];
    const hasSearch = searchTerm && searchTerm.trim();
    const hasStatusFilter = filterStatus && filterStatus !== "all";
    const hasFilter = hasSearch || hasStatusFilter;

    // Nếu có search, không dùng Firebase query với searchKeywords
    // vì documents cũ có thể chưa có field này
    // Thay vào đó, fetch tất cả rồi filter ở client
    if (!hasSearch) {
      // Chỉ dùng orderBy khi không có search để tránh cần composite index
      if (!hasStatusFilter) {
        constraints.push(orderBy("createdAt", "desc"));
      }
    }

    // Add status filter if provided
    if (hasStatusFilter) {
      constraints.push(where("status", "==", filterStatus));
    }

    const q = query(phonesRef, ...constraints);
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
        // Tạo searchable text từ id, name, model
        // Normalize: thay thế dấu gạch ngang và gạch dưới bằng space để dễ search
        const normalizedId = phone.id.toLowerCase().replace(/[-_]/g, " ");
        const normalizedName = phone.name.toLowerCase();
        const normalizedModel = phone.model.toLowerCase().replace(/[-_]/g, " ");

        const searchableText = `${normalizedId} ${normalizedName} ${normalizedModel}`;

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
    const searchKeywords = generateSearchKeywords(
      "", // id sẽ được tạo sau khi add
      phoneData.name,
      phoneData.model
    );

    const newPhone = {
      ...phoneData,
      status,
      searchKeywords,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(phonesRef, newPhone);

    // Update searchKeywords với id sau khi document được tạo
    const searchKeywordsWithId = generateSearchKeywords(
      docRef.id,
      phoneData.name,
      phoneData.model
    );
    await updateDoc(docRef, { searchKeywords: searchKeywordsWithId });

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
    const updateData: Record<string, unknown> = {
      ...phoneData,
      updatedAt: Timestamp.now()
    };

    // Recalculate status if totalQuantity is being updated
    if (phoneData.totalQuantity !== undefined) {
      updateData.status = calculateStatus(phoneData.totalQuantity);
    }

    // Update searchKeywords if name or model is being updated
    if (phoneData.name !== undefined || phoneData.model !== undefined) {
      // Cần fetch document hiện tại để lấy name và model
      const currentDoc = await getDoc(phoneRef);
      const currentData = currentDoc.data();
      const name = phoneData.name ?? currentData?.name ?? "";
      const model = phoneData.model ?? currentData?.model ?? "";
      updateData.searchKeywords = generateSearchKeywords(id, name, model);
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
