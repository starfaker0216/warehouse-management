import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface Warehouse {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get all warehouse objects
export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const warehousesRef = collection(db, "warehouse");
    const querySnapshot = await getDocs(warehousesRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return [];
  }
};
