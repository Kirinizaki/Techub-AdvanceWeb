
import { supabase } from "../lib/supabaseClient";

export async function getProducts(productType = null) {
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories (
        id,
        name,
        slug
      ),
      brand:brands (
        id,
        name,
        slug
      )
    `)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (productType) {
    // Validate the requested type before filtering.
    const allowedTypes = ["component", "desktop", "laptop"];

    if (!allowedTypes.includes(productType)) {
      throw new Error(`Invalid product type: ${productType}`);
    }

    // Filter by product type, not category name.
    query = query.eq("product_type", productType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  const productIds = data.map((product) => product.id);

  // Fetch CPU specifications for the products
  const { data: cpuSpecs, error: cpuSpecsError } = await supabase
    .from("cpu_specs")
    .select(`
      product_id,
      socket,
      processor_family,
      core_count,
      thread_count,
      power_rating_watts,
      power_rating_type
    `)
    .in("product_id", productIds);

  if (cpuSpecsError) {
    console.error("Error fetching CPU specifications:", cpuSpecsError);
    throw cpuSpecsError;
  }

  const cpuSpecsByProductId = new Map(
    cpuSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch GPU specifications for the products
  const { data: gpuSpecs, error: gpuSpecsError } = await supabase
    .from("gpu_specs")
    .select(`
      product_id,
      chipset,
      vram_gb,
      board_power_watts,
      recommended_psu_watts,
      power_connectors,
      length_mm
    `)
    .in("product_id", productIds);

  if (gpuSpecsError) {
    console.error("Error fetching GPU specifications:", gpuSpecsError);
    throw gpuSpecsError;
  }

  const gpuSpecsByProductId = new Map(
    gpuSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch Motherboard specifications for the products
  const { data: motherboardSpecs, error: motherboardSpecsError } =
    await supabase
      .from("motherboard_specs")
      .select(`
        product_id,
        socket,
        chipset,
        form_factor,
        memory_type,
        memory_slots,
        max_memory_gb,
        supported_memory_speed_mhz
      `)
      .in("product_id", productIds);

  if (motherboardSpecsError) {
    console.error(
      "Error fetching motherboard specifications:",
      motherboardSpecsError
    );
    throw motherboardSpecsError;
  }

  const motherboardSpecsByProductId = new Map(
    motherboardSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch RAM specifications
  const { data: memorySpecs, error: memorySpecsError } = await supabase
    .from("memory_specs")
    .select(`
      product_id,
      memory_type,
      capacity_gb,
      speed_mhz,
      module_count,
      module_capacity_gb
    `)
    .in("product_id", productIds);

  if (memorySpecsError) {
    console.error("Error fetching RAM specifications:", memorySpecsError);
    throw memorySpecsError;
  }

  const memorySpecsByProductId = new Map(
    memorySpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch storage specifications
  const { data: storageSpecs, error: storageSpecsError } = await supabase
    .from("storage_specs")
    .select(`
      product_id,
      storage_type,
      capacity_gb,
      interface,
      form_factor,
      read_speed_mbps,
      write_speed_mbps
    `)
    .in("product_id", productIds);

  if (storageSpecsError) {
    console.error("Error fetching storage specifications:", storageSpecsError);
    throw storageSpecsError;
  }

  const storageSpecsByProductId = new Map(
    storageSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch PSU specifications
  const { data: psuSpecs, error: psuSpecsError } = await supabase
    .from("psu_specs")
    .select(`
      product_id,
      rated_wattage,
      efficiency_rating,
      modularity,
      form_factor,
      power_connectors
    `)
    .in("product_id", productIds);

  if (psuSpecsError) {
    console.error("Error fetching PSU specifications:", psuSpecsError);
    throw psuSpecsError;
  }

  const psuSpecsByProductId = new Map(
    psuSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch PC case specifications
  const { data: caseSpecs, error: caseSpecsError } = await supabase
    .from("case_specs")
    .select(`
      product_id,
      supported_motherboard_form_factors,
      max_gpu_length_mm,
      max_cpu_cooler_height_mm,
      psu_form_factor,
      max_fan_count,
      included_fan_count,
      included_fan_sizes_mm
    `)
    .in("product_id", productIds);

  if (caseSpecsError) {
    console.error("Error fetching PC case specifications:", caseSpecsError);
    throw caseSpecsError;
  }

  const caseSpecsByProductId = new Map(
    caseSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch CPU cooler specifications
  const { data: coolerSpecs, error: coolerSpecsError } = await supabase
    .from("cooler_specs")
    .select(`
      product_id,
      cooler_type,
      compatible_sockets,
      radiator_size_mm,
      height_mm
    `)
    .in("product_id", productIds);

  if (coolerSpecsError) {
    console.error("Error fetching cooler specifications:", coolerSpecsError);
    throw coolerSpecsError;
  }

  const coolerSpecsByProductId = new Map(
    coolerSpecs.map((spec) => [spec.product_id, spec])
  );
  // Fetch desktop specifications
  const { data: desktopSpecs, error: desktopSpecsError } = await supabase
    .from("desktop_specs")
    .select(`
      product_id,
      processor,
      graphics,
      memory_gb,
      storage_gb,
      operating_system,
      memory_type,
      memory_speed_mhz,
      storage_type,
      motherboard,
      psu_wattage,
      case_model,
      cooling_type,
      wifi_supported,
      bluetooth_supported,
      warranty_months
    `)
    .in("product_id", productIds);

  if (desktopSpecsError) {
    console.error("Error fetching desktop specifications:", desktopSpecsError);
    throw desktopSpecsError;
  }

  const desktopSpecsByProductId = new Map(
    desktopSpecs.map((spec) => [spec.product_id, spec])
  );

  // Fetch laptop specifications
  const { data: laptopSpecs, error: laptopSpecsError } = await supabase
    .from("laptop_specs")
    .select(`
      product_id,
      processor,
      graphics,
      ram_gb,
      storage_gb,
      screen_size_inches,
      resolution,
      refresh_rate_hz,
      laptop_type,
      memory_type,
      memory_speed_mhz,
      upgradeable_ram,
      max_ram_gb,
      storage_type,
      panel_type,
      warranty_months
    `)
    .in("product_id", productIds);

  if (laptopSpecsError) {
    console.error("Error fetching laptop specifications:", laptopSpecsError);
    throw laptopSpecsError;
  }

  const laptopSpecsByProductId = new Map(
    laptopSpecs.map((spec) => [spec.product_id, spec])
  );

  return data.map((product) => {
    const gpuSpec = gpuSpecsByProductId.get(product.id);
    const cpuSpec = cpuSpecsByProductId.get(product.id);
    const motherboardSpec = motherboardSpecsByProductId.get(product.id);
    const memorySpec = memorySpecsByProductId.get(product.id);
    const storageSpec = storageSpecsByProductId.get(product.id);
    const psuSpec = psuSpecsByProductId.get(product.id);
    const caseSpec = caseSpecsByProductId.get(product.id);
    const coolerSpec = coolerSpecsByProductId.get(product.id);
    const desktopSpec = desktopSpecsByProductId.get(product.id);
    const laptopSpec = laptopSpecsByProductId.get(product.id);

    const specifications = gpuSpec
      ? [
          ["Chipset", gpuSpec.chipset],
          ["VRAM", gpuSpec.vram_gb == null ? null : `${gpuSpec.vram_gb} GB`],
          [
            "Board Power",
            gpuSpec.board_power_watts == null
              ? null
              : `${gpuSpec.board_power_watts} W`,
          ],
          [
            "Recommended PSU",
            gpuSpec.recommended_psu_watts == null
              ? null
              : `${gpuSpec.recommended_psu_watts} W`,
          ],
          [
            "Power Connectors",
            Array.isArray(gpuSpec.power_connectors)
              ? gpuSpec.power_connectors.join(", ")
              : gpuSpec.power_connectors,
          ],
          [
            "Length",
            gpuSpec.length_mm == null ? null : `${gpuSpec.length_mm} mm`,
          ],
        ].filter(([, value]) => value != null && value !== "")
      : cpuSpec
        ? [
            ["Socket", cpuSpec.socket],
            ["Processor Family", cpuSpec.processor_family],
            ["Cores", cpuSpec.core_count],
            ["Threads", cpuSpec.thread_count],
            [
              cpuSpec.power_rating_type || "Power Rating",
              cpuSpec.power_rating_watts == null
                ? null
                : `${cpuSpec.power_rating_watts} W`,
            ],
          ].filter(([, value]) => value != null && value !== "")
        : motherboardSpec
          ? [
              ["Socket", motherboardSpec.socket],
              ["Chipset", motherboardSpec.chipset],
              ["Form Factor", motherboardSpec.form_factor],
              ["Memory Type", motherboardSpec.memory_type],
              ["Memory Slots", motherboardSpec.memory_slots],
              [
                "Maximum Memory",
                motherboardSpec.max_memory_gb == null
                  ? null
                  : `${motherboardSpec.max_memory_gb} GB`,
              ],
              [
                "Supported Memory Speed",
                motherboardSpec.supported_memory_speed_mhz == null
                  ? null
                  : `${motherboardSpec.supported_memory_speed_mhz} MHz`,
              ],
            ].filter(([, value]) => value != null && value !== "")
          : memorySpec
            ? [
                ["Memory Type", memorySpec.memory_type],
                ["Capacity", `${memorySpec.capacity_gb} GB`],
                [
                  "Speed",
                  memorySpec.speed_mhz == null
                    ? null
                    : `${memorySpec.speed_mhz} MHz`,
                ],
                ["Number of Modules", memorySpec.module_count],
                [
                  "Capacity per Module",
                  memorySpec.module_capacity_gb == null
                    ? null
                    : `${memorySpec.module_capacity_gb} GB`,
                ],
              ].filter(([, value]) => value != null && value !== "")
            : storageSpec
              ? [
                  ["Storage Type", storageSpec.storage_type],
                  ["Capacity", `${storageSpec.capacity_gb} GB`],
                  ["Interface", storageSpec.interface],
                  ["Form Factor", storageSpec.form_factor],
                  [
                    "Read Speed",
                    storageSpec.read_speed_mbps == null
                      ? null
                      : `${storageSpec.read_speed_mbps} MB/s`,
                  ],
                  [
                    "Write Speed",
                    storageSpec.write_speed_mbps == null
                      ? null
                      : `${storageSpec.write_speed_mbps} MB/s`,
                  ],
                ].filter(([, value]) => value != null && value !== "")
              : psuSpec
                ? [
                    ["Rated Wattage", `${psuSpec.rated_wattage} W`],
                    ["Efficiency Rating", psuSpec.efficiency_rating],
                    ["Modularity", psuSpec.modularity],
                    ["Form Factor", psuSpec.form_factor],
                    [
                      "Power Connectors",
                      Array.isArray(psuSpec.power_connectors)
                        ? psuSpec.power_connectors.join(", ")
                        : psuSpec.power_connectors,
                    ],
                  ].filter(([, value]) => value != null && value !== "")
                : caseSpec
                  ? [
                      [
                        "Supported Motherboard Sizes",
                        Array.isArray(caseSpec.supported_motherboard_form_factors)
                          ? caseSpec.supported_motherboard_form_factors.join(", ")
                          : caseSpec.supported_motherboard_form_factors,
                      ],
                      [
                        "Maximum GPU Length",
                        caseSpec.max_gpu_length_mm == null
                          ? null
                          : `${caseSpec.max_gpu_length_mm} mm`,
                      ],
                      [
                        "Maximum CPU Cooler Height",
                        caseSpec.max_cpu_cooler_height_mm == null
                          ? null
                          : `${caseSpec.max_cpu_cooler_height_mm} mm`,
                      ],
                      ["PSU Form Factor", caseSpec.psu_form_factor],
                      ["Maximum Fan Capacity", caseSpec.max_fan_count],
                      ["Included Fans", caseSpec.included_fan_count],
                      [
                        "Included Fan Sizes",
                        Array.isArray(caseSpec.included_fan_sizes_mm)
                          ? caseSpec.included_fan_sizes_mm
                              .map((size) => `${size} mm`)
                              .join(", ")
                          : null,
                      ],
                    ].filter(([, value]) => value != null && value !== "")
                  : coolerSpec
                    ? [
                        ["Cooler Type", coolerSpec.cooler_type],
                        [
                          "Compatible CPU Sockets",
                          Array.isArray(coolerSpec.compatible_sockets)
                            ? coolerSpec.compatible_sockets.join(", ")
                            : coolerSpec.compatible_sockets,
                        ],
                        [
                          "Radiator Size",
                          coolerSpec.radiator_size_mm == null
                            ? null
                            : `${coolerSpec.radiator_size_mm} mm`,
                        ],
                        [
                          "Cooler Height",
                          coolerSpec.height_mm == null
                            ? null
                            : `${coolerSpec.height_mm} mm`,
                        ],
                      ].filter(([, value]) => value != null && value !== "")
                    : desktopSpec
                      ? [
                          ["Processor", desktopSpec.processor],
                          ["Graphics", desktopSpec.graphics],
                          [
                            "Memory",
                            desktopSpec.memory_gb == null ? null : `${desktopSpec.memory_gb} GB`,
                          ],
                          ["Memory Type", desktopSpec.memory_type],
                          [
                            "Memory Speed",
                            desktopSpec.memory_speed_mhz == null
                              ? null
                              : `${desktopSpec.memory_speed_mhz} MHz`,
                          ],
                          [
                            "Storage",
                            desktopSpec.storage_gb == null ? null : `${desktopSpec.storage_gb} GB`,
                          ],
                          ["Storage Type", desktopSpec.storage_type],
                          ["Operating System", desktopSpec.operating_system],
                          ["Motherboard", desktopSpec.motherboard],
                          [
                            "Power Supply",
                            desktopSpec.psu_wattage == null
                              ? null
                              : `${desktopSpec.psu_wattage} W`,
                          ],
                          ["Case", desktopSpec.case_model],
                          ["Cooling", desktopSpec.cooling_type],
                          [
                            "Wi-Fi",
                            desktopSpec.wifi_supported == null
                              ? null
                              : desktopSpec.wifi_supported ? "Supported" : "Not supported",
                          ],
                          [
                            "Bluetooth",
                            desktopSpec.bluetooth_supported == null
                              ? null
                              : desktopSpec.bluetooth_supported ? "Supported" : "Not supported",
                          ],
                          [
                            "Warranty",
                            desktopSpec.warranty_months == null
                              ? null
                              : `${desktopSpec.warranty_months} months`,
                          ],
                        ].filter(([, value]) => value != null && value !== "")
                      : laptopSpec
                        ? [
                            ["Processor", laptopSpec.processor],
                            ["Graphics", laptopSpec.graphics],
                            [
                              "Memory",
                              laptopSpec.ram_gb == null ? null : `${laptopSpec.ram_gb} GB`,
                            ],
                            ["Memory Type", laptopSpec.memory_type],
                            [
                              "Memory Speed",
                              laptopSpec.memory_speed_mhz == null
                                ? null
                                : `${laptopSpec.memory_speed_mhz} MHz`,
                            ],
                            [
                              "Maximum RAM",
                              laptopSpec.max_ram_gb == null
                                ? null
                                : `${laptopSpec.max_ram_gb} GB`,
                            ],
                            [
                              "RAM Upgradeable",
                              laptopSpec.upgradeable_ram == null
                                ? null
                                : laptopSpec.upgradeable_ram
                                  ? "Yes"
                                  : "No",
                            ],
                            [
                              "Storage",
                              laptopSpec.storage_gb == null
                                ? null
                                : `${laptopSpec.storage_gb} GB`,
                            ],
                            ["Storage Type", laptopSpec.storage_type],
                            [
                              "Screen Size",
                              laptopSpec.screen_size_inches == null
                                ? null
                                : `${laptopSpec.screen_size_inches} inches`,
                            ],
                            ["Resolution", laptopSpec.resolution],
                            [
                              "Refresh Rate",
                              laptopSpec.refresh_rate_hz == null
                                ? null
                                : `${laptopSpec.refresh_rate_hz} Hz`,
                            ],
                            ["Panel Type", laptopSpec.panel_type],
                            ["Laptop Type", laptopSpec.laptop_type],
                            [
                              "Warranty",
                              laptopSpec.warranty_months == null
                                ? null
                                : `${laptopSpec.warranty_months} months`,
                            ],
                          ].filter(([, value]) => value != null && value !== "")
                        : [];

    return {
      id: product.id,
      productType: product.product_type,
      name: product.name,
      description: product.description ?? "",
      brand: product.brand?.name ?? "Unbranded",
      category: product.category?.name ?? "Uncategorized",
      price: Number(product.price),
      image: product.image_url,
      stockQuantity: Number(product.stock_quantity) || 0,
      stock:
        product.stock_quantity > 0
          ? "In Stock"
          : "Out of Stock",
      specifications,
    };
  });
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return data;
}

export async function getBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }

  return data;
}
