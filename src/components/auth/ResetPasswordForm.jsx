
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordForm() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!data.session) {
        throw new Error(
          "Your password reset session is missing or has expired. Please request a new reset email."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage(
        error.message || "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center">
        <CheckCircle size={42} className="mx-auto mb-4 text-green-600" />

        <h2 className="text-2xl font-bold tracking-wide text-[#080F24]">
          PASSWORD UPDATED
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Your password has been changed successfully. You can now log in
          using your new password.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-6 w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC]"
        >
          BACK TO LOG IN
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-center text-2xl font-bold tracking-wide text-[#080F24]">
        RESET PASSWORD
      </h2>

      <p className="mt-3 text-center text-sm leading-6 text-gray-600">
        Enter your new password below.
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

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="reset-password"
            className="mb-1.5 block text-sm font-medium text-[#080F24]"
          >
            New Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter your new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-[#0798F9]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-reset-password"
            className="mb-1.5 block text-sm font-medium text-[#080F24]"
          >
            Confirm New Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="confirm-reset-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((current) => !current)
              }
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-[#0798F9]"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
        </button>
      </form>

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
