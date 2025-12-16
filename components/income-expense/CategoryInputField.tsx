interface CategoryInputFieldProps {
  category: string;
  type: "income" | "expense";
  onCategoryChange: (category: string) => void;
}

export default function CategoryInputField({
  category,
  type,
  onCategoryChange
}: CategoryInputFieldProps) {
  const label = type === "income" ? "Loại Thu" : "Loại Chi";
  const placeholder =
    type === "income"
      ? "Ví dụ: Bán hàng, Thu nợ..."
      : "Ví dụ: Mua hàng, Chi phí vận chuyển...";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        required
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
      />
    </div>
  );
}

