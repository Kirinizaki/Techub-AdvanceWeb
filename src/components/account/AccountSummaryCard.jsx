
import { Link } from "react-router-dom";
import { Package, CheckCircle, ShoppingCart } from "lucide-react";

const icons = {
  orders: Package,
  completed: CheckCircle,
  cart: ShoppingCart,
};

const colors = {
  orders: "bg-orange-50 text-orange-500",
  completed: "bg-emerald-50 text-emerald-500",
  cart: "bg-blue-50 text-blue-500",
};

export default function AccountSummaryCard({
  type,
  title,
  value,
  linkText,
  to,
}) {
  const Icon = icons[type] || Package;

  return (
    <Link
      to={to}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">{title}</p>

        <span className={`rounded-lg p-2 ${colors[type]}`}>
          <Icon size={16} />
        </span>
      </div>

      <p className="mt-1 text-2xl font-bold text-[#080F24]">
        {value}
      </p>

      <span className="mt-1 inline-block text-xs font-medium text-blue-600">
        {linkText} →
      </span>
    </Link>
  );
}
