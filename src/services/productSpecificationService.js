import { supabase } from "../lib/supabaseClient";

// These specification tables and fields mirror the existing catalog reader.
export const productSpecificationTables = [
  { table: "cpu_specs", keys: ["socket", "processor_family", "core_count", "thread_count", "power_rating_watts", "power_rating_type"], numbers: ["core_count", "thread_count", "power_rating_watts"] },
  { table: "gpu_specs", keys: ["chipset", "vram_gb", "board_power_watts", "recommended_psu_watts", "power_connectors", "length_mm"], numbers: ["vram_gb", "board_power_watts", "recommended_psu_watts", "length_mm"], arrays: ["power_connectors"] },
  { table: "motherboard_specs", keys: ["socket", "chipset", "form_factor", "memory_type", "memory_slots", "max_memory_gb", "supported_memory_speed_mhz"], numbers: ["memory_slots", "max_memory_gb", "supported_memory_speed_mhz"] },
  { table: "memory_specs", keys: ["memory_type", "capacity_gb", "speed_mhz", "module_count", "module_capacity_gb"], numbers: ["capacity_gb", "speed_mhz", "module_count", "module_capacity_gb"] },
  { table: "storage_specs", keys: ["storage_type", "capacity_gb", "interface", "form_factor", "read_speed_mbps", "write_speed_mbps"], numbers: ["capacity_gb", "read_speed_mbps", "write_speed_mbps"] },
  { table: "psu_specs", keys: ["rated_wattage", "efficiency_rating", "modularity", "form_factor", "power_connectors"], numbers: ["rated_wattage"], arrays: ["power_connectors"] },
  { table: "case_specs", keys: ["supported_motherboard_form_factors", "max_gpu_length_mm", "max_cpu_cooler_height_mm", "psu_form_factor", "max_fan_count", "included_fan_count", "included_fan_sizes_mm"], numbers: ["max_gpu_length_mm", "max_cpu_cooler_height_mm", "max_fan_count", "included_fan_count"], arrays: ["supported_motherboard_form_factors", "included_fan_sizes_mm"] },
  { table: "cooler_specs", keys: ["cooler_type", "compatible_sockets", "radiator_size_mm", "height_mm"], numbers: ["radiator_size_mm", "height_mm"], arrays: ["compatible_sockets"] },
  { table: "desktop_specs", keys: ["processor", "graphics", "memory_gb", "operating_system", "memory_type", "memory_speed_mhz", "storage_gb", "storage_type", "motherboard", "psu_wattage", "case_model", "cooling_type", "wifi_supported", "bluetooth_supported", "warranty_months"], numbers: ["memory_gb", "memory_speed_mhz", "storage_gb", "psu_wattage", "warranty_months"], booleans: ["wifi_supported", "bluetooth_supported"] },
  { table: "laptop_specs", keys: ["processor", "graphics", "ram_gb", "storage_gb", "screen_size_inches", "resolution", "refresh_rate_hz", "laptop_type", "memory_type", "memory_speed_mhz", "upgradeable_ram", "max_ram_gb", "storage_type", "panel_type", "warranty_months"], numbers: ["ram_gb", "storage_gb", "screen_size_inches", "refresh_rate_hz", "memory_speed_mhz", "max_ram_gb", "warranty_months"], booleans: ["upgradeable_ram"] },
];

const categoryMatchers = [
  ["laptop_specs", /laptop|notebook/], ["desktop_specs", /desktop|pre.?built/],
  ["cpu_specs", /processor|\bcpu\b/], ["gpu_specs", /graphics|\bgpu\b|video card/],
  ["motherboard_specs", /motherboard|mainboard/], ["memory_specs", /memory|\bram\b/],
  ["storage_specs", /storage|\bssd\b|hard.?drive/], ["psu_specs", /power supply|\bpsu\b/],
  ["case_specs", /\bcase\b|chassis/], ["cooler_specs", /cooler|cooling/],
];

