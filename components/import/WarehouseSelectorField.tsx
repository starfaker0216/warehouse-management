import { Warehouse } from "../../lib/warehouseService";

interface WarehouseSelectorFieldProps {
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (warehouseId: string) => void;
}

export default function WarehouseSelectorField({
  warehouses,
  selectedWarehouseId,
  onWarehouseChange
}: WarehouseSelectorFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Kho <span className="text-red-500">*</span>
      </label>
      <select
        required
        value={selectedWarehouseId}
        onChange={(e) => onWarehouseChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <option value="">Chọn kho</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </select>
    </div>
  );
}
