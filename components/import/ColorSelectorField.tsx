interface ColorSelectorFieldProps {
  colors: string[];
  selectedColor: string;
  newColor: string;
  showAddColor: boolean;
  onColorChange: (color: string) => void;
  onNewColorChange: (color: string) => void;
  onShowAddColor: (show: boolean) => void;
}

export default function ColorSelectorField({
  colors,
  selectedColor,
  newColor,
  showAddColor,
  onColorChange,
  onNewColorChange,
  onShowAddColor
}: ColorSelectorFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Màu Sắc <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {!showAddColor ? (
          <div className="flex gap-2">
            <select
              required
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Chọn màu</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onShowAddColor(true)}
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
              value={newColor}
              onChange={(e) => {
                const value = e.target.value;
                onNewColorChange(value);
                onColorChange(value);
              }}
              placeholder="Nhập màu mới"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
            <button
              type="button"
              onClick={() => {
                onShowAddColor(false);
                onNewColorChange("");
                onColorChange("");
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