export function specificationTableForCategory(categoryName, productType = "") {
  const normalized = `${categoryName ?? ""} ${productType ?? ""}`.toLowerCase();
  return productSpecificationTables.find(({ table }) => {
    const matcher = categoryMatchers.find(([name]) => name === table)?.[1];
    return matcher?.test(normalized) ?? false;
  }) ?? null;
}

export function specificationFieldLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function specificationFieldType(schema, key) {
  if (schema.booleans?.includes(key)) return "boolean";
  if (schema.arrays?.includes(key)) return "list";
  if (schema.numbers?.includes(key)) return "number";
  return "text";
}

const normalizeValues = (schema, values) => Object.fromEntries(schema.keys.map((key) => {
  const raw = values[key];
  if (raw === "" || raw === undefined || raw === null) return [key, null];
  if (schema.numbers?.includes(key)) {
    const number = Number(raw);
    if (!Number.isFinite(number) || number < 0 || (key !== "screen_size_inches" && !Number.isInteger(number))) {
      throw new Error(`${specificationFieldLabel(key)} must be a valid nonnegative ${key === "screen_size_inches" ? "number" : "whole number"}.`);
    }
    return [key, number];
  }
  if (schema.booleans?.includes(key)) return [key, raw === true || raw === "true"];
  if (schema.arrays?.includes(key)) {
    const parts = Array.isArray(raw) ? raw : String(raw).split(",");
    const items = parts.map((part) => String(part).trim()).filter(Boolean);
    if (key === "included_fan_sizes_mm" && items.some((part) => !Number.isInteger(Number(part)) || Number(part) < 0)) {
      throw new Error("Included fan sizes must be nonnegative whole numbers separated by commas.");
    }
    return [key, items.map((part) => key === "included_fan_sizes_mm" ? Number(part) : part)];
  }
  return [key, String(raw).trim()];
}));

const editorValues = (schema, row) => Object.fromEntries(schema.keys.map((key) => [
  key,
  schema.booleans?.includes(key) ? (row[key] == null ? "" : String(row[key]))
    : schema.arrays?.includes(key) ? (Array.isArray(row[key]) ? row[key].join(", ") : "")
      : row[key] == null ? "" : String(row[key]),
]));

export async function loadProductSpecifications(productId) {
  if (!productId) return { schema: null, values: {}, existingSchema: null };
  const results = await Promise.all(productSpecificationTables.map(async (schema) => {
    const { data, error } = await supabase.from(schema.table).select("*").eq("product_id", productId).maybeSingle();
    return { schema, data, error };
  }));
  const failed = results.find((result) => result.error);
  if (failed) throw failed.error;
  const existingRecords = results.filter((result) => result.data);
  if (existingRecords.length > 1) {
    throw new Error("This product has specification records in multiple categories. Resolve the duplicate records before editing.");
  }
  const existing = existingRecords[0];
  return existing
    ? { schema: existing.schema, values: editorValues(existing.schema, existing.data), existingSchema: existing.schema }
    : { schema: null, values: {}, existingSchema: null };
}

export async function saveProductSpecifications(productId, schema, values, existingSchema) {
  const row = { product_id: productId, ...normalizeValues(schema, values) };
  const hasValues = schema.keys.some((key) => row[key] !== null && row[key] !== "");
  if (!hasValues && !existingSchema) return;

  const { data: previous, error: readError } = await supabase.from(schema.table)
    .select("product_id").eq("product_id", productId).maybeSingle();
  if (readError) throw readError;
  const result = previous
    ? await supabase.from(schema.table).update(row).eq("product_id", productId).select("product_id")
    : await supabase.from(schema.table).insert(row).select("product_id");
  if (result.error) throw result.error;
  if (!result.data?.length) throw new Error("The product specifications were not saved. Check your account permissions.");

  if (existingSchema && existingSchema.table !== schema.table) {
    const { error } = await supabase.from(existingSchema.table).delete().eq("product_id", productId);
    if (error) throw new Error(`Specifications saved, but the previous category specifications could not be removed: ${error.message}`);
  }
}
