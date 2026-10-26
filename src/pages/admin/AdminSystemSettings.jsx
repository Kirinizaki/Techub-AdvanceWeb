import { useEffect, useState } from 'react';
import {
  Users,
  ChevronRight,
  Building2,
  Clock,
  CalendarDays,
  CircleDollarSign,
  Languages,
  Save,
  RotateCcw,
  UserRound,
  CheckCircle2,
  Plus,
  X,
  Pencil,
  UserPlus,
  Search,
  UserCheck,
  UserX,
  Mail,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import {
  createStaff,
  resetStaffPassword,
  getAdminUsers,
} from '../../lib/adminStaffService';
import AdminLayout from '../../layouts/AdminLayout';

/* ---------- Default settings ---------- */

const defaultSettings = {
  companyName: 'TechHub Inc.',
  timeZone: 'Asia/Manila',
  currency: 'PHP',
  dateFormat: 'MMM D, YYYY',
  language: 'English',
  twoFactor: true,
  sessionTimeout: '30 minutes',
  passwordPolicy: true,
  emailNotifications: true,
  orderNotifications: true,
  inventoryNotifications: true,
  securityNotifications: true,
};

const settingsTabs = [
  { label: 'User & Role Management', icon: Users },
];

/* ---------- Available roles ---------- */

/* Admin, Staff, and User can be assigned through this page. */
const availableRoles = ['Admin', 'Staff', 'User'];

/* Role descriptions shown in the reference section. */
const roleDetails = [
  {
    name: 'Admin',
    description:
      'Manage products, orders, inventory, reports, and system settings.',
    access: 'Admin access',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    name: 'Staff',
    description:
      'Process assigned orders and update inventory.',
    access: 'Limited access',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    name: 'User',
    description:
      'Shop for products, manage a profile, and view personal orders.',
    access: 'Customer access',
    color: 'bg-emerald-50 text-emerald-700',
  },
];

/* ---------- Reusable components ---------- */

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-medium text-slate-600">
        {label}
      </span>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        {children}
      </div>
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
  label,
  icon: Icon,
}) {
  return (
    <Field label={label} icon={Icon}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronRight
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
      />
    </Field>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}




/* ---------- User and role management ---------- */


function UserRoleSettings({
  users,
  usersLoading,
  usersError,
  onAddUser,
  onEditUser,
  onToggleUser,
}) {

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [userNotice, setUserNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetUser, setResetUser] = useState(null);
const [newPassword, setNewPassword] = useState('');
const [resetError, setResetError] = useState('');
const [isResetting, setIsResetting] = useState(false);
  const emptyForm = {
    name: '',
    email: '',
    role: 'Staff',
    password: '',
  };

  const [form, setForm] = useState({ ...emptyForm });

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError('');
    setUserNotice('');
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingId(user.id);

    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });

    setFormError('');
    setUserNotice('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError('');
  };

  
