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
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { getPhone, Phone, getPhones } from "./phoneService";

export interface PhoneDetail {
  id: string;
  phoneId: string; // liên kết với collection phones
  warehouseId: string; // liên kết với collection warehouse
  color: string; // màu sắc
  imei: string; // imei
  importPrice: number; // giá nhập
  salePrice: number; // giá bán
  status: string; // tình trạng máy
  updatedBy: {
    employeeId: string;
    employeeName: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  // Optional fields populated when joining with phones collection
  name?: string; // Phone name from phones collection
}

// Convert Firestore document to PhoneDetail object
const docToPhoneDetail = (
  doc: QueryDocumentSnapshot<DocumentData>
): PhoneDetail => {
  const data = doc.data();
  return {
    id: doc.id,
    phoneId: data.phoneId || "",
    warehouseId: data.warehouseId || "",
    color: data.color || "",
    imei: data.imei || "",
    importPrice: data.importPrice || 0,
    salePrice: data.salePrice || 0,
    status: data.status || "",
    updatedBy: data.updatedBy || {
      employeeId: "",
      employeeName: ""
    },
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  };
};

// Get all phone details
export const getPhoneDetails = async (): Promise<PhoneDetail[]> => {
  try {
    const phoneDetailsRef = collection(db, "phoneDetails");
    const querySnapshot = await getDocs(phoneDetailsRef);
    return querySnapshot.docs.map(docToPhoneDetail);
  } catch (error) {
    console.error("Error getting phone details:", error);
    throw error;
  }
};

// Get phone details by phoneId
export const getPhoneDetailsByPhoneId = async (
  phoneId: string
): Promise<PhoneDetail[]> => {
  try {
    const phoneDetailsRef = collection(db, "phoneDetails");
    const q = query(phoneDetailsRef, where("phoneId", "==", phoneId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToPhoneDetail);
  } catch (error) {
    console.error("Error getting phone details by phoneId:", error);
    throw error;
  }
};

// Get phone details by warehouseId
export const getPhoneDetailsByWarehouseId = async (
  warehouseId: string
): Promise<PhoneDetail[]> => {
  try {
    const phoneDetailsRef = collection(db, "phoneDetails");
    const q = query(phoneDetailsRef, where("warehouseId", "==", warehouseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToPhoneDetail);
  } catch (error) {
    console.error("Error getting phone details by warehouseId:", error);
    throw error;
  }
};

// Get a single phone detail by id
export const getPhoneDetail = async (
  id: string
): Promise<PhoneDetail | null> => {
  try {
    const phoneDetailRef = doc(db, "phoneDetails", id);
    const docSnapshot = await getDoc(phoneDetailRef);
    if (docSnapshot.exists()) {
      return docToPhoneDetail(
        docSnapshot as QueryDocumentSnapshot<DocumentData>
      );
    }
    return null;
  } catch (error) {
    console.error("Error getting phone detail:", error);
    throw error;
  }
};

// Add a new phone detail
export const addPhoneDetail = async (
  phoneDetailData: Omit<PhoneDetail, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const phoneDetailsRef = collection(db, "phoneDetails");
    const newPhoneDetail = {
      ...phoneDetailData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(phoneDetailsRef, newPhoneDetail);
    return docRef.id;
  } catch (error) {
    console.error("Error adding phone detail:", error);
    throw error;
  }
};

// Add multiple phone details
export const addPhoneDetails = async (
  phoneDetailsData: Array<Omit<PhoneDetail, "id" | "createdAt" | "updatedAt">>
): Promise<string[]> => {
  try {
    const phoneDetailsRef = collection(db, "phoneDetails");
    const now = Timestamp.now();
    const promises = phoneDetailsData.map((data) => {
      const newPhoneDetail = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      return addDoc(phoneDetailsRef, newPhoneDetail);
    });
    const docRefs = await Promise.all(promises);
    return docRefs.map((ref) => ref.id);
  } catch (error) {
    console.error("Error adding phone details:", error);
    throw error;
  }
};

// Update a phone detail
export const updatePhoneDetail = async (
  id: string,
  phoneDetailData: Partial<Omit<PhoneDetail, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const phoneDetailRef = doc(db, "phoneDetails", id);
    const updateData: Record<string, unknown> = {
      ...phoneDetailData,
      updatedAt: Timestamp.now()
    };
    await updateDoc(phoneDetailRef, updateData);
  } catch (error) {
    console.error("Error updating phone detail:", error);
    throw error;
  }
};

// Delete a phone detail
export const deletePhoneDetail = async (id: string): Promise<void> => {
  try {
    const phoneDetailRef = doc(db, "phoneDetails", id);
    await deleteDoc(phoneDetailRef);
  } catch (error) {
    console.error("Error deleting phone detail:", error);
    throw error;
  }
};

// Helper: Extract unique phoneIds from phoneDetails
const getUniquePhoneIds = (phoneDetails: PhoneDetail[]): string[] => {
  return Array.from(
    new Set(phoneDetails.map((detail) => detail.phoneId).filter(Boolean))
  );
};

// Helper: Create a map from phoneId to Phone document for quick lookup
const createPhoneMap = async (
  phoneIds: string[]
): Promise<Map<string, Phone | null>> => {
  const phonePromises = phoneIds.map((phoneId) => getPhone(phoneId));
  const phoneDocs = await Promise.all(phonePromises);

  const phoneMap = new Map<string, Phone | null>();
  phoneIds.forEach((phoneId, index) => {
    phoneMap.set(phoneId, phoneDocs[index]);
  });

  return phoneMap;
};

// Helper: Enrich phoneDetails with phone names from phones collection
const enrichPhoneDetailsWithNames = (
  phoneDetails: PhoneDetail[],
  phoneMap: Map<string, Phone | null>
): PhoneDetail[] => {
  return phoneDetails
    .filter((detail) => detail.phoneId) // Only include details with phoneId
    .map((detail) => {
      const phoneDoc = phoneMap.get(detail.phoneId) || null;
      const phoneName = phoneDoc?.name || "";

      return {
        ...detail,
        name: phoneName,
        updatedBy: phoneDoc?.updatedBy || detail.updatedBy
      };
    });
};

// Helper: Search phones by searchTerm and return matching phoneIds
const searchPhonesAndGetIds = async (
  warehouseId: string,
  searchTerm: string
): Promise<string[]> => {
  const phones = await getPhones(warehouseId, searchTerm);
  return phones.map((phone) => phone.id);
};

// Helper: Filter phoneDetails by phoneIds
const filterPhoneDetailsByPhoneIds = (
  phoneDetails: PhoneDetail[],
  phoneIds: string[]
): PhoneDetail[] => {
  const phoneIdSet = new Set(phoneIds);
  return phoneDetails.filter((detail) => phoneIdSet.has(detail.phoneId));
};

// Helper: Sort phoneDetails by createdAt descending
const sortByCreatedAt = (phoneDetails: PhoneDetail[]): PhoneDetail[] => {
  return [...phoneDetails].sort((a, b) => {
    const aTime = a.createdAt?.getTime() || 0;
    const bTime = b.createdAt?.getTime() || 0;
    return bTime - aTime; // Descending order
  });
};

// Get list of phoneDetails with phone name populated - each phoneDetail is a separate row
export const getListPhoneDetails = async (
  warehouseId: string,
  searchTerm?: string
): Promise<PhoneDetail[]> => {
  try {
    // Step 1: If searchTerm provided, search phones first and get matching phoneIds
    let matchingPhoneIds: string[] | null = null;
    if (searchTerm && searchTerm.trim()) {
      matchingPhoneIds = await searchPhonesAndGetIds(warehouseId, searchTerm);
      // If no phones match, return empty array
      if (matchingPhoneIds.length === 0) {
        return [];
      }
    }

    // Step 2: Get phoneDetails for this warehouse
    let phoneDetails = await getPhoneDetailsByWarehouseId(warehouseId);

    // Step 3: Filter phoneDetails by matching phoneIds if search was performed
    if (matchingPhoneIds) {
      phoneDetails = filterPhoneDetailsByPhoneIds(
        phoneDetails,
        matchingPhoneIds
      );
    }

    // Step 4: Get unique phoneIds and fetch phone documents
    const uniquePhoneIds = getUniquePhoneIds(phoneDetails);
    const phoneMap = await createPhoneMap(uniquePhoneIds);

    // Step 5: Enrich phoneDetails with phone names
    let enrichedPhoneDetails = enrichPhoneDetailsWithNames(
      phoneDetails,
      phoneMap
    );

    // Step 6: Sort by createdAt descending
    enrichedPhoneDetails = sortByCreatedAt(enrichedPhoneDetails);

    return enrichedPhoneDetails;
  } catch (error) {
    console.error("Error getting list phone details:", error);
    throw error;
  }
};
