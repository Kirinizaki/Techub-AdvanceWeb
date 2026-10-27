import { supabase } from "./supabaseClient";
import { edgeFunctionErrorMessage } from "./edgeFunctionErrors";

async function invokePricing(body) {
  const { data, error } = await supabase.functions.invoke("manage-product-pricing", { body });
  if (error) {
    let errorBody = null;
    if (error.context && typeof error.context.clone === "function") {
      try {
        errorBody = await error.context.clone().json();
      } catch {
        // Fall back to the Supabase client's message if no JSON body is available.
      }
    }
    const requestError = new Error(
      typeof errorBody?.error === "string" ? errorBody.error : await edgeFunctionErrorMessage(error)
    );
    requestError.partial = errorBody?.partial === true;
    requestError.sellingPrice = errorBody?.selling_price;
    requestError.updatedProducts = Array.isArray(errorBody?.updated_products) ? errorBody.updated_products : [];
    throw requestError;
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getAdminProductPricing() {
  const data = await invokePricing({ action: "list" });
  if (data?.api_version !== 2) {
    throw new Error("The deployed pricing function is out of date. Redeploy manage-product-pricing before saving prices.");
  }
  if (!Array.isArray(data?.pricing)) {
    throw new Error("The pricing service returned an invalid response.");
  }
  return data.pricing;
}

export async function updateAdminProductPricing({ productId, sellingPrice, costBasis, standardMsrp }) {
  const data = await invokePricing({
    action: "update",
    product_id: productId,
    selling_price: sellingPrice,
    cost_basis: costBasis,
    standard_msrp: standardMsrp,
  });
  if (data?.api_version !== 2) {
    throw new Error("The deployed pricing function is out of date. Redeploy manage-product-pricing before saving prices.");
  }
  if (
    data?.pricing?.product_id !== productId ||
    !Number.isFinite(Number(data?.pricing?.selling_price))
  ) {
    throw new Error("The pricing service returned an invalid save response.");
  }
  return data.pricing;
}

export async function bulkUpdateAdminProductPrices(updates) {
  const data = await invokePricing({
    action: "bulk_update",
    product_updates: updates.map(({ id, price }) => ({ product_id: id, price })),
  });
  if (data?.api_version !== 2) {
    throw new Error("The deployed pricing function is out of date. Redeploy manage-product-pricing before changing prices.");
  }
  if (!Array.isArray(data?.updated_products) || data.updated_products.length !== updates.length) {
    throw new Error("The pricing service returned an invalid bulk-update response.");
  }
  return data.updated_products;
}
