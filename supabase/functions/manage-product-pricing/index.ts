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
      console.error("Pricing permission lookup failed:", roleError.message);
      return Response.json({ error: "Unable to verify pricing permissions." }, { status: 500, headers: corsHeaders });
    }
    if (role?.role !== "admin") {
      return Response.json({ error: "Only admins can view or change cost and MSRP data." }, { status: 403, headers: corsHeaders });
    }

    let body: Record<string, unknown>;
    try {
      const parsed = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return Response.json({ error: "A valid pricing action is required." }, { status: 400, headers: corsHeaders });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return Response.json({ error: "The request body must be valid JSON." }, { status: 400, headers: corsHeaders });
    }

    if (body.action === "list") {
      const entries = [];
      for (let start = 0; ; start += 1000) {
        const { data, error } = await adminClient.from("admin_product_pricing")
          .select("product_id, cost_basis, standard_msrp")
          .order("product_id", { ascending: true })
          .range(start, start + 999);
        if (error) {
          console.error("Admin pricing list failed:", error.message);
          return Response.json({ error: "Cost and MSRP storage is not available. Apply the reviewed pricing migration first." }, { status: 503, headers: corsHeaders });
        }
        entries.push(...(data ?? []));
        if ((data?.length ?? 0) < 1000) break;
      }
      return Response.json({ api_version: 2, pricing: entries }, { headers: corsHeaders });
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const maximumPrice = 9_999_999_999.99;
    if (body.action === "bulk_update") {
      const updates = body.product_updates;
      if (!Array.isArray(updates) || updates.length < 1 || updates.length > 500) {
        return Response.json({ error: "Select between 1 and 500 products to update." }, { status: 400, headers: corsHeaders });
      }
      const normalized = updates.map((item) => ({
        productId: item && typeof item === "object" && typeof item.product_id === "string" ? item.product_id : "",
        price: item && typeof item === "object" ? Number(item.price) : Number.NaN,
      }));
      const productIds = normalized.map((item) => item.productId);
      if (normalized.some((item) => !uuidPattern.test(item.productId) || !Number.isFinite(item.price) || item.price <= 0 || item.price > maximumPrice) || new Set(productIds).size !== productIds.length) {
        return Response.json({ error: "Every selected product needs a unique valid ID and a positive price." }, { status: 400, headers: corsHeaders });
      }

      const updatedProducts = [];
      for (const item of normalized) {
        const { data, error } = await adminClient.from("products")
          .update({ price: item.price, updated_at: new Date().toISOString() })
          .eq("id", item.productId).select("id, price").maybeSingle();
        if (error || !data) {
          if (error) console.error("Admin bulk selling price update failed:", error.message);
          return Response.json({
            error: updatedProducts.length
              ? `Bulk update stopped after ${updatedProducts.length} product(s). Refresh and review the saved prices.`
              : "The selected selling prices could not be saved.",
            partial: updatedProducts.length > 0,
            updated_products: updatedProducts,
          }, { status: error ? 500 : 404, headers: corsHeaders });
        }
        updatedProducts.push({ product_id: data.id, price: Number(data.price) });
      }
      return Response.json({ api_version: 2, updated_products: updatedProducts }, { headers: corsHeaders });
    }

    if (body.action !== "update") {
      return Response.json({ error: "Unsupported pricing action." }, { status: 400, headers: corsHeaders });
    }

    const productId = typeof body.product_id === "string" ? body.product_id : "";
    const sellingPrice = Number(body.selling_price);
    const cost = body.cost_basis === null || body.cost_basis === "" ? null : Number(body.cost_basis);
    const msrp = body.standard_msrp === null || body.standard_msrp === "" ? null : Number(body.standard_msrp);
    if (!uuidPattern.test(productId) || !Number.isFinite(sellingPrice) || sellingPrice <= 0 || sellingPrice > maximumPrice || (cost !== null && (!Number.isFinite(cost) || cost < 0 || cost > maximumPrice)) || (msrp !== null && (!Number.isFinite(msrp) || msrp < 0 || msrp > maximumPrice))) {
      return Response.json({ error: "Enter a valid product, positive selling price, and nonnegative cost and MSRP values." }, { status: 400, headers: corsHeaders });
    }

    const { data: product, error: productError } = await adminClient.from("products")
      .select("id").eq("id", productId).maybeSingle();
    if (productError) {
      console.error("Pricing product lookup failed:", productError.message);
      return Response.json({ error: "Unable to verify the selected product." }, { status: 500, headers: corsHeaders });
    }
    if (!product) return Response.json({ error: "Product not found." }, { status: 404, headers: corsHeaders });

    const { data: updatedProduct, error: priceError } = await adminClient.from("products")
      .update({ price: sellingPrice, updated_at: new Date().toISOString() })
      .eq("id", productId).select("id, price").maybeSingle();
    if (priceError) {
      console.error("Admin selling price update failed:", priceError.message);
      return Response.json({ error: "The selling price could not be saved. Verify product pricing permissions and try again." }, { status: 500, headers: corsHeaders });
    }
    if (!updatedProduct) return Response.json({ error: "Product not found or selling price was not updated." }, { status: 404, headers: corsHeaders });

    const { data, error } = await adminClient.from("admin_product_pricing").upsert({
      product_id: productId,
      cost_basis: cost,
      standard_msrp: msrp,
      updated_at: new Date().toISOString(),
    }, { onConflict: "product_id" }).select("product_id, cost_basis, standard_msrp").single();
    if (error) {
      console.error("Admin pricing update failed:", error.message);
      return Response.json({ error: "Selling price was saved, but cost and MSRP could not be saved. Retry the update.", partial: true, selling_price: updatedProduct.price }, { status: 503, headers: corsHeaders });
    }

    return Response.json({ api_version: 2, pricing: { ...data, selling_price: updatedProduct.price } }, { headers: corsHeaders });
  } catch (error) {
    console.error("Admin pricing request failed:", error);
    return Response.json({ error: "The pricing request could not be completed." }, { status: 500, headers: corsHeaders });
  }
});
