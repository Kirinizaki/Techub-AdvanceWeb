import { supabase } from "../lib/supabaseClient";

const APP_URL = window.location.origin;

export async function signUp({
  username,
  email,
  password,
}) {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
    throw new Error(
      "Username must be 3–24 characters using lowercase letters, numbers, or underscores."
    );
  }
  
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: `${APP_URL}/login`,
      data: { username: normalizedUsername },
    },
  });

  if (error) {
    const message = error.message?.toLowerCase() ?? "";

    if (
      message.includes("profiles_username_lower_unique") ||
      message.includes("duplicate key") ||
      message.includes("already exists")
    ) {
      throw new Error(
        "This username is already taken. Please choose another one."
      );
    }

    if (message.includes("password")) {
      throw new Error(
        "Your password does not meet the requirements. Please try another one."
      );
    }

    if (
      message.includes("user already registered") ||
      message.includes("already been registered")
    ) {
      throw new Error(
        "An account with this email may already exist. Try logging in instead."
      );
    }

    throw new Error("Unable to create your account. Please try again.");
  }

  return data;
}


export async function signInWithEmail({ email, password }) {
  const identifier = email.trim().toLowerCase();

  let loginEmail = identifier;

  // If the user entered a username, resolve it to an email first.
  if (!identifier.includes("@")) {
    const { data, error } = await supabase.functions.invoke(
      "username-to-email",
      {
        body: { identifier },
      }
    );

    console.log("Username lookup response:", { data, error });

    if (error || data?.error || !data?.email) {
      throw new Error(
        data?.error || "Invalid username or password."
      );
    }

    loginEmail = data.email;
  }

  // Authenticate using the resolved email and password.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  if (error) {
    throw new Error("Invalid username/email or password.");
  }

  return data;
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${APP_URL}/reset-password`,
    }
  );

  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