const handleSubmit = async (event) => {
  event.preventDefault();

  setFormError('');
  setUserNotice('');

  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();

  if (!name || !email || !form.role) {
    setFormError('Please complete all required fields.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFormError('Please enter a valid email address.');
    return;
  }

  if (editingId) {
    setFormError(
      'Editing accounts is not connected to the database yet.'
    );
    return;
  }

  if (form.role !== 'Staff') {
    setFormError(
      'Only Staff account creation is connected. Admin and User creation need separate secure handling.'
    );
    return;
  }

  if (form.password.length < 12) {
    setFormError(
      'The temporary password must be at least 12 characters.'
    );
    return;
  }

  try {
    setIsSubmitting(true);

    const username = email.split('@')[0].toLowerCase();

    await createStaff({
  email,
  username,
  displayName: name,
  password: form.password,
});

const updatedUsers = await getAdminUsers();
onAddUser(updatedUsers);
closeForm();
setUserNotice(
  'Staff account created. Email confirmation may be required before sign-in.'
);
  } catch (error) {
    setFormError(
      error.message || 'Unable to create the Staff account.'
    );
  } finally {
    setIsSubmitting(false);
  }
  
};

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setResetError('');
    setUserNotice('');

    if (!resetUser) return;

    if (newPassword.length < 12) {
      setResetError('The new password must be at least 12 characters.');
      return;
    }

    try {
      setIsResetting(true);

      await resetStaffPassword(resetUser.id, newPassword);

      setUserNotice(
        `Password reset successfully for ${resetUser.name}.`
      );
      setResetUser(null);
      setNewPassword('');
    } catch (error) {
      setResetError(
        error.message || 'Unable to reset the staff password.'
      );
    } finally {
      setIsResetting(false);
    }
  };


  const activeCount = users.filter(
    (user) => user.status === 'Active'
  ).length;

  const inactiveCount = users.length - activeCount;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            icon={Users}
            title="User & Role Management"
            description="Add users, assign roles, and manage account access."
          />

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:self-center"
          >
            <Plus size={15} />
            Add New User
          </button>
        </div>

        {/* User summary cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-xs font-medium text-slate-500">
              Total Users
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {users.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-xs font-medium text-slate-500">
              Active Accounts
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {activeCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-xs font-medium text-slate-500">
              Inactive Accounts
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-600">
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* Add and edit form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
                  {editingId ? (
                    <Pencil size={17} />
                  ) : (
                    <UserPlus size={17} />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingId ? 'Edit User' : 'Add New User'}
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {editingId
                      ? 'Update user details and assigned role.'
                      : 'Enter the user details and choose an access role.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close user form"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Employee / User Name *" icon={UserRound}>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter full name"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </Field>

              <Field label="Email Address *" icon={Mail}>
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="user@techhub.com"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </Field>

              <Field label="Assigned Role *" icon={Shield}>
                <select
                  required
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <ChevronRight
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                />
              </Field>

              {!editingId && (
                <Field label="Temporary Password *" icon={ShieldCheck}>
                  <input
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="At least 12 characters"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>
              )}
            </div>

           

            {formError && (
              <p
                role="alert"
                className="mt-3 text-xs font-medium text-rose-600"
              >
                {formError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Save size={14} />
                {isSubmitting
                  ? 'Creating Staff...'
                  : editingId
                  ? 'Save User'
                  : 'Add User'}
              </button>
            </div>
          </form>
        )}
        
        {resetUser && (
          <form
            onSubmit={handlePasswordReset}
            className="mt-5 rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Reset Staff Password
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Set a new password for {resetUser.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setResetUser(null);
                  setNewPassword('');
                  setResetError('');
                }}
                aria-label="Close password reset form"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white"
              >
                <X size={17} />
              </button>
            </div>

            <Field label="New Password *" icon={ShieldCheck}>
              <input
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 12 characters"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            {resetError && (
              <p role="alert" className="mt-3 text-xs font-medium text-rose-600">
                {resetError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetUser(null);
                  setNewPassword('');
                  setResetError('');
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isResetting}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {userNotice && (
          <p role="status" className="mt-3 text-xs text-emerald-700">
            {userNotice}
          </p>
        )}

        {/* Search */}
        <div className="mt-5 flex h-9 items-center gap-2 rounded-lg bg-blue-50 px-3">
          <Search size={14} className="shrink-0 text-slate-500" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role..."
            aria-label="Search users"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        {usersLoading && (
  <p role="status" className="mt-4 text-xs text-slate-500">
    Loading users from Supabase...
  </p>
)}

