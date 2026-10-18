
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { signInWithEmail } from "../../services/authService";

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const identifier = username.trim();

    if (!identifier || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    // Username-based login will be added through a secure
    // server-side authentication flow. For now, use email.
    if (!identifier.includes("@")) {
      setErrorMessage(
        "Username login is not configured yet. Please sign in using your email address for now."
      );
      return;
    }

    setLoading(true);

    try {
      await signInWithEmail({
        email: identifier,
        password,
      });

      // Supabase persists the session using the client defaults.
      // The Remember me option will be wired up separately.
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "The email or password is incorrect."
          : error.message ||
              "We couldn't sign you in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-center text-2xl font-bold tracking-wide text-[#080F24]">
        LOG IN
      </h2>

      <p className="mt-2 text-center text-sm text-gray-600">
        Welcome back to Techub!
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

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="login-username"
            className="mb-1.5 block text-sm font-medium text-[#080F24]"
          >
            Email Address
          </label>

          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your email address"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setErrorMessage("");
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-[#080F24]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage("");
              }}
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me and forgot password */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 accent-[#0798F9]"
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-[#0789DD] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC] focus:outline-none focus:ring-2 focus:ring-[#0798F9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "LOGGING IN..." : "LOG IN"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#0789DD] hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
