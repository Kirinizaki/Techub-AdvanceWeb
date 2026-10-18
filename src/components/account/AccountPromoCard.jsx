
import { Link } from "react-router-dom";
import { Monitor, ArrowRight } from "lucide-react";

export default function AccountPromoCard() {
  return (
    <section className="flex min-h-51.25 flex-col overflow-hidden rounded-xl bg-linear-to-br from-[#080F24] via-[#102344] to-[#17285A] p-4 text-white shadow-sm">
      <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-cyan-300">
        Exclusive Deals
      </span>

      <h2 className="mt-3 text-base font-bold">
        Upgrade Your Setup
      </h2>

      <p className="mt-1 max-w-55 text-xs leading-5 text-slate-300">
        Get up to 40% off on custom gaming rigs, laptops, PC components
        and accessories!
      </p>

      <div className="my-3 flex flex-1 items-center justify-center">
        <div className="relative flex h-14 w-28 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10">
          <Monitor size={30} className="text-cyan-400" />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </div>
      </div>

      <Link
        to="/products"
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold transition hover:bg-blue-500"
      >
        Shop Now
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
