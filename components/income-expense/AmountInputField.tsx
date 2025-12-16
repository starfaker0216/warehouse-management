import PriceInput from "../common/PriceInput";

interface AmountInputFieldProps {
  amount: number;
  type: "income" | "expense";
  priceInputValue: string;
  onAmountChange: (amount: number) => void;
  onPriceInputValueChange: (value: string) => void;
}

export default function AmountInputField({
  amount,
  type,
  priceInputValue,
  onAmountChange,
  onPriceInputValueChange
}: AmountInputFieldProps) {
  const label = type === "income" ? "Tiền Thu" : "Tiền Chi";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} <span className="text-red-500">*</span>
      </label>
      <PriceInput
        value={amount}
        inputValue={priceInputValue}
        onValueChange={onAmountChange}
        onInputValueChange={onPriceInputValueChange}
        placeholder="0"
        id="amount-input"
        className="px-4 py-2"
        required
      />
    </div>
  );
}

