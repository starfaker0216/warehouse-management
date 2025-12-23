export interface ImportItem {
  color: string;
  imei: string;
  importPrice: number;
  salePrice: number;
  status: string;
}

export interface ImportFormData {
  phoneId: string;
  importDate: Date;
  phoneType: string;
  quantity: number;
  items: ImportItem[];
  supplier: string;
  note: string;
}
