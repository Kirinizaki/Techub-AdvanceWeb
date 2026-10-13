
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // UI only: account creation will be connected later.
    console.log("Signup form submitted", {
      username: formData.username,
      email: formData.email,
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-center text-2xl font-bold tracking-wide text-[#080F24]">
        CREATE ACCOUNT
      </h2>

      <p className="mt-2 text-center text-sm text-gray-600">
        Join the Techub community today!
      </p>

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
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
            required
          />
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

        {/* Confirm password */}
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#0798F9] focus:ring-2 focus:ring-[#0798F9]/20"
              required
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
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-md bg-[#0798F9] py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#087FCC] focus:outline-none focus:ring-2 focus:ring-[#0798F9] focus:ring-offset-2"
        >
          CREATE ACCOUNT
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
