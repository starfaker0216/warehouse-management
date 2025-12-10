import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  formatPriceSuggest,
  getPriceSuggests
} from "../../utils/currencyUtils";

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseCurrencyInput(value);

    onPriceChange(numValue);

    if (numValue > 0) {
      onPriceInputValueChange(formatCurrencyInput(numValue));
    } else {
      onPriceInputValueChange("");
    }
  };

  const handleFocus = () => {
    onPriceFocus(true);
    if (importPrice > 0) {
      onPriceInputValueChange(formatCurrencyInput(importPrice));
    } else {
      onPriceInputValueChange("");
    }
  };

  const handleBlur = () => {
    onPriceFocus(false);
    if (importPrice > 0) {
      onPriceInputValueChange(formatCurrencyInput(importPrice));
    } else {
      onPriceInputValueChange("");
    }
  };

  const handleSuggestClick = (suggestValue: number) => {
    onPriceChange(suggestValue);
    const formattedValue = formatCurrencyInput(suggestValue);
    onPriceInputValueChange(formattedValue);
    onPriceFocus(true);

    setTimeout(() => {
      const input = document.getElementById("price-input") as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(formattedValue.length, formattedValue.length);
      }
    }, 0);
  };

  const displayValue =
    priceInputValue ||
    (importPrice > 0 ? formatCurrencyInput(importPrice) : "");

  const priceSuggests =
    isPriceFocused && priceInputValue ? getPriceSuggests(priceInputValue) : [];

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Giá Nhập <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        required
        id="price-input"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="0"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
      />
      {importPrice > 0 && !isPriceFocused && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {formatCurrency(importPrice)}
        </p>
      )}
      {isPriceFocused &&
        priceInputValue &&
        parseCurrencyInput(priceInputValue) > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {priceSuggests.map((suggestValue, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSuggestClick(suggestValue);
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {formatPriceSuggest(suggestValue)}
              </button>
            ))}
          </div>
        )}
    </div>
  );
}
