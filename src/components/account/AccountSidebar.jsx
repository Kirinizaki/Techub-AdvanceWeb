
import { Link, NavLink } from "react-router-dom";
import {
  UserRound,
  Package,
  ShoppingCart,
  Heart,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";

import { getProfile } from "../../data/accountMockData";

const links = [
  { label: "My Account", to: "/account/profile", icon: UserRound },
  { label: "My Orders", to: "/account/orders", icon: Package },
  { label: "Wishlist", to: "/account/wishlist", icon: Heart },
  { label: "Cart", to: "/cart", icon: ShoppingCart },
  { label: "Addresses", to: "/account/addresses", icon: MapPin },
  { label: "Settings", to: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
  const profile = getProfile();
  const name = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-5 flex min-w-0 items-center gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={21} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#080F24]">
            {name || "Techub Customer"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {profile.email}
          </p>
        </div>
      </div>

      <nav aria-label="Account navigation" className="space-y-1">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/account/profile"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-blue-50 font-medium text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#080F24]"
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            // Connect to your authentication provider later.
            alert("Connect this action to your sign-out flow.");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition hover:bg-rose-50"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
