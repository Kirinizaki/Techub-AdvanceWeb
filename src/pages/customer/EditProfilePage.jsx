
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserRound, Save, X } from "lucide-react";

import {
  getProfile,
  saveProfile,
} from "../../data/accountMockData";

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => getProfile());
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    saveProfile({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    navigate("/account/profile", {
      state: { profileUpdated: true },
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#080F24] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/account/profile"
          aria-label="Back to My Account"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h2 className="text-xl font-bold text-[#080F24]">
            Edit Profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update your personal and contact information.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={32} />
            )}
          </div>

          <div>
            <p className="font-semibold text-[#080F24]">
              Profile Information
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Manage the details associated with your account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={updateField}
              className={inputClass}
              autoComplete="given-name"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={updateField}
              className={inputClass}
              autoComplete="family-name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              className={inputClass}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              className={inputClass}
              autoComplete="tel"
              placeholder="+63 9XX XXX XXXX"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className={labelClass}>
              Date of Birth
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={updateField}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="px-5 pb-4 text-sm text-rose-600 sm:px-6">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
          <Link
            to="/account/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <X size={16} />
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0798F9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087FD0]"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </form>

      <p className="text-xs leading-5 text-slate-500">
        Demo mode: changes are saved in this browser. Email changes are
        not yet synchronized with an authentication provider.
      </p>
    </div>
  );
}
