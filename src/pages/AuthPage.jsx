
import { useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

import Logo from "../assets/TechubLogo.png";

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
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1229] font-sans text-white">
      {/* Shared navigation */}
      <Navbar />

      {/* Authentication section */}
      <main className="w-full flex-1">
        <div className="grid min-h-410 w-full flex-1 grid-cols-1 overflow-hidden bg-[#465586] lg:min-h-[680px] lg:grid-cols-[1.18fr_0.82fr]">

          {/* Left showcase: hidden on mobile */}
          <section className="hidden flex-col justify-between bg-gradient-to-r from-[#1B3035] via-[#34466D] to-[#465586] px-5 py-8 lg:flex lg:min-h-[475px] lg:px-[5.8%]">

            {/* Techub branding and product showcase */}
            <div>
              <div className="flex items-center gap-3">
                {/* Replace this path with your actual logo filename if needed */}
                <img
                  src={Logo}
                  alt="Techub logo"
                  className="h-14 w-14 shrink-0 object-contain"
                />

                <div>
                  <h1 className="text-3xl font-bold tracking-wide">
                    TECH<span className="text-[#0798F9]">HUB</span>
                  </h1>

                  <p className="mt-1 text-sm text-white/80">
                    Your Trusted Hub for Quality Technology
                  </p>
                </div>
              </div>

              {/* Product image and blue frame */}
              <div className="relative mx-auto mt-8 flex min-h-[220px] w-full max-w-[570px] items-center justify-center sm:min-h-[270px]">
                <div className="absolute inset-x-0 top-1/2 h-[85%] -translate-y-1/2 border-2 border-[#0798F9]" />

                {/* Replace with your actual PC/monitor showcase image */}
                <img
                  src="/images/auth-pc-showcase.png"
                  alt="Gaming PC, monitor, keyboard, and mouse"
                  className="relative z-10 max-h-[300px] w-full object-contain"
                />
              </div>
            </div>

            {/* Trust benefits */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck
                  size={29}
                  strokeWidth={1.7}
                  className="text-white"
                />
                <p className="text-xs font-semibold sm:text-sm">
                  Secure Payment
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Truck
                  size={29}
                  strokeWidth={1.7}
                  className="text-white"
                />
                <p className="text-xs font-semibold sm:text-sm">
                  Fast Delivery
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <BadgeCheck
                  size={29}
                  strokeWidth={1.7}
                  className="text-white"
                />
                <p className="text-xs font-semibold sm:text-sm">
                  Verified Seller
                </p>
              </div>
            </div>
          </section>

          {/* Right side: form card */}
          <section className="flex items-center justify-center bg-transparent px-4 py-8 sm:px-8 lg:py-8">
            <div className="w-full max-w-[420px] rounded-[18px] bg-[#F5FFF1] px-6 py-8 text-black shadow-lg sm:px-9 sm:py-10 lg:min-h-[520px] lg:max-w-[430px] lg:px-11 lg:py-12 xl:max-w-[460px] xl:px-12 xl:py-14">
              {renderAuthForm()}
            </div>
          </section>

        </div>
      </main>

      {/* Shared footer */}
      <Footer />
    </div>
  );
}
