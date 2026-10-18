
import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

export default function AccountPlaceholderPage({
  title,
  description,
}) {
  return (
    <section className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600">
        <Construction size={28} />
      </div>

      <h2 className="text-xl font-bold text-[#080F24]">{title}</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      <Link
        to="/account/profile"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0798F9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087FD0]"
      >
        <ArrowLeft size={16} />
        Back to My Account
      </Link>
    </section>
  );
}
