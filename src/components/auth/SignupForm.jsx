import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import { signUp } from "../../services/authService";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const username = formData.username.trim().toLowerCase();
    const email = formData.email.trim();

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setErrorMessage(
        "Username must be 3–24 characters using letters, numbers, or underscores."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Your password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signUp({
        username,
        email,
        password: formData.password,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(
        error.message ||
          "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full">
        <div
          role="status"
          className="rounded-md border border-green-200 bg-green-50 p-5 text-center"
        >
          <Mail
            size={32}
            className="mx-auto mb-3 text-green-700"
          />

          <h2 className="text-xl font-bold text-[#080F24]">
            CHECK YOUR EMAIL
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            If your registration was accepted, Supabase will send a
            confirmation email to the address you provided. Open that
            email and follow its instructions to confirm your account.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-block font-semibold text-[#0789DD] hover:underline"
          >
            Return to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-center text-2xl font-bold tracking-wide text-[#080F24]">
        CREATE ACCOUNT
      </h2>

      <p className="mt-2 text-center text-sm text-gray-600">
        Join the Techub community today!
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
        {/* Username */}
        <div>
          <label
            htmlFor="signup-username"
            className="mb-1 block text-sm font-medium text-[#080F24]"
          >
            Username
          </label>

          <input
            id="signup-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            minLength={3}
            maxLength={24}
            pattern="[A-Za-z0-9_]{3,24}"
            title="Use 3–24 letters, numbers, or underscores."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
            required
            disabled={loading}
          />

          <p className="mt-1 text-xs text-gray-500">
            3–24 characters; letters, numbers, and underscores only.
          </p>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="mb-1 block text-sm font-medium text-[#080F24]"
          >
            Email Address
          </label>

          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1 block text-sm font-medium text-[#080F24]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-[#0798F9]"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="mb-1 block text-sm font-medium text-[#080F24]"
          >
            Confirm Password
          </label>

          <div className="relative">
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
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
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-[#0798F9]"
            >
              {showConfirmPassword ? (
                <Eye size={18} />
              ) : (
                <EyeOff size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC] focus:outline-none focus:ring-2 focus:ring-[#0798F9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{" "}
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
