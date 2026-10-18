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
      data: {
        username: normalizedUsername,
      },
    },
  });

  if (error) throw error;

  return data;
}

export async function signInWithEmail({
  email,
  password,
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;

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
