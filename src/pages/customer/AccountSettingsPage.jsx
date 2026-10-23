
import { useEffect, useRef, useState } from "react";
import {
  LockKeyhole,
  UserRound,
  Camera,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function AccountSettingsPage() {
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarSaving, setAvatarSaving] = useState(false);
    const fileInputRef = useRef(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const { user } = useAuth();

    const [activeSection, setActiveSection] = useState("account");
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", user.id)
            .single();

        if (error) {
            setError("Unable to load your account details.");
        } else {
            setUsername(data.username ?? "");
            setDisplayName(data.display_name ?? "");
            
            const savedAvatar = data.avatar_url ?? "";
            setAvatarUrl(savedAvatar);

            if (savedAvatar.startsWith("http")) {
            setAvatarPreview(savedAvatar);
            } else if (savedAvatar) {
            const { data: imageData, error: imageError } = await supabase.storage
                .from("profile-avatars")
                .createSignedUrl(savedAvatar, 3600);

            if (imageError) {
                console.error("Unable to load profile image:", imageError);
                setAvatarPreview("");
            } else {
                setAvatarPreview(imageData.signedUrl);
            }
            } else {
            setAvatarPreview("");
            }
        }

        setLoading(false);
        }

        loadProfile();
    }, [user?.id]);

    async function handleSave(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        const cleanedUsername = username.trim().toLowerCase();
        const cleanedDisplayName = displayName.trim();

        if (!/^[a-z0-9_]{3,24}$/.test(cleanedUsername)) {
        setError(
            "Username must be 3–24 characters and use only lowercase letters, numbers, or underscores."
        );
        return;
        }

        if (cleanedDisplayName.length > 80) {
        setError("Display name must be 80 characters or fewer.");
        return;
        }

        setSaving(true);

        const { error: saveError } = await supabase
        .from("profiles")
        .update({
            username: cleanedUsername,
            display_name: cleanedDisplayName || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

        setSaving(false);

        if (saveError) {
        if (saveError.code === "23505") {
            setError("That username is already taken.");
        } else {
            setError(saveError.message || "Unable to save your changes.");
        }
        return;
        }

        setUsername(cleanedUsername);
        setDisplayName(cleanedDisplayName);
        setMessage("Your account details have been saved.");
    }

    const sections = [
        { id: "account", label: "Account Details", icon: UserRound },
        { id: "password", label: "Password", icon: LockKeyhole },
    ];

    function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        event.target.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setError("Please choose an image smaller than 5 MB.");
        event.target.value = "";
        return;
    }

    setError("");
    setMessage("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    }
    
    async function handleAvatarSave() {
    if (!user?.id || !avatarFile) return;

    setAvatarSaving(true);
    setError("");
    setMessage("");

    // Keep the previous image path in case we need to delete it later.
    const previousAvatar = avatarUrl;

    const fileExtension = avatarFile.name.split(".").pop()?.toLowerCase();
    const safeExtension = /^[a-z0-9]+$/.test(fileExtension ?? "")
        ? fileExtension
        : "jpg";

    const filePath = `${user.id}/avatar-${Date.now()}.${safeExtension}`;

    // 1. Upload the new image.
    const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, avatarFile, {
        upsert: true,
        contentType: avatarFile.type,
        });

    if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setAvatarSaving(false);
        return;
    }

    // 2. Update the database to use the new image.
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
        avatar_url: filePath,
        updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        // Clean up the new upload if the database update fails.
        const { error: cleanupError } = await supabase.storage
        .from("profile-avatars")
        .remove([filePath]);

        if (cleanupError) {
        console.error("Failed to clean up new profile image:", cleanupError);
        }

        setError(
        `Image uploaded, but saving the profile failed: ${updateError.message}`
        );
        setAvatarSaving(false);
        return;
    }

    // 3. The database now points to the new image.
    setAvatarUrl(filePath);
    setAvatarFile(null);
    setAvatarSaving(false);
    setMessage("Profile image updated successfully.");

    // 4. Delete the previous image, if it belongs to this user's folder.
    if (
        previousAvatar &&
        !previousAvatar.startsWith("http") &&
        previousAvatar !== filePath &&
        previousAvatar.startsWith(`${user.id}/`)
    ) {
        const { error: deleteError } = await supabase.storage
        .from("profile-avatars")
        .remove([previousAvatar]);

        if (deleteError) {
        console.error("Failed to delete previous profile image:", deleteError);
        setMessage(
            "Profile image updated, but the previous image could not be deleted."
        );
        }
    }
    }
    
    async function handlePasswordChange(event) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!user?.email) {
        setPasswordError("Unable to identify your account email.");
        return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError("Please fill in all password fields.");
        return;
    }

    if (newPassword.length < 8) {
        setPasswordError("Your new password must be at least 8 characters.");
        return;
    }

    if (newPassword === currentPassword) {
        setPasswordError("Your new password must differ from your current password.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordError("The new passwords do not match.");
        return;
    }

    setPasswordSaving(true);

    try {
        // Verify the current password by re-authenticating.
        const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
        });

        if (verifyError) {
        setPasswordError("Your current password is incorrect.");
        return;
        }

        // Update the password for the authenticated account.
        const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        });

        if (updateError) {
        setPasswordError(updateError.message);
        return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMessage("Your password has been changed successfully.");
    } catch {
        setPasswordError("Something went wrong. Please try again.");
    } finally {
        setPasswordSaving(false);
    }
    }

    return (
        <section className="space-y-5">
        <div>
            <h2 className="text-xl font-bold text-[#080F24]">
            Account Settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
            Manage your account information and security preferences.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
            <nav
            aria-label="Settings sections"
            className="h-fit rounded-xl border border-slate-200 bg-white p-2"
            >
            {sections.map(({ id, label, icon: Icon }) => (
                <button
                key={id}
                type="button"
                onClick={() => {
                    setActiveSection(id);
                    setMessage("");
                    setError("");
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                    activeSection === id
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                >
                <Icon size={17} />
                {label}
                </button>
            ))}
            </nav>

            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            {activeSection === "account" && (
                <div>
                <h3 className="text-base font-bold text-[#080F24]">
                    Account Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Update the personal information associated with your account.
                </p>

                {loading ? (
                    <p className="mt-6 text-sm text-slate-500">
                    Loading account details...
                    </p>
                ) : (
                    <>
                        <div className="mt-6 border-b border-slate-200 pb-6">
                        <h4 className="text-sm font-semibold text-[#080F24]">
                            Profile Image
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                            Upload a profile photo. JPG, PNG, or WebP, up to 5 MB.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-5">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                            {avatarPreview ? (
                                <img
                                src={avatarPreview}
                                alt="Profile preview"
                                className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserRound size={36} className="text-slate-400" />
                            )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <Camera size={16} />
                                Choose Image
                            </button>

                            {avatarFile && (
                                <button
                                type="button"
                                onClick={() => {
                                    setAvatarPreview(avatarUrl);
                                    setAvatarFile(null);
                                    setError("");
                                    if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                    }
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                <X size={16} />
                                Cancel
                                </button>
                            )}

                            {avatarFile && (
                                <button
                                type="button"
                                onClick={handleAvatarSave}
                                disabled={avatarSaving}
                                className="rounded-lg bg-[#0798F9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087FD0] disabled:opacity-60"
                                >
                                {avatarSaving ? "Uploading..." : "Save Image"}
                                </button>
                            )}
                            </div>
                        </div>
                        </div>

                        <form onSubmit={handleSave} className="mt-6 space-y-5">
                        <div>
                            <label
                            htmlFor="settings-email"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                            Email address
                            </label>
                            <input
                            id="settings-email"
                            type="email"
                            value={user?.email ?? ""}
                            readOnly
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                            Email changes are not available here yet.
                            </p>
                        </div>

                        <div>
                            <label
                            htmlFor="settings-username"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                            Username
                            </label>
                            <input
                            id="settings-username"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            minLength={3}
                            maxLength={24}
                            autoComplete="username"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                            Use 3–24 lowercase letters, numbers, or underscores.
                            </p>
                        </div>

                        <div>
                            <label
                            htmlFor="settings-display-name"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                            Display name
                            </label>
                            <input
                            id="settings-display-name"
                            type="text"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            maxLength={80}
                            autoComplete="name"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                            This is the name displayed on your account.
                            </p>
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-red-600">
                            {error}
                            </p>
                        )}

                        {message && (
                            <p role="status" className="text-sm text-green-700">
                            {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#0798F9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087FD0] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                    </>
                )}
                </div>
            )}

            {activeSection === "password" && (
                <div>
                    <h3 className="text-base font-bold text-[#080F24]">
                        Change Password
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Enter your current password and choose a new one.
                    </p>

                    <form
                        onSubmit={handlePasswordChange}
                        className="mt-6 max-w-lg space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="current-password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    data-lpignore="true"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword((previous) => !previous)}
                                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-800"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="new-password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    data-lpignore="true"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    minLength={8}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((previous) => !previous)}
                                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-800"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Use at least 8 characters.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    data-lpignore="true"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    minLength={8}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((previous) => !previous)}
                                    aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-800"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {passwordError && (
                            <p role="alert" className="text-sm text-red-600">
                                {passwordError}
                            </p>
                        )}

                        {passwordMessage && (
                            <p role="status" className="text-sm text-green-700">
                                {passwordMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="rounded-lg bg-[#0798F9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087FD0] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {passwordSaving ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            )}

            </div>
        </div>
        </section>
    );
}
