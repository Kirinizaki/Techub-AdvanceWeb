
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, AlertCircle } from "lucide-react";
import { requestPasswordReset } from "../../services/authService";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      console.error("Password recovery error:", error);
      setErrorMessage(
        "We couldn't process your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#0789DD] transition hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Log In
      </Link>

      <h2 className="text-center text-2xl font-bold tracking-wide text-[#080F24]">
        FORGOT PASSWORD?
      </h2>

      <p className="mt-3 text-center text-sm leading-6 text-gray-600">
        Enter the email address associated with your account. We'll help you
        reset your password.
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {submitted ? (
        <div
          role="status"
          className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-center"
        >
          <Mail
            size={28}
            className="mx-auto mb-2 text-green-700"
          />

          <p className="text-sm font-semibold text-green-800">
            Request submitted
          </p>

          <p className="mt-1 text-sm text-green-700">
            If an account is associated with that email, password-reset
            instructions can be sent to it. Check your inbox and spam folder.
          </p>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setEmail("");
              setErrorMessage("");
            }}
            className="mt-4 text-sm font-semibold text-[#0789DD] hover:underline"
          >
            Try another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="forgot-email"
              className="mb-1.5 block text-sm font-medium text-[#080F24]"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC] focus:outline-none focus:ring-2 focus:ring-[#0798F9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "SENDING REQUEST..." : "RESET PASSWORD"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#0789DD] hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
