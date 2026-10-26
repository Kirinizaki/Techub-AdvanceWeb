import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";

/*
  Route guard for the admin side.
    <Route element={<AdminRoute allow={["admin", "employee"]} />}> ...routes... </Route>
  Not signed in  -> /login
  Customer       -> storefront home
  Employee on an admin-only page -> /admin
*/
export default function AdminRoute({ allow = ["admin", "employee"] }) {
  const { role, signedIn, loading } = useUserRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Checking access…
      </div>
    );
  }

  if (!signedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow.includes(role)) return <Outlet />;

  if (role === "employee") return <Navigate to="/admin" replace />;
  if (role === "customer") return <Navigate to="/" replace />;

  // Signed in but no readable role (no user_roles row, or the role read was blocked)
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-6">
      <div className="max-w-sm rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-800">No admin access</p>
        <p className="mt-2 text-xs text-slate-500">
          This account has no admin or staff role, or the role could not be
          read. If this is an admin account, make sure admin_staff_access.sql
          has been run.
        </p>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
          Back to store
        </Link>
      </div>
    </div>
  );
}
