import { fmtBDT } from "@/lib/formatters";

interface CurrencyProps {
  amount: number;
  className?: string;
}

export default function Currency({ amount, className }: CurrencyProps) {
  return <span className={className}>{fmtBDT(amount)}</span>;
}
