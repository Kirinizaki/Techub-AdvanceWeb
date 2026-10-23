
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Pencil,
  MapPin,
  KeyRound,
  ChevronRight,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import AccountSummaryCard from "../../components/account/AccountSummaryCard";
import RecentOrders from "../../components/account/RecentOrders";
import AccountPromoCard from "../../components/account/AccountPromoCard";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    async function loadAccount() {
      setLoading(true);
      setError("");

      try {
        const [profileResult, ordersResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("orders")
            .select(
              "id, order_number, order_status, total, currency, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (profileResult.error) throw profileResult.error;
        if (ordersResult.error) throw ordersResult.error;

        if (!active) return;

        setProfile(profileResult.data);
        setOrders(ordersResult.data ?? []);
      } catch (err) {
        console.error("Unable to load account:", err);

        if (active) {
          setError("We couldn't load your account information. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.email?.split("@")[0] ||
    "Techub Customer";

  const completedStatuses = ["completed", "delivered"];

  const completedOrders = orders.filter((order) =>
    completedStatuses.includes(
      (order.order_status || "").trim().toLowerCase()
    )
  ).length;

  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAvatar() {
      setAvatarUrl("");

      if (!profile?.avatar_url) return;

      // Supports either a stored object path or an existing URL.
      if (/^https?:\/\//i.test(profile.avatar_url)) {
        setAvatarUrl(profile.avatar_url);
        return;
      }

      const { data, error: avatarError } = await supabase.storage
        .from("profile-avatars")
        .createSignedUrl(profile.avatar_url, 3600);

      if (avatarError) {
        console.error("Unable to load profile avatar:", avatarError);
        return;
      }

      if (active) setAvatarUrl(data.signedUrl);
    }

    loadAvatar();

    return () => {
      active = false;
    };
  }, [profile?.avatar_url]);

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Profile summary */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={30} />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#080F24]">
              {loading ? "Loading profile..." : displayName}
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>

        <Link
          to="/account/settings"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 sm:self-auto"
        >
          <Pencil size={13} />
          Account Settings
        </Link>
      </section>

      {/* Live order summary */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AccountSummaryCard
          type="orders"
          title="Total Orders"
          value={loading ? "—" : orders.length}
          linkText="View orders"
          to="/account/orders"
        />

        <AccountSummaryCard
          type="completed"
          title="Order Completed"
          value={loading ? "—" : completedOrders}
          linkText="View details"
          to="/account/orders"
        />
      </section>

      {/* Recent orders */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <RecentOrders orders={orders.slice(0, 3)} loading={loading} />
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
          <ChevronRight size={14} className="shrink-0 text-slate-400" />
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
