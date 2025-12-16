interface TypeSelectorFieldProps {
  type: "income" | "expense";
  onTypeChange: (type: "income" | "expense") => void;
}

export default function TypeSelectorField({
  type,
  onTypeChange
}: TypeSelectorFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Thu / Chi <span className="text-red-500">*</span>
      </label>
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as "income" | "expense")}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        required
      >
        <option value="income">Thu</option>
        <option value="expense">Chi</option>
      </select>
    </div>
  );
}
