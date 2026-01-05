import {
  addDoc,
  collection,
  Timestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "./firebase";
import { PhoneDetail, deletePhoneDetail } from "./phoneDetailService";

export const recyclePhoneDetail = async (
  phoneDetail: PhoneDetail
): Promise<void> => {
  const createdAt =
    phoneDetail.createdAt instanceof Date
      ? Timestamp.fromDate(phoneDetail.createdAt)
      : Timestamp.now();
  const updatedAt =
    phoneDetail.updatedAt instanceof Date
      ? Timestamp.fromDate(phoneDetail.updatedAt)
      : Timestamp.now();
  const importDate = phoneDetail.importDate
    ? Timestamp.fromDate(phoneDetail.importDate)
    : undefined;

  const recyclePayload: Record<string, unknown> = {
    ...phoneDetail,
    createdAt,
    updatedAt,
    recycledAt: Timestamp.now()
  };

  // Include importId and importDate if they exist
  if (phoneDetail.importId) {
    recyclePayload.importId = phoneDetail.importId;
  }
  if (importDate) {
    recyclePayload.importDate = importDate;
  }

  // Remove id field as it's not needed in the recycle document
  delete recyclePayload.id;

  await addDoc(collection(db, "phoneRecycles"), recyclePayload);
  await deletePhoneDetail(phoneDetail.id);
};

// Update phone recycle warehouseId by importId
export const updatePhoneRecycleWarehouseIdByImportId = async (
  importId: string,
  warehouseId: string
): Promise<void> => {
  try {
    const phoneRecyclesRef = collection(db, "phoneRecycles");
    const q = query(phoneRecyclesRef, where("importId", "==", importId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    // Update all phoneRecycles with this importId
    const updatePromises = querySnapshot.docs.map((docSnapshot) => {
      const phoneRecycleRef = doc(db, "phoneRecycles", docSnapshot.id);
      return updateDoc(phoneRecycleRef, { warehouseId });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error(
      "Error updating phone recycle warehouseId by importId:",
      error
    );
    throw error;
  }
};
