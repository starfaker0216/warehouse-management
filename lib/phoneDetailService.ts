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
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";
import { getPhone, Phone, getPhones } from "./phoneService";
import { PhoneExported } from "./phoneExportedService";

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
  importId?: string; // id của import record khi được nhập
  importDate?: Date; // ngày nhập hàng
  // Optional fields populated when joining with phones collection
  name?: string; // Phone name from phones collection
  isExported?: boolean; // Flag to indicate if this item is from phoneExporteds collection
  exportRecordId?: string; // ID of export record if exported
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
    updatedAt: data.updatedAt?.toDate(),
    importId: data.importId || undefined,
    importDate: data.importDate?.toDate()
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
      const phoneDetail = docToPhoneDetail(
        docSnapshot as QueryDocumentSnapshot<DocumentData>
      );

      // Enrich with phone name from phones collection
      if (phoneDetail.phoneId) {
        const phone = await getPhone(phoneDetail.phoneId);
        if (phone) {
          return {
            ...phoneDetail,
            name: phone.name || ""
          };
        }
      }

      return phoneDetail;
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
    const newPhoneDetail: Record<string, unknown> = {
      ...phoneDetailData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    // Convert importDate to Timestamp if it exists
    if (phoneDetailData.importDate) {
      newPhoneDetail.importDate = Timestamp.fromDate(
        phoneDetailData.importDate
      );
    }
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
      const newPhoneDetail: Record<string, unknown> = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      // Convert importDate to Timestamp if it exists
      if (data.importDate) {
        newPhoneDetail.importDate = Timestamp.fromDate(data.importDate);
      }
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
    // Convert importDate to Timestamp if it exists
    if (phoneDetailData.importDate) {
      updateData.importDate = Timestamp.fromDate(phoneDetailData.importDate);
    }
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
const searchPhonesAndGetIds = async (searchTerm: string): Promise<string[]> => {
  const phones = await getPhones(searchTerm);
  return phones.map((phone) => phone.id);
};

// Helper: Get count of phoneDetails for a specific phoneId and warehouseId
const getPhoneDetailsCountByPhoneId = async (
  warehouseId: string,
  phoneId: string
): Promise<number> => {
  const phoneDetailsRef = collection(db, "phoneDetails");
  const q = query(
    phoneDetailsRef,
    where("warehouseId", "==", warehouseId),
    where("phoneId", "==", phoneId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.length;
};

// Helper: Get paginated phoneDetails for a specific phoneId and warehouseId
const getPhoneDetailsByPhoneIdPaginated = async (
  warehouseId: string,
  phoneId: string,
  page: number = 1,
  itemsPerPage: number = 20
): Promise<PhoneDetail[]> => {
  const phoneDetailsRef = collection(db, "phoneDetails");
  const baseQuery = query(
    phoneDetailsRef,
    where("warehouseId", "==", warehouseId),
    where("phoneId", "==", phoneId)
  );

  // Get total count
  const countSnapshot = await getDocs(baseQuery);
  const totalCount = countSnapshot.docs.length;

  if (totalCount === 0) {
    return [];
  }

  // Apply pagination
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedQuery: QueryConstraint[] = [
    where("warehouseId", "==", warehouseId),
    where("phoneId", "==", phoneId),
    ...(startIndex > 0 && countSnapshot.docs.length > startIndex
      ? [startAfter(countSnapshot.docs[startIndex - 1])]
      : []),
    limit(itemsPerPage)
  ];

  const querySnapshot = await getDocs(
    query(phoneDetailsRef, ...paginatedQuery)
  );
  return querySnapshot.docs.map(docToPhoneDetail);
};

// Helper: Query phoneDetails by IMEI (exact match or starts with)
const getPhoneDetailsByImei = async (
  warehouseId: string,
  searchTerm: string
): Promise<PhoneDetail[]> => {
  const phoneDetailsRef = collection(db, "phoneDetails");
  const trimmedSearchTerm = searchTerm.trim();

  // Try exact match first
  const exactQuery = query(
    phoneDetailsRef,
    where("warehouseId", "==", warehouseId),
    where("imei", "==", trimmedSearchTerm)
  );

  try {
    const exactSnapshot = await getDocs(exactQuery);
    if (exactSnapshot.docs.length > 0) {
      return exactSnapshot.docs.map(docToPhoneDetail);
    }
  } catch (error) {
    // If exact match fails (e.g., no index), try starts-with
    console.log("Exact IMEI match query failed, trying starts-with:", error);
  }

  return [];
};

// Helper: Process and enrich phoneDetails with phone names
const processAndEnrichPhoneDetails = async (
  phoneDetails: PhoneDetail[]
): Promise<PhoneDetail[]> => {
  const uniquePhoneIds = getUniquePhoneIds(phoneDetails);
  const phoneMap = await createPhoneMap(uniquePhoneIds);
  return enrichPhoneDetailsWithNames(phoneDetails, phoneMap);
};

// Helper: Handle IMEI search - returns result immediately if found
const handleImeiSearch = async (
  warehouseId: string,
  searchTerm: string
): Promise<{
  phoneDetails: PhoneDetail[];
  totalCount: number;
} | null> => {
  const imeiMatches = await getPhoneDetailsByImei(warehouseId, searchTerm);

  if (imeiMatches.length === 0) {
    return null;
  }

  const enrichedPhoneDetails = await processAndEnrichPhoneDetails(imeiMatches);

  return {
    phoneDetails: enrichedPhoneDetails,
    totalCount: enrichedPhoneDetails.length
  };
};

// Helper: Calculate which phoneIds and pages to query for pagination
const calculatePhoneIdQueries = (
  phoneIdCounts: Array<{ phoneId: string; count: number }>,
  page: number,
  itemsPerPage: number
): Array<{
  phoneId: string;
  page: number;
  itemsPerPage: number; // Always full page size for query
  skipItems: number; // Items to skip from start of page
  takeItems: number; // Items to take after skipping
}> => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const queriesToExecute: Array<{
    phoneId: string;
    page: number;
    itemsPerPage: number; // Always full page size for query
    skipItems: number; // Items to skip from start of page
    takeItems: number; // Items to take after skipping
  }> = [];

  let currentIndex = 0;

  for (const { phoneId, count } of phoneIdCounts) {
    if (currentIndex >= endIndex) {
      break;
    }

    const phoneStartIndex = currentIndex;
    const phoneEndIndex = currentIndex + count;

    // Check if current page overlaps with this phoneId's range
    if (phoneEndIndex > startIndex && phoneStartIndex < endIndex) {
      // Calculate which items from this phoneId we need (local index within this phoneId, 0-based)
      const phoneLocalStartIndex = Math.max(0, startIndex - phoneStartIndex);
      const phoneLocalEndIndex = Math.min(count, endIndex - phoneStartIndex);

      // Calculate which pages of this phoneId we need to query
      // phoneLocalStartIndex and phoneLocalEndIndex are 0-based indices within this phoneId
      const startPage = Math.floor(phoneLocalStartIndex / itemsPerPage) + 1;
      const endPage = Math.floor((phoneLocalEndIndex - 1) / itemsPerPage) + 1;

      // Query each page that overlaps with the needed range
      for (let phonePage = startPage; phonePage <= endPage; phonePage++) {
        // Calculate the range for this specific page (0-based within phoneId)
        const pageStartIndex = (phonePage - 1) * itemsPerPage;
        const pageEndIndex = phonePage * itemsPerPage;

        // Calculate overlap between needed range and this page
        const overlapStart = Math.max(phoneLocalStartIndex, pageStartIndex);
        const overlapEnd = Math.min(phoneLocalEndIndex, pageEndIndex);

        // Calculate how many items to skip from the start of this page
        const skipItems = overlapStart - pageStartIndex;
        // Calculate how many items to take from this page
        const takeItems = overlapEnd - overlapStart;

        if (takeItems > 0) {
          queriesToExecute.push({
            phoneId,
            page: phonePage,
            itemsPerPage, // Always use full page size for query
            skipItems,
            takeItems
          });
        }
      }
    }

    currentIndex = phoneEndIndex;
  }

  return queriesToExecute;
};

// Helper: Handle phone name search with pagination
const handlePhoneNameSearch = async (
  warehouseId: string,
  searchTerm: string,
  page: number,
  itemsPerPage: number
): Promise<{
  phoneDetails: PhoneDetail[];
  totalCount: number;
}> => {
  const matchingPhoneIds = await searchPhonesAndGetIds(searchTerm);

  if (matchingPhoneIds.length === 0) {
    return { phoneDetails: [], totalCount: 0 };
  }

  // Get count for each phoneId
  const phoneIdCounts = await Promise.all(
    matchingPhoneIds.map(async (phoneId) => {
      const count = await getPhoneDetailsCountByPhoneId(warehouseId, phoneId);
      return { phoneId, count };
    })
  );

  const totalCount = phoneIdCounts.reduce((sum, item) => sum + item.count, 0);

  if (totalCount === 0) {
    return { phoneDetails: [], totalCount: 0 };
  }

  // Calculate which phoneIds and pages to query
  const queriesToExecute = calculatePhoneIdQueries(
    phoneIdCounts,
    page,
    itemsPerPage
  );

  // Execute queries in parallel
  const phoneDetailsPromises = queriesToExecute.map(
    async ({ phoneId, page, itemsPerPage, skipItems, takeItems }) => {
      // Get full page of items (always fetch full page size)
      const fullPageItems = await getPhoneDetailsByPhoneIdPaginated(
        warehouseId,
        phoneId,
        page,
        itemsPerPage
      );
      // Skip items from the start and take only what we need
      return fullPageItems.slice(skipItems, skipItems + takeItems);
    }
  );
  const phoneDetailsResults = await Promise.all(phoneDetailsPromises);

  // Flatten and trim results to exact page size
  const allResults = phoneDetailsResults.flat();
  const paginatedPhoneDetails = allResults.slice(0, itemsPerPage);

  // Enrich with phone names
  const enrichedPhoneDetails = await processAndEnrichPhoneDetails(
    paginatedPhoneDetails
  );

  return {
    phoneDetails: enrichedPhoneDetails,
    totalCount
  };
};

// Helper: Handle query without search term
const handleNoSearchTerm = async (
  warehouseId: string,
  page: number,
  itemsPerPage: number
): Promise<{
  phoneDetails: PhoneDetail[];
  totalCount: number;
}> => {
  const phoneDetailsRef = collection(db, "phoneDetails");
  const baseQuery = query(
    phoneDetailsRef,
    where("warehouseId", "==", warehouseId)
  );

  // Get total count
  const countSnapshot = await getDocs(baseQuery);
  const totalCount = countSnapshot.docs.length;

  // Apply pagination
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedQuery: QueryConstraint[] = [
    where("warehouseId", "==", warehouseId),
    ...(startIndex > 0 && countSnapshot.docs.length > startIndex
      ? [startAfter(countSnapshot.docs[startIndex - 1])]
      : []),
    limit(itemsPerPage)
  ];

  const querySnapshot = await getDocs(
    query(phoneDetailsRef, ...paginatedQuery)
  );
  const phoneDetails = querySnapshot.docs.map(docToPhoneDetail);

  // Enrich with phone names
  const enrichedPhoneDetails = await processAndEnrichPhoneDetails(phoneDetails);

  return {
    phoneDetails: enrichedPhoneDetails,
    totalCount
  };
};

// Helper: Convert PhoneExported to PhoneDetail format
const convertPhoneExportedToPhoneDetail = (
  phoneExported: PhoneExported
): PhoneDetail => {
  return {
    id: phoneExported.phoneDetailId || phoneExported.id,
    phoneId: phoneExported.phoneId,
    warehouseId: phoneExported.warehouseId,
    color: phoneExported.color,
    imei: phoneExported.imei,
    importPrice: phoneExported.importPrice,
    salePrice: phoneExported.salePrice,
    status: phoneExported.status,
    updatedBy: phoneExported.updatedBy,
    createdAt: phoneExported.originalCreatedAt,
    updatedAt: phoneExported.originalUpdatedAt,
    importId: phoneExported.importId,
    importDate: phoneExported.importDate,
    name: phoneExported.phoneName,
    isExported: true,
    exportRecordId: phoneExported.exportRecordId
  };
};

// Helper: Search phoneExporteds by IMEI
const searchPhoneExportedsByImei = async (
  warehouseId: string,
  searchTerm: string
): Promise<PhoneExported[]> => {
  try {
    const phoneExportedsRef = collection(db, "phoneExporteds");
    const trimmedSearchTerm = searchTerm.trim();

    const exactQuery = query(
      phoneExportedsRef,
      where("warehouseId", "==", warehouseId),
      where("imei", "==", trimmedSearchTerm)
    );

    try {
      const exactSnapshot = await getDocs(exactQuery);
      if (exactSnapshot.docs.length > 0) {
        return exactSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            phoneDetailId: data.phoneDetailId || "",
            exportRecordId: data.exportRecordId || "",
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
            customerPhone: data.customerPhone || "",
            customerName: data.customerName || "",
            phoneName: data.phoneName || undefined,
            originalCreatedAt: data.originalCreatedAt?.toDate(),
            originalUpdatedAt: data.originalUpdatedAt?.toDate(),
            exportedAt: data.exportedAt?.toDate() || new Date(),
            importId: data.importId || undefined,
            importDate: data.importDate?.toDate()
          } as PhoneExported;
        });
      }
    } catch (error) {
      console.log("Exact IMEI match query failed:", error);
    }

    return [];
  } catch (error) {
    console.error("Error searching phone exporteds by IMEI:", error);
    return [];
  }
};

