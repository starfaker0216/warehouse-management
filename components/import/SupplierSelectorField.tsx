interface SupplierSelectorFieldProps {
  suppliers: string[];
  selectedSupplier: string;
  newSupplier: string;
  showAddSupplier: boolean;
  onSupplierChange: (supplier: string) => void;
  onNewSupplierChange: (supplier: string) => void;
  onShowAddSupplier: (show: boolean) => void;
}

export default function SupplierSelectorField({
  suppliers,
  selectedSupplier,
  newSupplier,
  showAddSupplier,
  onSupplierChange,
  onNewSupplierChange,
  onShowAddSupplier
}: SupplierSelectorFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Nhà Cung Cấp <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {!showAddSupplier ? (
          <div className="flex gap-2">
            <select
              required
              value={selectedSupplier}
              onChange={(e) => onSupplierChange(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onShowAddSupplier(true)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              + Mới
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newSupplier}
              onChange={(e) => {
                const value = e.target.value;
                onNewSupplierChange(value);
                onSupplierChange(value);
              }}
              placeholder="Nhập nhà cung cấp mới"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
            <button
              type="button"
              onClick={() => {
                onShowAddSupplier(false);
                onNewSupplierChange("");
                onSupplierChange("");
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

