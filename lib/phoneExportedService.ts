import {
  collection,
  doc,
  addDoc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { PhoneDetail } from "./phoneDetailService";

export interface PhoneExported {
  id: string;
  phoneDetailId: string; // id của phoneDetail gốc (để reference)
  exportRecordId: string; // id của export record liên quan
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
  // Thông tin từ export
  customerPhone: string;
  customerName: string;
  phoneName?: string; // Phone name from phones collection
  // Timestamps
  originalCreatedAt?: Date; // thời gian tạo phoneDetail gốc
  originalUpdatedAt?: Date; // thời gian cập nhật phoneDetail gốc
  exportedAt: Date; // thời gian export
}

// Convert Firestore document to PhoneExported object
const docToPhoneExported = (
  doc: QueryDocumentSnapshot<DocumentData>
): PhoneExported => {
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
    exportedAt: data.exportedAt?.toDate() || new Date()
  };
};

// Add a phone exported record (copy from PhoneDetail before deletion)
export const addPhoneExported = async (
  phoneDetail: PhoneDetail,
  exportRecordId: string,
  customerPhone: string,
  customerName: string
): Promise<string> => {
  try {
    const phoneExportedsRef = collection(db, "phoneExporteds");
    const phoneExportedData: Omit<PhoneExported, "id"> = {
      phoneDetailId: phoneDetail.id,
      exportRecordId,
      phoneId: phoneDetail.phoneId,
      warehouseId: phoneDetail.warehouseId,
      color: phoneDetail.color,
      imei: phoneDetail.imei,
      importPrice: phoneDetail.importPrice,
      salePrice: phoneDetail.salePrice,
      status: phoneDetail.status,
      updatedBy: phoneDetail.updatedBy,
      customerPhone,
      customerName,
      phoneName: phoneDetail.name,
      originalCreatedAt: phoneDetail.createdAt,
      originalUpdatedAt: phoneDetail.updatedAt,
      exportedAt: new Date()
    };

    const newPhoneExported = {
      ...phoneExportedData,
      exportedAt: Timestamp.now(),
      ...(phoneExportedData.originalCreatedAt && {
        originalCreatedAt: Timestamp.fromDate(
          phoneExportedData.originalCreatedAt
        )
      }),
      ...(phoneExportedData.originalUpdatedAt && {
        originalUpdatedAt: Timestamp.fromDate(
          phoneExportedData.originalUpdatedAt
        )
      })
    };

    const docRef = await addDoc(phoneExportedsRef, newPhoneExported);
    return docRef.id;
  } catch (error) {
    console.error("Error adding phone exported:", error);
    throw error;
  }
};
