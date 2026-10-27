
import { supabase } from "./supabaseClient";
import { edgeFunctionErrorMessage } from "./edgeFunctionErrors";

export async function createStaff({
  email,
  username,
  displayName,
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("Please sign in first.");

  const { data, error } = await supabase.functions.invoke(
    "create-employee",
    {
      body: {
        action: "create_staff",
        email,
        username,
        display_name: displayName,
      },
    }
  );

  if (error) throw new Error(await edgeFunctionErrorMessage(error));
  if (data?.error) throw new Error(data.error);

  return data;
}

export async function resetStaffPassword(userId) {
  const { data, error } = await supabase.functions.invoke("create-employee", {
    body: { action: "send_password_reset", user_id: userId, redirect_to: `${window.location.origin}/reset-password` },
  });
  if (error) throw new Error(await edgeFunctionErrorMessage(error));
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getAdminUsers() {
  const { data, error } = await supabase.functions.invoke("create-employee", {
    body: { action: "list_users" },
  });
  const message = error ? await edgeFunctionErrorMessage(error) : data?.error;
  if (message === "Email and username are required.") {
    throw new Error("The account-management service is out of date. Deploy the latest create-employee function, then reload this page.");
  }
  if (message) throw new Error(message);
  if (!Array.isArray(data?.users)) {
    throw new Error("The account-management service returned an invalid user list. Deploy the latest create-employee function, then retry.");
  }
  return data.users;
}

export async function updateStaffRole(userId, role) {
  const roleValue = role === "Admin" ? "admin" : role === "Staff" ? "employee" : null;
  if (!roleValue) throw new Error("Choose Admin or Staff for this account.");
  const { data, error } = await supabase.functions.invoke("create-employee", {
    body: { action: "set_role", user_id: userId, role: roleValue },
  });
  if (error) throw new Error(await edgeFunctionErrorMessage(error));
  if (data?.error) throw new Error(data.error);
  return data;
}

