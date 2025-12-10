import { Phone } from "../../lib/phoneService";

interface PhoneSelectorFieldProps {
  phones: Phone[];
  phoneId: string;
  phoneType: string;
  onOpenSelector: () => void;
}

export default function PhoneSelectorField({
  phones,
  phoneId,
  phoneType,
  onOpenSelector
}: PhoneSelectorFieldProps) {
  const displayValue = phoneId
    ? (() => {
        const selectedPhone = phones.find((p) => p.id === phoneId);
        return selectedPhone ? selectedPhone.model : phoneId;
      })()
    : "";

  return (
    <>
      {/* ID Máy */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ID Máy <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={displayValue}
            onClick={onOpenSelector}
            readOnly
            placeholder="Chọn máy..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
          />
          <button
            type="button"
            onClick={onOpenSelector}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Loại Máy */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Loại Máy <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={phoneType}
            onChange={() => {}}
            onClick={onOpenSelector}
            readOnly
            placeholder="Chọn loại máy..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
          />
          <button
            type="button"
            onClick={onOpenSelector}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
