
import { supabase } from "./supabaseClient";

export async function createStaff({
  email,
  username,
  displayName,
  password,
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Please sign in first.");

  const { data, error } = await supabase.functions.invoke(
    "admin-manage-staff",
    {
      body: {
        action: "create_staff",
        email,
        username,
        display_name: displayName,
        password,
      },
    }
  );

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

export async function resetStaffPassword(userId, newPassword) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Please sign in first.");

  const { data, error } = await supabase.functions.invoke(
    "admin-manage-staff",
    {
      body: {
        action: "reset_password",
        user_id: userId,
        new_password: newPassword,
      },
    }
  );

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
  
}

export async function getAdminUsers() {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, display_name, phone, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id, role");

  if (rolesError) throw rolesError;

  return profiles.map((profile) => {
    const userRole = roles.find(
      (item) => item.user_id === profile.id
    );

    return {
      id: profile.id,
      name: profile.display_name || profile.username || "Unnamed User",
      email: "",
      role:
        userRole?.role === "admin"
          ? "Admin"
          : userRole?.role === "employee"
            ? "Staff"
            : "User",
      username: profile.username || "",
      phone: profile.phone || "",
      createdAt: profile.created_at,
    };
  });
}

