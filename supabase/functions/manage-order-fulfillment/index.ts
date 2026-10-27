import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const transitions: Record<string, string> = {
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceRoleKey) throw new Error("Missing server configuration.");
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return Response.json({ error: "Authentication required." }, { status: 401, headers: corsHeaders });

    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) return Response.json({ error: "Your session is invalid or expired." }, { status: 401, headers: corsHeaders });

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: role, error: roleError } = await adminClient.from("user_roles")
      .select("role").eq("user_id", user.id).maybeSingle();
    if (roleError) {
      console.error("Order permission lookup failed:", roleError.message);
      return Response.json({ error: "Unable to verify order permissions." }, { status: 500, headers: corsHeaders });
    }
    if (role?.role !== "admin" && role?.role !== "employee") return Response.json({ error: "You are not authorized to update orders." }, { status: 403, headers: corsHeaders });

    const body = await request.json();
    const orderId = typeof body.order_id === "string" ? body.order_id : "";
    const from = typeof body.from_status === "string" ? body.from_status : "";
    const to = typeof body.to_status === "string" ? body.to_status : "";
    if (!orderId || transitions[from] !== to) return Response.json({ error: "This order status transition is not allowed." }, { status: 400, headers: corsHeaders });

    const { data, error } = await adminClient.from("orders")
      .update({ order_status: to, updated_at: new Date().toISOString() })
      .eq("id", orderId).eq("order_status", from)
      .select("id, order_status").maybeSingle();
    if (error) {
      console.error("Order fulfillment update failed:", error.message);
      return Response.json({ error: "The order status could not be saved." }, { status: 500, headers: corsHeaders });
    }
    if (!data) return Response.json({ error: "Order not found or its status changed. Refresh the order list and try again." }, { status: 409, headers: corsHeaders });
    return Response.json({ order_id: data.id, order_status: data.order_status }, { headers: corsHeaders });
  } catch (error) {
    console.error("Order fulfillment operation failed:", error);
    return Response.json({ error: "The order status could not be updated." }, { status: 500, headers: corsHeaders });
  }
});
