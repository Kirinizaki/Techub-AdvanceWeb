import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceRoleKey) throw new Error("Missing server configuration.");

    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return Response.json({ error: "Authentication required." }, { status: 401, headers: corsHeaders });
    }
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Your session is invalid or expired." }, { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: role, error: roleError } = await adminClient.from("user_roles")
      .select("role").eq("user_id", user.id).maybeSingle();
    if (roleError) {
      console.error("Inventory permission lookup failed:", roleError.message);
      return Response.json({ error: "Unable to verify inventory permissions." }, { status: 500, headers: corsHeaders });
    }
    if (role?.role !== "admin" && role?.role !== "employee") {
      return Response.json({ error: "You are not authorized to update inventory." }, { status: 403, headers: corsHeaders });
    }

    const body = await request.json();
    const productId = typeof body.product_id === "string" ? body.product_id : "";
    const action = body.action;
    const quantity = body.quantity;
    if (!productId || !["set", "add"].includes(action) || !Number.isSafeInteger(quantity) || quantity < 0 || (action === "add" && quantity === 0)) {
      return Response.json({ error: "Enter a valid product and nonnegative whole-number quantity." }, { status: 400, headers: corsHeaders });
    }
    if (action === "set" && (!Number.isSafeInteger(body.expected_stock) || body.expected_stock < 0)) {
      return Response.json({ error: "The current stock value is missing. Refresh inventory and try again." }, { status: 400, headers: corsHeaders });
    }

    let currentStock = action === "set" ? body.expected_stock : null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      if (currentStock === null) {
        const current = await adminClient.from("products").select("stock_quantity").eq("id", productId).maybeSingle();
        if (current.error) {
          console.error("Could not read stock quantity:", current.error.message);
          return Response.json({ error: "Unable to read the current stock quantity." }, { status: 500, headers: corsHeaders });
        }
        if (!current.data) return Response.json({ error: "Product not found." }, { status: 404, headers: corsHeaders });
        currentStock = Number(current.data.stock_quantity);
      }
      if (!Number.isSafeInteger(currentStock) || currentStock < 0) {
        return Response.json({ error: "The stored stock quantity is invalid." }, { status: 409, headers: corsHeaders });
      }
      if (action === "set" && currentStock !== body.expected_stock) {
        return Response.json({ error: "Stock changed elsewhere. Refresh and review the current quantity." }, { status: 409, headers: corsHeaders });
      }
      const nextStock = action === "set" ? quantity : currentStock + quantity;
      if (!Number.isSafeInteger(nextStock)) {
        return Response.json({ error: "The resulting stock quantity is too large." }, { status: 400, headers: corsHeaders });
      }
      const update = await adminClient.from("products")
        .update({ stock_quantity: nextStock, updated_at: new Date().toISOString() })
        .eq("id", productId).eq("stock_quantity", currentStock)
        .select("id, stock_quantity").maybeSingle();
      if (update.error) {
        console.error("Inventory update failed:", update.error.message);
        return Response.json({ error: "The stock quantity could not be saved." }, { status: 500, headers: corsHeaders });
      }
      if (update.data) {
        return Response.json({ product_id: update.data.id, stock_quantity: update.data.stock_quantity }, { headers: corsHeaders });
      }
      if (action === "set") {
        return Response.json({ error: "Stock changed elsewhere. Refresh and review the current quantity." }, { status: 409, headers: corsHeaders });
      }
      currentStock = null;
    }

    return Response.json({ error: "Stock is changing frequently. Please retry." }, { status: 409, headers: corsHeaders });
  } catch (error) {
    console.error("Inventory operation failed:", error);
    return Response.json({ error: "Inventory operation could not be completed." }, { status: 500, headers: corsHeaders });
  }
});
