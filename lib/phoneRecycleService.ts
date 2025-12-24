import { addDoc, collection, Timestamp } from "firebase/firestore";
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
