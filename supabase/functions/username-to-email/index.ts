
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    const { identifier } = await req.json();

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

    // Email addresses can be passed directly to Supabase Auth.
    if (normalized.includes("@")) {
      return Response.json(
        { email: normalized },
        { headers: corsHeaders },
      );
    }

    if (!/^[a-z0-9_]{3,24}$/.test(normalized)) {
      return Response.json(
        { error: "Enter a valid username or email." },
        { status: 400, headers: corsHeaders },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", normalized)
      .maybeSingle();

    if (error) {
      console.error("Username lookup failed:", error.message);
      return Response.json(
        { error: "Unable to sign in right now. Please try again." },
        { status: 500, headers: corsHeaders },
      );
    }

    if (!profile) {
      return Response.json(
        { error: "Invalid username or password." },
        { status: 401, headers: corsHeaders },
      );
    }

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (userError || !userData.user?.email) {
      console.error("User email lookup failed:", userError?.message);
      return Response.json(
        { error: "Unable to sign in right now. Please try again." },
        { status: 500, headers: corsHeaders },
      );
    }

    return Response.json(
      { email: userData.user.email },
      { headers: corsHeaders },
    );
  } catch {
    return Response.json(
      { error: "Invalid request." },
      { status: 400, headers: corsHeaders },
    );
  }
});
