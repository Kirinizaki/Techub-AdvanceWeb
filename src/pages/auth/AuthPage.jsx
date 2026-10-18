
import { useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import LoginForm from "../../components/auth/LoginForm";
import SignupForm from "../../components/auth/SignupForm";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

import AuthBg from "../../assets/auth-bg.png";

export default function AuthPage() {
  const location = useLocation();

  const renderAuthForm = () => {
    switch (location.pathname) {
      case "/signup":
        return <SignupForm />;

      case "/forgot-password":
        return <ForgotPasswordForm />;

      case "/login":
      default:
        return <LoginForm />;

      case "/reset-password":
        return <ResetPasswordForm />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#080F24] font-sans text-white">
      {/* Shared Navbar */}
      <Navbar />

      {/* Authentication section */}
      <main className="flex w-full flex-1">
        <section
          className="
            relative flex w-full flex-1 items-center justify-center
            overflow-hidden lg:min-h-180
            bg-linear-to-br from-[#102D42] via-[#34466D] to-[#465586]
            px-4 py-10 sm:px-8
            lg:py-12
          "
        >
          {/* Desktop background image */}
          <img
            src={AuthBg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 hidden h-full w-full object-fill  lg:block"
          />

          {/* Desktop overlay for visual depth */}
          <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#061326]/20 via-transparent to-[#34466D]/20 lg:block" />

          {/* Desktop trust benefits */}
          <div className="absolute bottom-6 left-[5.5%] z-10 hidden max-w-[55%] grid-cols-3 gap-6 text-white lg:grid xl:bottom-8">
            <div className="flex items-center gap-3">
              <ShieldCheck size={30} strokeWidth={1.7} />
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="mt-1 text-xs text-blue-200">
                  Shop with confidence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-cyan-400/40 pl-5">
              <Truck size={30} strokeWidth={1.7} />
              <div>
                <p className="text-sm font-semibold">Fast Delivery</p>
                <p className="mt-1 text-xs text-blue-200">
                  Get your tech, faster
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-cyan-400/40 pl-5">
              <BadgeCheck size={30} strokeWidth={1.7} />
              <div>
                <p className="text-sm font-semibold">Verified Seller</p>
                <p className="mt-1 text-xs text-blue-200">
                  Quality products only
                </p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="relative z-20 flex h-130 w-full max-w-107.5 flex-col justify-center overflow-y-auto rounded-[18px] bg-white px-6 py-8 text-black shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:px-9 lg:absolute lg:right-[6%] lg:top-1/2 lg:h-160 lg:w-100 lg:max-w-none lg:-translate-y-1/2 lg:px-11 lg:py-10 xl:right-[8%] xl:h-162.5 xl:w-125 xl:px-12">
            {renderAuthForm()}
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
