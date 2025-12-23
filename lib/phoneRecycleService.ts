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

  const recyclePayload = {
    ...phoneDetail,
    createdAt,
    updatedAt,
    recycledAt: Timestamp.now()
  };

  await addDoc(collection(db, "phoneRecycles"), recyclePayload);
  await deletePhoneDetail(phoneDetail.id);
};
