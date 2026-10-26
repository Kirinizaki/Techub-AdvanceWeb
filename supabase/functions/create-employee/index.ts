
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
        { error: "Only admins can manage staff accounts." },
        { status: 403, headers: corsHeaders },
      );
    }

    let body: Record<string, unknown>;
    try {
      const parsedBody = await req.json();
      if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
        return Response.json({ error: "A valid account action is required." }, { status: 400, headers: corsHeaders });
      }
      body = parsedBody as Record<string, unknown>;
    } catch {
      return Response.json({ error: "The request body must be valid JSON." }, { status: 400, headers: corsHeaders });
    }
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "list_users") {
      const allUsers = [];
      for (let page = 1; page <= 100; page += 1) {
        const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw new Error("Unable to load account list.");
        allUsers.push(...data.users);
        if (data.users.length < 1000) break;
      }
      if (allUsers.length >= 100_000) throw new Error("Account list exceeds the supported page limit.");
      const profilesById = new Map<string, Record<string, unknown>>();
      const rolesById = new Map<string, string>();
      for (let offset = 0; offset < allUsers.length; offset += 100) {
        const ids = allUsers.slice(offset, offset + 100).map((user) => user.id);
        const [profileResult, roleResult] = await Promise.all([
          adminClient.from("profiles").select("id, username, display_name, phone, created_at").in("id", ids),
          adminClient.from("user_roles").select("user_id, role").in("user_id", ids),
        ]);
        if (profileResult.error || roleResult.error) throw new Error("Unable to load account records.");
        for (const profile of profileResult.data ?? []) profilesById.set(profile.id, profile);
        for (const role of roleResult.data ?? []) rolesById.set(role.user_id, role.role);
      }
      const users = allUsers.map((user) => {
        const profile = profilesById.get(user.id);
        const bannedUntil = user.banned_until ? Date.parse(user.banned_until) : 0;
        const status = user.deleted_at || bannedUntil > Date.now()
          ? "Inactive"
          : user.email_confirmed_at
            ? "Active"
            : user.invited_at
              ? "Invited"
              : "Unknown";
        const role = rolesById.get(user.id);
        return {
          id: user.id,
          email: typeof user.email === "string" && user.email ? user.email : "Not available",
          name: typeof profile?.display_name === "string" && profile.display_name
            ? profile.display_name
            : typeof profile?.username === "string" && profile.username
              ? profile.username
              : "Not available",
          username: typeof profile?.username === "string" && profile.username ? profile.username : "Not available",
          phone: profile?.phone ?? "",
          createdAt: profile?.created_at ?? user.created_at,
          role: role === "admin" ? "Admin" : role === "employee" ? "Staff" : "User",
          isCurrentUser: user.id === caller.id,
          status,
        };
      }).filter((user) => user.role === "Admin" || user.role === "Staff");
      return Response.json({ users }, { headers: corsHeaders });
    }

    if (action === "send_password_reset") {
      const userId = typeof body.user_id === "string" ? body.user_id : "";
      if (!userId) return Response.json({ error: "A valid account is required." }, { status: 400, headers: corsHeaders });
      const { data: role, error: targetRoleError } = await adminClient.from("user_roles")
        .select("role").eq("user_id", userId).maybeSingle();
      if (targetRoleError || role?.role !== "employee") {
        return Response.json({ error: "Password reset is available for staff accounts only." }, { status: 404, headers: corsHeaders });
      }
      const { data: target, error: targetError } = await adminClient.auth.admin.getUserById(userId);
      if (targetError || !target.user?.email) {
        return Response.json({ error: "Unable to send the account recovery email." }, { status: 400, headers: corsHeaders });
      }
      const recoveryClient = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const redirectTo = typeof body.redirect_to === "string" ? body.redirect_to : undefined;
      const { error: recoveryError } = await recoveryClient.auth.resetPasswordForEmail(target.user.email, { redirectTo });
      if (recoveryError) return Response.json({ error: "Unable to send the account recovery email." }, { status: 400, headers: corsHeaders });
      return Response.json({ message: "Account recovery email sent." }, { headers: corsHeaders });
    }

    if (action === "set_role") {
      const userId = typeof body.user_id === "string" ? body.user_id : "";
      const role = typeof body.role === "string" ? body.role : "";
      if (!userId || !["customer", "employee", "admin"].includes(role)) {
        return Response.json({ error: "Choose a valid account and role." }, { status: 400, headers: corsHeaders });
      }
      if (userId === caller.id) {
        return Response.json({ error: "You cannot change your own role." }, { status: 403, headers: corsHeaders });
      }
      const { data: currentRole, error: currentRoleError } = await adminClient.from("user_roles")
        .select("role").eq("user_id", userId).maybeSingle();
      if (currentRoleError || !currentRole) return Response.json({ error: "No role record exists for this account." }, { status: 404, headers: corsHeaders });
      if (currentRole.role === "admin" && role !== "admin") {
        const { count, error: countError } = await adminClient.from("user_roles")
          .select("user_id", { count: "exact", head: true }).eq("role", "admin");
        if (countError) return Response.json({ error: "Unable to verify administrator coverage." }, { status: 500, headers: corsHeaders });
        if ((count ?? 0) <= 1) return Response.json({ error: "The last administrator cannot be demoted." }, { status: 409, headers: corsHeaders });
      }
      const { data: updated, error: updateError } = await adminClient.from("user_roles")
        .update({ role }).eq("user_id", userId).select("user_id");
      if (updateError) return Response.json({ error: "Unable to update this account role." }, { status: 400, headers: corsHeaders });
      if (!updated?.length) return Response.json({ error: "No role record exists for this account." }, { status: 404, headers: corsHeaders });
      return Response.json({ message: "Account role updated." }, { headers: corsHeaders });
    }

    if (action !== "create_staff") {
      return Response.json({ error: "Unsupported account action." }, { status: 400, headers: corsHeaders });
    }
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
    const { data: roleAssignment, error: updateRoleError } = await adminClient
      .from("user_roles")
      .update({ role: "employee" })
      .eq("user_id", employeeId)
      .select("user_id")
      .maybeSingle();

    const { data: profileRecord, error: profileError } = await adminClient
      .from("profiles").select("id").eq("id", employeeId).maybeSingle();

    if (updateRoleError || !roleAssignment || profileError || !profileRecord) {
      console.error("Employee setup failed:", updateRoleError?.message ?? profileError?.message ?? "Profile or role record missing");

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
