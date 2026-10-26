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
  if (!identifier.includes("@")) {
    const { data, error } = await supabase.functions.invoke(
      "username-to-email",
      {
        body: { identifier, password },
      }
    );

    if (error || data?.error || !data?.session?.access_token || !data?.session?.refresh_token) {
      throw new Error(
        "Invalid username or password."
      );
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (sessionError) throw sessionError;
    return { user: sessionData.user };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password });
  if (error) throw error;
  return { user: data.user };

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
