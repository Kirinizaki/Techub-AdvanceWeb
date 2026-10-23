import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../services/authService";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  UserRound,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";

const links = [
  { label: "My Account", to: "/account/profile", icon: UserRound },
  { label: "My Orders", to: "/account/orders", icon: Package },
  { label: "Wishlist", to: "/account/wishlist", icon: Heart },
  { label: "Addresses", to: "/account/addresses", icon: MapPin },
  { label: "Settings", to: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
 
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  
  useEffect(() => {
    let active = true;

    async function loadAvatar() {
      setAvatarUrl("");

      if (!profile?.avatar_url) return;

      if (/^https?:\/\//i.test(profile.avatar_url)) {
        setAvatarUrl(profile.avatar_url);
        return;
      }

      const { data, error } = await supabase.storage
        .from("profile-avatars")
        .createSignedUrl(profile.avatar_url, 3600);

      if (error) {
        console.error("Unable to load sidebar avatar:", error);
        return;
      }

      if (active) setAvatarUrl(data.signedUrl);
    }

    loadAvatar();

    return () => {
      active = false;
    };
  }, [profile?.avatar_url]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Unable to load sidebar profile:", error);
        return;
      }

      if (active) {
        setProfile(data);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const name =
    profile?.display_name ||
    profile?.username ||
    user?.email?.split("@")[0] ||
    "Techub Customer";


  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-5 flex min-w-0 items-center gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={() => setAvatarUrl("")}
            />
          ) : (
            <UserRound size={21} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#080F24]">
            {name}
          </p>

          <p className="truncate text-xs text-slate-500">
            {user?.email || "No email available"}
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
          onClick={() => setShowLogoutModal(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition hover:bg-rose-50"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isLoggingOut) setShowLogoutModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <LogOut size={22} />
            </div>

            <h2
              id="logout-modal-title"
              className="text-xl font-bold text-[#080F24]"
            >
              Log out of Techub?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to log out of your account? You can sign
              back in anytime.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Yes, log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>

  );
}
