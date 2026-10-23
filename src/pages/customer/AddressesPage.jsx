
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react";

const emptyAddress = {
  recipient_name: "",
  phone: "+63",
  address_line: "",
  barangay: "",
  city: "",
  province: "",
  postal_code: "",
  is_default: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getInputClass = (fieldErrors, field) =>
  `${inputClass} ${fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`;

function normalizePhilippineMobile(value = "") {
  const digits = value.replace(/\D/g, "");
  let nationalNumber = digits;

  if (nationalNumber.startsWith("63")) {
    nationalNumber = nationalNumber.slice(2);
  }

  if (nationalNumber.startsWith("0")) {
    nationalNumber = nationalNumber.slice(1);
  }

  return `+63${nationalNumber}`;
}

function validateAddress(form) {
  const errors = {};
  const recipientName = form.recipient_name.trim();
  const addressLine = form.address_line.trim();
  const barangay = form.barangay.trim();
  const city = form.city.trim();
  const province = form.province.trim();
  const postalCode = form.postal_code.trim();
  const phone = form.phone.trim();

  if (!recipientName) {
    errors.recipient_name = "Recipient name is required.";
  } else if (recipientName.length < 2) {
    errors.recipient_name = "Enter a name with at least 2 characters.";
  } else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(recipientName)) {
    errors.recipient_name = "Use letters, spaces, apostrophes, periods, or hyphens only.";
  }

  if (!/^\+639\d{9}$/.test(phone)) {
    errors.phone = "Enter a valid Philippine mobile number, e.g. +639171234567.";
  }

  if (!addressLine) {
    errors.address_line = "House number, street, or building is required.";
  } else if (addressLine.length < 4) {
    errors.address_line = "Enter a more complete street address.";
  }

  if (!barangay) {
    errors.barangay = "Barangay is required.";
  } else if (!/^[\p{L}\p{M}\d\s.'’-]+$/u.test(barangay)) {
    errors.barangay = "Enter a valid barangay name.";
  }

  if (!city) {
    errors.city = "City or municipality is required.";
  } else if (!/^[\p{L}\p{M}\d\s.'’-]+$/u.test(city)) {
    errors.city = "Enter a valid city or municipality name.";
  }

  if (!province) {
    errors.province = "Province is required.";
  } else if (!/^[\p{L}\p{M}\d\s.'’-]+$/u.test(province)) {
    errors.province = "Enter a valid province name.";
  }

  if (!/^\d{4}$/.test(postalCode)) {
    errors.postal_code = "Enter a valid 4-digit Philippine postal code.";
  }

  return errors;
}

export default function AddressesPage() {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadAddresses() {
    if (!user?.id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(`Unable to load addresses: ${fetchError.message}`);
    } else {
      setAddresses(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  function startAdd() {
    setForm({ ...emptyAddress });
    setFieldErrors({});
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEdit(address) {
    setForm({
      recipient_name: address.recipient_name ?? "",
      phone: normalizePhilippineMobile(address.phone ?? ""),
      address_line: address.address_line ?? "",
      barangay: address.barangay ?? "",
      city: address.city ?? "",
      province: address.province ?? "",
      postal_code: address.postal_code ?? "",
      is_default: address.is_default ?? false,
    });

    setEditingId(address.id);
    setFieldErrors({});
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyAddress });
    setFieldErrors({});
    setError("");
  }

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    let nextValue = type === "checkbox" ? checked : value;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      let nationalNumber = digits;

      if (nationalNumber.startsWith("63")) {
        nationalNumber = nationalNumber.slice(2);
      }
      if (nationalNumber.startsWith("0")) {
        nationalNumber = nationalNumber.slice(1);
      }

      nextValue = `+63${nationalNumber.slice(0, 10)}`;
    }

    if (name === "postal_code") {
      nextValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      return { ...previous, [name]: "" };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationErrors = validateAddress(form);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError("Please correct the highlighted fields.");
      return;
    }

    if (!user?.id) {
      setError("Please sign in to manage your addresses.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        recipient_name: form.recipient_name.trim(),
        phone: form.phone.trim(),
        address_line: form.address_line.trim(),
        barangay: form.barangay.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        postal_code: form.postal_code.trim(),
        is_default: form.is_default || addresses.length === 0,
        updated_at: new Date().toISOString(),
      };

      // If this address will be the default, clear the existing default first.
      if (payload.is_default) {
        const { error: defaultError } = await supabase
          .from("shipping_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        if (defaultError) throw defaultError;
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("shipping_addresses")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
        setMessage("Address updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("shipping_addresses")
          .insert({
            ...payload,
            user_id: user.id,
          });

        if (insertError) throw insertError;
        setMessage("Address added successfully.");
      }

      closeForm();
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Unable to save this address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(address) {
    if (!user?.id || address.is_default) return;

    setError("");
    setMessage("");

    const { error: clearError } = await supabase
      .from("shipping_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (clearError) {
      setError(clearError.message);
      return;
    }

    const { error: setErrorResult } = await supabase
      .from("shipping_addresses")
      .update({
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", address.id)
      .eq("user_id", user.id);

    if (setErrorResult) {
      setError(setErrorResult.message);
      await loadAddresses();
      return;
    }

    setMessage("Default shipping address updated.");
    await loadAddresses();
  }

  function handleDelete(address) {
    setError("");
    setMessage("");
    setAddressToDelete(address);
  }

  async function confirmDeleteAddress() {
    if (!addressToDelete || !user?.id) return;

    const address = addressToDelete;
    setDeletingId(address.id);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("id", address.id)
      .eq("user_id", user.id);

    if (deleteError) {
      setError(`Unable to delete address: ${deleteError.message}`);
    } else {
      setMessage("Address deleted successfully.");
      setAddressToDelete(null);
      await loadAddresses();
    }

    setDeletingId(null);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#080F24]">
            Saved Shipping Addresses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage the addresses you use for your Techub orders.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0798F9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087FD0]"
          >
            <Plus size={17} />
            Add Address
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-[#080F24]">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close address form"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="recipient_name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Recipient Name *
              </label>
              <input
                id="recipient_name"
                name="recipient_name"
                value={form.recipient_name}
                onChange={updateField}
                className={getInputClass(fieldErrors, "recipient_name")}
                autoComplete="name"
                required
                maxLength={100}
              />
              {fieldErrors.recipient_name && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.recipient_name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                onFocus={() => {
                  if (!form.phone) {
                    setForm((previous) => ({ ...previous, phone: "+63" }));
                  }
                }}
                className={getInputClass(fieldErrors, "phone")}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+639171234567"
                required
                maxLength={13}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="address_line"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                House No., Street, Building *
              </label>
              <input
                id="address_line"
                name="address_line"
                value={form.address_line}
                onChange={updateField}
                className={getInputClass(fieldErrors, "address_line")}
                autoComplete="street-address"
                required
                maxLength={250}
              />
              {fieldErrors.address_line && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.address_line}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="barangay"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Barangay *
              </label>
              <input
                id="barangay"
                name="barangay"
                value={form.barangay}
                onChange={updateField}
                className={getInputClass(fieldErrors, "barangay")}
                required
                maxLength={100}
              />
              {fieldErrors.barangay && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.barangay}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                City / Municipality *
              </label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={updateField}
                className={getInputClass(fieldErrors, "city")}
                autoComplete="address-level2"
                required
                maxLength={100}
              />
              {fieldErrors.city && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.city}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="province"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Province *
              </label>
              <input
                id="province"
                name="province"
                value={form.province}
                onChange={updateField}
                className={getInputClass(fieldErrors, "province")}
                autoComplete="address-level1"
                required
                maxLength={100}
              />
              {fieldErrors.province && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.province}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="postal_code"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Postal Code *
              </label>
              <input
                id="postal_code"
                name="postal_code"
                value={form.postal_code}
                onChange={updateField}
                className={getInputClass(fieldErrors, "postal_code")}
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[0-9]{4}"
                required
                maxLength={4}
              />
              {fieldErrors.postal_code && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {fieldErrors.postal_code}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="is_default"
              checked={form.is_default}
              onChange={updateField}
              className="h-4 w-4 rounded border-slate-300"
            />
            Set as my default shipping address
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#0798F9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#087FD0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Save Address"}
            </button>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading saved addresses...
        </p>
      ) : showForm ? null : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <MapPin size={32} className="mx-auto text-slate-400" />
          <h3 className="mt-3 font-semibold text-[#080F24]">
            No saved addresses yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Add a shipping address to make your next checkout easier.
          </p>
          {!showForm && (
            <button
              type="button"
              onClick={startAdd}
              className="mt-4 rounded-lg bg-[#0798F9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#087FD0]"
            >
              Add Your First Address
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="wrap-break-word font-bold text-[#080F24]">
                    {address.recipient_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {address.phone}
                  </p>
                </div>

                {address.is_default && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <Star size={13} />
                    Default
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-600">
                <MapPin size={17} className="mt-1 shrink-0" />
                <p className="wrap-break-word">
                  {address.address_line}
                  {address.barangay && `, ${address.barangay}`}
                  {`, ${address.city}, ${address.province}, ${address.postal_code}`}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Set as Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => startEdit(address)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(address)}
                  disabled={deletingId === address.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  {deletingId === address.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {addressToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget && !deletingId) {
              setAddressToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
            aria-describedby="delete-address-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  id="delete-address-title"
                  className="text-lg font-bold text-[#080F24]"
                >
                  Delete shipping address?
                </h3>
                <p
                  id="delete-address-description"
                  className="mt-2 text-sm leading-6 text-slate-600"
                >
                  Are you sure you want to delete the shipping address for{" "}
                  <span className="font-semibold text-slate-800">
                    {addressToDelete.recipient_name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close delete confirmation"
                onClick={() => setAddressToDelete(null)}
                disabled={Boolean(deletingId)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={Boolean(deletingId)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deletingId ? "Deleting..." : "Delete Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