const handleImeiSearchExported = async (
  warehouseId: string,
  trimmedSearchTerm: string
): Promise<{
  phoneDetails: PhoneDetail[];
  totalCount: number;
} | null> => {
  const imeiExporteds = await searchPhoneExportedsByImei(
    warehouseId,
    trimmedSearchTerm
  );
  if (imeiExporteds.length > 0) {
    // Convert phoneExporteds to PhoneDetail format
    const exportedAsPhoneDetails = imeiExporteds.map(
      convertPhoneExportedToPhoneDetail
    );

    // Enrich exported phone details with phone names if needed
    const enrichedExported = await processAndEnrichPhoneDetails(
      exportedAsPhoneDetails
    );

    return {
      phoneDetails: enrichedExported,
      totalCount: enrichedExported.length
    };
  }

  return null;
};

// Get list of phoneDetails with phone name populated - each phoneDetail is a separate row
export const getListPhoneDetails = async (
  warehouseId: string,
  searchTerm?: string,
  page: number = 1,
  itemsPerPage: number = 20
): Promise<{
  phoneDetails: PhoneDetail[];
  totalCount: number;
}> => {
  try {
    // If search term provided, try IMEI search first
    if (searchTerm && searchTerm.trim()) {
      const trimmedSearchTerm = searchTerm.trim();

      // Step 1: Search by IMEI in phoneDetails (returns immediately if found)
      const imeiResult = await handleImeiSearch(warehouseId, trimmedSearchTerm);
      if (imeiResult) {
        return imeiResult;
      }

      // Step 2: Search by IMEI in phoneExporteds, if found then convert and return
      const imeiExportedResult = await handleImeiSearchExported(
        warehouseId,
        trimmedSearchTerm
      );
      if (imeiExportedResult) {
        return imeiExportedResult;
      }

      // Step 3: If no IMEI found, search by phone name in phoneDetails only
      return await handlePhoneNameSearch(
        warehouseId,
        trimmedSearchTerm,
        page,
        itemsPerPage
      );
    }

    // No search term: query directly from database
    return await handleNoSearchTerm(warehouseId, page, itemsPerPage);
  } catch (error) {
    console.error("Error getting list phone details:", error);
    throw error;
  }
};
