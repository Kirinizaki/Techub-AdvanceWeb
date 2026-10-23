
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Required server configuration is missing.");
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401, headers: corsHeaders },
      );
    }

    // Validate the caller's access token using Supabase Auth.
    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: authorization },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user: caller },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !caller) {
      return Response.json(
        { error: "Invalid or expired session." },
        { status: 401, headers: corsHeaders },
      );
    }

    // Check the caller's role using a server-side client.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: roleRecord, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (roleError) {
      console.error("Role lookup failed:", roleError.message);

      return Response.json(
        { error: "Unable to verify permissions." },
        { status: 500, headers: corsHeaders },
      );
    }

    if (roleRecord?.role !== "admin") {
      return Response.json(
        { error: "Only admins can create employee accounts." },
        { status: 403, headers: corsHeaders },
      );
    }

    const body = await req.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";
    const displayName =
      typeof body.display_name === "string"
        ? body.display_name.trim()
        : "";

    if (!email || !username) {
      return Response.json(
        { error: "Email and username are required." },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return Response.json(
        {
          error:
            "Username must be 3–24 characters and use lowercase letters, numbers, or underscores.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Invite the employee instead of setting a password in the admin UI.
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          username,
          display_name: displayName || "",
        },
      });

    if (inviteError || !inviteData.user) {
      console.error("Employee invitation failed:", inviteError?.message);

      return Response.json(
        {
          error: inviteError?.message || "Unable to invite employee.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const employeeId = inviteData.user.id;

    // The auth trigger creates the profile and initial customer role.
    // Promote the new account to employee using the privileged client.
    const { error: updateRoleError } = await adminClient
      .from("user_roles")
      .update({ role: "employee" })
      .eq("user_id", employeeId);

    if (updateRoleError) {
      console.error("Employee role assignment failed:", updateRoleError.message);

      // Avoid leaving an invited account with the wrong role.
      const { error: deleteError } =
        await adminClient.auth.admin.deleteUser(employeeId);

      if (deleteError) {
        console.error("Cleanup failed:", deleteError.message);
      }

      return Response.json(
        { error: "Employee setup failed. Please try again." },
        { status: 500, headers: corsHeaders },
      );
    }

    return Response.json(
      {
        message: "Employee invitation sent successfully.",
        employee: {
          id: employeeId,
          email,
          username,
          role: "employee",
        },
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Create employee error:", error);

    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500, headers: corsHeaders },
    );
  }
});
