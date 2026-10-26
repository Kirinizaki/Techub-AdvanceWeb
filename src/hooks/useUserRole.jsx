import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

/*
  Who is logged in comes from your AuthContext (single source of truth).
  This hook only adds the role from public.user_roles:
  "customer" | "employee" | "admin".

  The UI uses it to show/hide pages. The real protection is the database
  (RLS policies + the role checks inside your RPC functions).
*/

// userId -> Promise<role | null>. Shared so several components asking at once
// cause one request, not many.
const roleCache = new Map();

function fetchRole(userId) {
  if (!roleCache.has(userId)) {
    const query = supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => (error ? null : data?.role ?? null));

    // Never hang forever: give up after 8 seconds and treat as "no role".
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 8000));

    const promise = Promise.race([query, timeout]).then((role) => {
      if (role === null) roleCache.delete(userId); // retry next time
      return role;
    });

    roleCache.set(userId, promise);
  }
  return roleCache.get(userId);
}

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [result, setResult] = useState({ userId: null, role: null });

  useEffect(() => {
    if (authLoading) return undefined;

    if (!userId) {
      roleCache.clear(); // logged out: forget cached roles
      return undefined;
    }

    let active = true;
    fetchRole(userId).then((role) => {
      if (active) setResult({ userId, role });
    });

    return () => {
      active = false;
    };
  }, [authLoading, userId]);

  const roleReady = !userId || result.userId === userId;
  const role = userId && result.userId === userId ? result.role : null;

  return {
    user,
    role,
    loading: authLoading || !roleReady,
    signedIn: Boolean(userId),
    isAdmin: role === "admin",
    isStaff: role === "admin" || role === "employee",
  };
}

/*
  Wrap a piece of UI to restrict it by role.
    <RoleGate allow={["admin"]}>...</RoleGate>
*/
export function RoleGate({ allow, children, fallback = null }) {
  const { role, loading } = useUserRole();
  if (loading) return null;
  return allow.includes(role) ? children : fallback;
}
