
import { Link } from "react-router-dom";
import { UserRound, Pencil, MapPin, KeyRound, ChevronRight } from "lucide-react";

import AccountSummaryCard from "../../components/account/AccountSummaryCard";
import RecentOrders from "../../components/account/RecentOrders";
import AccountPromoCard from "../../components/account/AccountPromoCard";

import {
  getProfile,
  mockAccountSummary,
} from "../../data/accountMockData";

export default function ProfilePage() {
  const profile = getProfile();
  const name = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <div className="space-y-5">
      {/* Profile summary */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={30} />
            )}

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#080F24]">
              {name || "Techub Customer"}
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500">
              {profile.email}
            </p>
          </div>
        </div>

        <Link
          to="/account/profile/edit"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 sm:self-auto"
        >
          <Pencil size={13} />
          Edit Profile
        </Link>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AccountSummaryCard
          type="orders"
          title="Total Orders"
          value={mockAccountSummary.totalOrders}
          linkText="View orders"
          to="/account/orders"
        />

        <AccountSummaryCard
          type="completed"
          title="Order Completed"
          value={mockAccountSummary.completedOrders}
          linkText="View details"
          to="/account/orders"
        />

        <AccountSummaryCard
          type="cart"
          title="My Carts"
          value={mockAccountSummary.cartItems}
          linkText="View cart"
          to="/cart"
        />
      </section>

      {/* Recent orders and promotion */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <RecentOrders />
        <AccountPromoCard />
      </section>

      {/* Account shortcuts */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Link
          to="/account/addresses"
          className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="rounded-md bg-slate-100 p-2 text-slate-500">
              <MapPin size={15} />
            </span>

            <span className="text-xs font-medium text-[#080F24]">
              Saved Shipping Addresses
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
            {mockAccountSummary.savedAddresses} Addresses
            <ChevronRight size={14} />
          </span>
        </Link>

        <Link
          to="/account/settings"
          className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="rounded-md bg-slate-100 p-2 text-slate-500">
              <KeyRound size={15} />
            </span>

            <span className="text-xs font-medium text-[#080F24]">
              Security &amp; Password
            </span>
          </span>

          <ChevronRight size={14} className="shrink-0 text-slate-400" />
        </Link>
      </section>
    </div>
  );
}
