
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const loginResponseHeaders = { ...corsHeaders, "Cache-Control": "no-store", Pragma: "no-cache" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const body = await req.json();
    const { identifier } = body;

    if (
      typeof identifier !== "string" ||
      identifier.trim().length === 0
    ) {
      return Response.json(
        { error: "Enter your username or email." },
        { status: 400, headers: corsHeaders },
      );
    }

    const normalized = identifier.trim().toLowerCase();

    if (!normalized.includes("@") && !/^[a-z0-9_]{3,24}$/.test(normalized)) {
      return Response.json(
        { error: "Enter a valid username or email." },
        { status: 400, headers: corsHeaders },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Required server configuration is missing.");
    }

    // Unknown usernames also perform a password-auth request against a
    // reserved invalid domain. This avoids making username lookup a cheap
    // bypass around Auth's credential-attempt rate limits.
    let loginEmail = normalized.includes("@") ? normalized : "unknown-user@invalid.invalid";
    if (!normalized.includes("@")) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles").select("id").eq("username", normalized).maybeSingle();
      if (profileError) {
        console.error("Username lookup failed:", profileError.message);
        throw new Error("Unable to verify credentials");
      }
      if (profile) {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        if (!userError && userData.user?.email) loginEmail = userData.user.email;
      }
    }

    // Resolve and verify the credentials in one server-side flow. Never send
    // the user's private email address to the unauthenticated browser.
    const loginClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: login, error: loginError } = await loginClient.auth.signInWithPassword({
      email: loginEmail,
      password: typeof body.password === "string" ? body.password : "",
    });
    if (loginError || !login.session || !login.user) {
      throw new Error("Invalid credentials");
    }

    return Response.json({ session: login.session }, { headers: loginResponseHeaders });
  } catch {
    return Response.json({ error: "Invalid username or password." }, { status: 401, headers: corsHeaders });
  }
});
