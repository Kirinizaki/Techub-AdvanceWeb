
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // UI only: authentication will be connected later.
    if (!username.trim() || !password) {
      alert("Please enter your username and password.");
      return;
    }

    console.log("Login form submitted", {
      username,
      rememberMe,
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-center text-2xl font-bold tracking-wide text-[#080F24]">
        LOG IN
      </h2>

      <p className="mt-2 text-center text-sm text-gray-600">
        Welcome back to Techub!
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {/* Username */}
        <div>
          <label
            htmlFor="login-username"
            className="mb-1.5 block text-sm font-medium text-[#080F24]"
          >
            Username
          </label>

          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
            required
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
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
              required
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
          className="w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC] focus:outline-none focus:ring-2 focus:ring-[#0798F9] focus:ring-offset-2"
        >
          LOG IN
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