{usersError && (
  <p role="alert" className="mt-4 text-xs text-rose-600">
    Could not load users: {usersError}
  </p>
)}
        {/* User table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-162.5 text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-3">Employee / User</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Account Status</th>
                <th className="py-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <UserRound size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          {user.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        user.role === 'Admin'
                          ? 'bg-blue-50 text-blue-700'
                          : user.role === 'Staff'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />

                      {user.status}
                    </span>
                  </td>

                  <td className="py-3 pl-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditForm(user)}
                        aria-label={`Edit ${user.name}`}
                        title="Edit user"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={13} />
                      </button>
                        
{user.role === 'Staff' && (
  <button
    type="button"
    onClick={() => {
      setResetUser(user);
      setNewPassword('');
      setResetError('');
      setUserNotice('');
    }}
    aria-label={`Reset password for ${user.name}`}
    title="Reset staff password"
    className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-100 text-amber-600 hover:bg-amber-50"
  >
    <ShieldCheck size={14} />
  </button>
)}

                      <button
                        type="button"
                        onClick={() => onToggleUser(user.id)}
                        aria-label={
                          user.status === 'Active'
                            ? `Deactivate ${user.name}`
                            : `Activate ${user.name}`
                        }
                        title={
                          user.status === 'Active'
                            ? 'Deactivate user'
                            : 'Activate user'
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          user.status === 'Active'
                            ? 'border-rose-100 text-rose-500 hover:bg-rose-50'
                            : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'Active' ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!usersLoading && !usersError && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={24} className="text-slate-300" />

                      <p className="text-xs font-semibold text-slate-600">
                        {users.length === 0
                          ? 'No users added yet'
                          : 'No matching users'}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        {users.length === 0
                          ? 'Select Add New User to create a record.'
                          : 'Try a different search term.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          Showing {filteredUsers.length} of {users.length} user record
          {users.length === 1 ? '' : 's'}
        </div>
      </section>

      {/* Role reference */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <SectionHeading
          icon={ShieldCheck}
          title="Available Roles & Permissions"
          description="Reference guide for the access levels available in TechHub."
        />

        <div className="mt-4 space-y-3">
          {roleDetails.map((role) => (
            <div
              key={role.name}
              className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UserRound size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">
                    {role.name}
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {role.description}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${role.color}`}
              >
                {role.access}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-700">
          Admin, Staff, and User are the roles available through this page.
          Role descriptions are informational; actual permissions must be
          enforced by your backend and authentication system.
        </p>
      </section>
    </div>
  );
}





/* ---------- Main System Settings page ---------- */

export default function AdminSystemSettings({onLogout}) {
  const [activeTab, setActiveTab] = useState('User & Role Management');
  const [settings, setSettings] = useState({ ...defaultSettings });
  const [users, setUsers] = useState([]);
const [usersLoading, setUsersLoading] = useState(true);
const [usersError, setUsersError] = useState('');
  const [notice, setNotice] = useState('');

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setNotice('');
  };
  useEffect(() => {
  let isMounted = true;

  async function loadUsers() {
    try {
      setUsersLoading(true);
      setUsersError('');

      const data = await getAdminUsers();

      if (isMounted) {
        setUsers(data);
      }
    } catch (error) {
      if (isMounted) {
        setUsersError(
          error.message || 'Unable to load users.'
        );
      }
    } finally {
      if (isMounted) {
        setUsersLoading(false);
      }
    }
  }

  loadUsers();

  return () => {
    isMounted = false;
  };
}, []);
 
const addUser = (updatedUsers) => {
  setUsers(updatedUsers);
};


  const editUser = (id, updatedDetails) => {
    if (!availableRoles.includes(updatedDetails.role)) {
      setNotice('Please select a valid role.');
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, ...updatedDetails }
          : user
      )
    );

    setNotice('User details updated.');
  };

  const toggleUserStatus = (id) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === 'Active' ? 'Inactive' : 'Active',
            }
          : user
      )
    );

    setNotice('');
  };

  const resetSettings = () => {
    setSettings({ ...defaultSettings });
    setNotice('Settings have been reset to their default values.');
  };

  const saveSettings = () => {
    setNotice(
      'Settings are updated in this session. Connect a backend to save permanently.'
    );
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="w-full min-w-0 space-y-4 text-slate-800">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            System Settings
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage users and operational configurations.
          </p>
        </div>

        {/* Settings category navigation */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {settingsTabs.map(({ label, icon: Icon }) => {
            const active = activeTab === label;

            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActiveTab(label);
                  setNotice('');
                }}
                aria-pressed={active}
                className={`flex min-h-17 min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition-colors sm:gap-3 sm:p-4 ${
                  active
                    ? 'border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                    : 'border-slate-100 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active
                      ? 'bg-white text-blue-600'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <Icon size={18} />
                </span>

                <span className="min-w-0 flex-1 text-xs font-semibold leading-snug">
                  {label}
                </span>

                <ChevronRight
                  size={14}
                  className="hidden shrink-0 sm:block"
                />
              </button>
            );
          })}
        </div>

        {/* Active settings section */}
        <div className="min-w-0">
          {activeTab === 'User & Role Management' && (
            
<UserRoleSettings
  users={users}
  usersLoading={usersLoading}
  usersError={usersError}
  onAddUser={addUser}
  onEditUser={editUser}
  onToggleUser={toggleUserStatus}
/>

          )}

       </div>

        {/* Save and reset actions */}
        <section className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={saveSettings}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <Save size={14} />
            Save Changes
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          {notice && (
            <p
              role="status"
              className="flex w-full items-center gap-1.5 text-xs text-emerald-700 sm:ml-auto sm:w-auto"
            >
              <CheckCircle2 size={14} />
              {notice}
            </p>
          )}
        </section>

        {/* Page footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-[10px] text-slate-500 shadow-sm">
          <p>© 2026 TechHub Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-3">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>

            <span className="text-slate-300">|</span>

            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>

            <span className="text-slate-300">|</span>

            <a href="#" className="hover:text-blue-600">
              Support Center
            </a>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
}