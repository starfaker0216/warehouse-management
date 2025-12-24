import {
  collection,
  getDocs,
  query,
  where,
  DocumentData
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getPhoneDetail } from "../../lib/phoneDetailService";
import { getPhone } from "../../lib/phoneService";
import { PhoneDetailWithStatus, PhoneStatus } from "./types";

export const loadPhoneDetailsWithStatus = async (
  phoneDetailIds: string[],
  importId: string
): Promise<PhoneDetailWithStatus[]> => {
  // Load all phoneRecycles for this import once
  let phoneRecycles: Array<{
    data: DocumentData;
    phone: Awaited<ReturnType<typeof getPhone>>;
  }> = [];

  try {
    const phoneRecyclesRef = collection(db, "phoneRecycles");
    const q = query(phoneRecyclesRef, where("importId", "==", importId));
    const querySnapshot = await getDocs(q);
    phoneRecycles = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const phone = data.phoneId ? await getPhone(data.phoneId) : null;
        return { data, phone };
      })
    );
  } catch (err) {
    console.error("Error loading phoneRecycles:", err);
  }

  let recycleIndex = 0;

  const detailsWithStatus = await Promise.all(
    phoneDetailIds.map(async (id) => {
      // Try to find in phoneDetails first
      const phoneDetail = await getPhoneDetail(id);
      if (phoneDetail) {
        return {
          ...phoneDetail,
          phoneStatus: "in_warehouse" as PhoneStatus
        };
      }

      // If not found, try to find in phoneExporteds
      const exportedDetail = await findInPhoneExporteds(id);
      if (exportedDetail) {
        return exportedDetail;
      }

      // If still not found, try to find in phoneRecycles
      if (recycleIndex < phoneRecycles.length) {
        const { data, phone } = phoneRecycles[recycleIndex];
        recycleIndex++;
        return createPhoneDetailFromRecycle(id, data, phone);
      }

      return null;
    })
  );

  return detailsWithStatus.filter(
    (detail): detail is PhoneDetailWithStatus => detail !== null
  );
};

const findInPhoneExporteds = async (
  phoneDetailId: string
): Promise<PhoneDetailWithStatus | null> => {
  try {
    const phoneExportedsRef = collection(db, "phoneExporteds");
    const q = query(
      phoneExportedsRef,
      where("phoneDetailId", "==", phoneDetailId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const exportedDoc = querySnapshot.docs[0];
    const data = exportedDoc.data();
    const phone = data.phoneId ? await getPhone(data.phoneId) : null;

    return {
      id: data.phoneDetailId || phoneDetailId,
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
      createdAt: data.originalCreatedAt?.toDate(),
      updatedAt: data.originalUpdatedAt?.toDate(),
      importId: data.importId || undefined,
      importDate: data.importDate?.toDate(),
      name: phone?.name || data.phoneName || undefined,
      phoneStatus: "exported" as PhoneStatus
    };
  } catch (err) {
    console.error("Error finding in phoneExporteds:", err);
    return null;
  }
};

const createPhoneDetailFromRecycle = (
  id: string,
  data: DocumentData,
  phone: Awaited<ReturnType<typeof getPhone>> | null
): PhoneDetailWithStatus => {
  return {
    id: id,
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
    importDate: data.importDate?.toDate(),
    name: phone?.name || undefined,
    phoneStatus: "recycled" as PhoneStatus
  };
};
