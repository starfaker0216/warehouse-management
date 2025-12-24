import { PhoneDetail } from "../../lib/phoneDetailService";

export type PhoneStatus = "in_warehouse" | "exported" | "recycled";

export interface PhoneDetailWithStatus extends PhoneDetail {
  phoneStatus: PhoneStatus;
}
