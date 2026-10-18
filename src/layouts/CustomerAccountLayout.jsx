
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ChatSupport from "../components/customer/ChatSupport";
import AccountSidebar from "../components/account/AccountSidebar";

export default function CustomerAccountLayout() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#080F24]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-7">
          <p className="mb-1 text-xs font-medium text-slate-500">
            Account
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My Account
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account information, order status, and recent activity.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <AccountSidebar />

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
      <ChatSupport />
    </div>
  );
}
