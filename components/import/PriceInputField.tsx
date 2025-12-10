import PriceInput from "../common/PriceInput";

interface PriceInputFieldProps {
  importPrice: number;
  priceInputValue: string;
  isPriceFocused: boolean;
  onPriceChange: (price: number) => void;
  onPriceInputValueChange: (value: string) => void;
  onPriceFocus: (focused: boolean) => void;
}

export default function PriceInputField({
  importPrice,
  priceInputValue,
  isPriceFocused,
  onPriceChange,
  onPriceInputValueChange,
  onPriceFocus
}: PriceInputFieldProps) {
  // PriceInput component manages its own focus state, but we need to sync with parent
  // We'll use a wrapper to handle the focus sync
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Giá Nhập <span className="text-red-500">*</span>
      </label>
      <PriceInput
        value={importPrice}
        inputValue={priceInputValue}
        onValueChange={onPriceChange}
        onInputValueChange={onPriceInputValueChange}
        placeholder="0"
        id="price-input"
        className="px-4 py-2"
        required
      />
    </div>
  );
}
