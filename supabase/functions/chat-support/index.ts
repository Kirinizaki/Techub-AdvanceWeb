import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_INSTRUCTION = `
You are Techub's customer support assistant.

Help customers primarily with computer hardware, gaming and productivity laptops,
PC components, troubleshooting, and general store support.

Rules:
- Be friendly, natural, clear, and concise.
- Answer general computer questions when you can.
- For greetings and brief casual conversation, respond naturally.
- If a customer asks an unrelated question, you may give a brief, simple answer
  when appropriate, then gently guide the conversation back to PC hardware,
  laptops, or Techub products. Do not turn unrelated topics into long discussions.
- Never invent Techub products, prices, stock, policies, or order details.
- Be honest when verified store information is unavailable.
- Never claim to have processed orders, refunds, or payments.
- Never claim that a human agent has been contacted or joined unless the
  system explicitly confirms it.
- Never request passwords, API keys, or payment card details.
`;

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
    },
  });

function requestsHumanSupport(message: string): boolean {
  const normalized = message
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const negativeIntent =
    /\b(don't|do not|dont|no need to|don't need to|do not need to|dont need to|never mind|nevermind)\b.{0,35}\b(human|person|agent|representative|staff|support)\b/;

  if (negativeIntent.test(normalized)) return false;

  const patterns = [
    /\b(talk|speak|chat|connect|transfer|forward|escalate|put me through)\b.{0,50}\b(human|real person|actual person|live agent|support agent|human agent|customer service|representative|staff member|support staff|someone)\b/,
    /\b(human|real person|actual person|live agent|support agent|human agent|customer service representative|support representative|staff member|support staff)\b/,
    /\b(can i|could i|may i|i want to|i need to|let me|please let me)\b.{0,35}\b(talk|speak|chat|connect|transfer)\b.{0,35}\b(human|person|agent|representative|staff|someone)\b/,
    /\b(agent|human|representative|staff)\s+(please|now)\b/,
    /\b(real person|human support|live support|live person)\b/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
}

type CatalogCategory = {
  name: string;
  specTable?: string;
  specFields?: string;
};

function requestedCatalogCategories(message: string): CatalogCategory[] {
  const text = message.toLowerCase();
  const categories: CatalogCategory[] = [];
  const add = (category: CatalogCategory) => {
    if (!categories.some((item) => item.name === category.name)) categories.push(category);
  };

  if (/\b(gpu|graphics card|video card|radeon|geforce|rtx\s?\d|rx\s?\d)\b/.test(text)) {
    add({ name: "Graphics Cards", specTable: "gpu_specs", specFields: "product_id, chipset, vram_gb, board_power_watts, recommended_psu_watts, power_connectors, length_mm" });
  }
  if (/\b(cpu|processor|ryzen|intel core|core i[3579]|core ultra)\b/.test(text)) {
    add({ name: "CPUs", specTable: "cpu_specs", specFields: "product_id, socket, processor_family, core_count, thread_count, power_rating_watts, power_rating_type, has_integrated_graphics, integrated_graphics_model, base_clock_mhz, boost_clock_mhz" });
  }
  if (/\b(laptop|notebook)\b/.test(text)) {
    add({ name: "Laptops", specTable: "laptop_specs", specFields: "product_id, processor, graphics, ram_gb, storage_gb, screen_size_inches, resolution, refresh_rate_hz, laptop_type, memory_type, memory_speed_mhz, upgradeable_ram, max_ram_gb, storage_type, panel_type" });
  }
  if (/\b(motherboard|mainboard)\b/.test(text)) {
    add({ name: "Motherboards", specTable: "motherboard_specs", specFields: "product_id, socket, chipset, form_factor, memory_type, memory_slots, max_memory_gb, supported_memory_speed_mhz" });
  }
  if (/\b(ram|memory kit|memory stick|ddr4|ddr5)\b/.test(text)) {
    add({ name: "Memory (RAM)", specTable: "memory_specs", specFields: "product_id, memory_type, capacity_gb, speed_mhz, module_count, module_capacity_gb" });
  }
  if (/\b(storage|ssd|hard drive|hdd|nvme)\b/.test(text)) add({ name: "Storage" });
  if (/\b(power supply|psu|wattage)\b/.test(text)) add({ name: "Power Supplies" });
  if (/\b(pc case|computer case|chassis)\b/.test(text)) add({ name: "Cases" });
  if (/\b(cpu cooler|air cooler|aio|liquid cooler|radiator)\b/.test(text)) {
    add({ name: "CPU Coolers", specTable: "cooler_specs", specFields: "product_id, cooler_type, compatible_sockets, radiator_size_mm, height_mm" });
  }
  if (/\b(prebuilt|desktop pc|gaming pc|productivity pc)\b/.test(text)) {
    add({ name: "Desktops", specTable: "desktop_specs", specFields: "product_id, processor, graphics, memory_gb, storage_gb, operating_system, memory_type, memory_speed_mhz, storage_type, motherboard, psu_wattage, case_model, cooling_type, wifi_supported, bluetooth_supported, warranty_months" });
  }
  if (/\b(pair|pairing|compatible|compatibility|bottleneck)\b/.test(text) &&
      /\b(gpu|graphics card|video card)\b/.test(text) &&
      !categories.some((item) => item.name === "CPUs")) {
    add({ name: "CPUs", specTable: "cpu_specs", specFields: "product_id, socket, processor_family, core_count, thread_count, power_rating_watts, power_rating_type, has_integrated_graphics, integrated_graphics_model, base_clock_mhz, boost_clock_mhz" });
  }
  return categories;
}

async function getCatalogContext(
  db: ReturnType<typeof createClient>,
  message: string,
): Promise<string> {
  const requested = requestedCatalogCategories(message);

  // Load category IDs even for model-only questions such as "Do you stock 3050?"
  // so direct product-name/model matching can work without category keywords.
  const { data: categories, error: categoriesError } = await db
    .from("categories")
    .select("id, name")
    .in(
      "name",
      requested.length
        ? requested.map((item) => item.name)
        : ["Graphics Cards", "CPUs", "Laptops", "Motherboards", "Memory (RAM)", "Storage", "Power Supplies", "Cases", "CPU Coolers", "Desktops"],
    );

  if (categoriesError) {
    console.error("Catalog category lookup failed:", categoriesError.message);
    return "";
  }
  if (!categories?.length) return "";

  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));

  type CatalogProduct = {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    stock_quantity: number | null;
    category_id: string;
    brand_id: string | null;
  };

  const productsById = new Map<string, CatalogProduct>();

  // Retrieve every product in each requested category in bounded pages.
  // This avoids the old .limit(40) omission while keeping each database request small.
  for (const categoryName of requested.map((item) => item.name)) {
    const category = categoryByName.get(categoryName);
    if (!category) continue;

    const pageSize = 500;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await db
        .from("products")
        .select("id, name, description, price, stock_quantity, category_id, brand_id")
        .eq("category_id", category.id)
        .order("name", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error(`Catalog product lookup failed for ${categoryName}:`, error.message);
        break;
      }

      for (const product of (data ?? []) as CatalogProduct[]) {
        productsById.set(product.id, product);
      }
      if (!data || data.length < pageSize) break;
    }
  }

  // Search for product-name matches independently of category keyword detection.
  // This helps find a specific item even when the customer doesn't say "GPU",
  // "laptop", or the exact category name.
  const queryTokens = [...new Set(
    message
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  )].slice(0, 8);

  if (queryTokens.length) {
    const nameFilters = queryTokens.map((token) => `name.ilike.%${token.replace(/[%(),]/g, "")}%`);
    const { data: directMatches, error: directMatchError } = await db
      .from("products")
      .select("id, name, description, price, stock_quantity, category_id, brand_id")
      .or(nameFilters.join(","))
      .limit(100);

    if (directMatchError) {
      console.error("Direct catalog product search failed:", directMatchError.message);
    } else {
      for (const product of (directMatches ?? []) as CatalogProduct[]) {
        productsById.set(product.id, product);
      }
    }
  }

  const allProducts = [...productsById.values()];
  if (allProducts.length === 0) return "";

  // Put strong name matches first so they survive the prompt-size guard below.
  const normalizedMessage = message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const scoreProduct = (product: CatalogProduct) => {
    const name = product.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const tokens = queryTokens.filter((token) => name.includes(token));
    const fullPhraseMatch = name.length > 0 && normalizedMessage.includes(name);
    return (fullPhraseMatch ? 1000 : 0) + tokens.length * 10;
  };

  allProducts.sort((a, b) => scoreProduct(b) - scoreProduct(a) || a.name.localeCompare(b.name));

  const brandIds = [...new Set(allProducts.map((product) => product.brand_id).filter(Boolean))];
  const { data: brands, error: brandsError } = brandIds.length
    ? await db.from("brands").select("id, name").in("id", brandIds)
    : { data: [], error: null };
  if (brandsError) console.error("Catalog brand lookup failed:", brandsError.message);

  const brandById = new Map((brands ?? []).map((brand) => [brand.id, brand.name]));
  const specsByProduct = new Map<string, Record<string, unknown>>();

  for (const category of requested) {
    if (!category.specTable || !category.specFields) continue;
    const matchingProducts = allProducts.filter(
      (product) => categoryById.get(product.category_id) === category.name,
    );
    if (!matchingProducts.length) continue;

    // Specs are fetched in chunks to avoid oversized `IN` filters.
    const chunkSize = 200;
    for (let i = 0; i < matchingProducts.length; i += chunkSize) {
      const chunk = matchingProducts.slice(i, i + chunkSize);
      const { data: specs, error: specsError } = await db
        .from(category.specTable)
        .select(category.specFields)
        .in("product_id", chunk.map((product) => product.id));

      if (specsError) {
        console.error(`Catalog ${category.specTable} lookup failed:`, specsError.message);
        continue;
      }
      for (const spec of specs ?? []) {
        const { product_id, ...details } = spec as Record<string, unknown> & { product_id: string };
        specsByProduct.set(product_id, details);
      }
    }
  }

  const lines: string[] = [
    "Catalog retrieval note: product records below were fetched from the requested categories in paginated queries, plus direct product-name matches.",
    "Prompt context may be size-limited; prioritize exact product-name matches and do not infer that an omitted product is absent from Techub.",
  ];

  for (const product of allProducts) {
    const categoryName = categoryById.get(product.category_id) ?? "Uncategorized";
    const stock = Number(product.stock_quantity ?? 0);
    const spec = specsByProduct.get(product.id);
    lines.push(JSON.stringify({
      name: product.name,
      brand: brandById.get(product.brand_id) ?? null,
      category: categoryName,
      price: product.price,
      stock_quantity: stock,
      availability: stock > 0 ? "in stock" : "out of stock",
      description: product.description || undefined,
      specifications: spec && Object.keys(spec).length ? spec : undefined,
    }));
  }

  // Keep each JSON record intact when enforcing the prompt-size guard.
  // Products were sorted with the strongest name matches first, so those records
  // are retained ahead of less relevant category listings.
  const contextLines: string[] = [];
  let contextLength = 0;
  for (const line of lines) {
    const nextLength = contextLength + line.length + 1;
    if (nextLength > 24000) break;
    contextLines.push(line);
    contextLength = nextLength;
  }
  return contextLines.join("\n");
}

// Detect concrete GPU model claims in the generated answer and compare them
// against GPU model identifiers present in the retrieved Techub catalog.
function extractGpuModels(text: string): string[] {
  const pattern = /\b(?:RTX|GTX)\s*\d{3,4}(?:\s*(?:TI|SUPER))?|\bRX\s*\d{3,4}(?:\s*XT)?\b/gi;
  return [...new Set((text.match(pattern) ?? []).map((model) =>
    model.toUpperCase().replace(/\s+/g, " ").trim()
  ))];
}

function catalogGpuProducts(catalogContext: string): Array<{
  name: string;
  price: number | string;
  stock_quantity: number;
}> {
  const products: Array<{ name: string; price: number | string; stock_quantity: number }> = [];
  for (const line of catalogContext.split("\n")) {
    if (!line.startsWith("{")) continue;
    try {
      const item = JSON.parse(line);
      if (item.category === "Graphics Cards" && typeof item.name === "string") {
        products.push({
          name: item.name,
          price: item.price,
          stock_quantity: Number(item.stock_quantity ?? 0),
        });
      }
    } catch {
      // Ignore category labels or any incomplete context line.
    }
  }
  return products;
}

function validateGpuRecommendations(reply: string, catalogContext: string): string {
  const mentionedModels = extractGpuModels(reply);
  if (mentionedModels.length === 0) return reply;

  const products = catalogGpuProducts(catalogContext);
  const catalogModels = new Set(products.flatMap((product) => extractGpuModels(product.name)));
  const unsupported = mentionedModels.filter((model) => !catalogModels.has(model));
  if (unsupported.length === 0) return reply;

  console.warn("Removed unsupported GPU recommendation; model(s) absent from retrieved catalog:", unsupported);
  const inStock = products.filter((product) => product.stock_quantity > 0).slice(0, 4);
  if (inStock.length === 0) {
    return "I couldn't verify that GPU recommendation against Techub's current catalog. I don't want to suggest a model that may not be listed or available. Please check the Graphics Cards section in the store for current options.";
  }

  const options = inStock.map((product) =>
    `- ${product.name} — ₱${Number(product.price).toLocaleString("en-PH")}`
  ).join("\n");
  return `I couldn't verify every GPU model in my initial recommendation against Techub's catalog, so I won't present those unverified models as store products. Here are some graphics cards I could verify in the retrieved catalog and that currently have stock:\n\n${options}\n\nThese are catalog listings, not a guarantee that each is the best match for your build. If you share your budget and target resolution, I can help compare these verified options.`;
}

async function getGeminiReply(
  apiKey: string,
  history: ChatMessage[],
  message: string,
  catalogContext: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let response: Response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `${SYSTEM_INSTRUCTION}

Verified catalog context for this customer message:
${catalogContext || "No matching catalog data was found. Do not claim a product is listed or in stock; ask a clarifying question or explain that availability could not be verified."}

Catalog-grounding rules:
- Treat the catalog context as the only source of truth for Techub product names, listed prices, and stock.
- Recommend only products present in the supplied catalog context when naming a Techub product.
- A product with stock_quantity 0 is out of stock. Do not describe it as available.
- Never invent a product, price, stock quantity, or specification.
- If the context does not contain enough information to verify a specification or compatibility, say so clearly and ask for the missing details.
- The supplied catalog context may be size-limited. If a requested product is not present in the context, do not conclude that Techub does not carry it; say you could not verify it from the records available for this response.
- You may give general hardware advice, but distinguish it from verified Techub catalog information.
- Prices are in the store's listed currency; do not convert or infer additional fees.`,
          }],
        },
        contents: [
          ...history.map((item) => ({
            role: item.role,
            parts: [{ text: item.text }],
          })),
          { role: "user", parts: [{ text: message }] },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const details = await response.text();
    console.error("Gemini API error:", response.status, details.slice(0, 1000));
    if (response.status === 429) throw new Error("AI_LIMIT");
    if (response.status === 503) throw new Error("AI_BUSY");
    throw new Error("AI_FAILED");
  }

  const result = await response.json();
  const reply = result.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!reply) throw new Error("AI_EMPTY");
  return reply;
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !geminiKey) {
      console.error("A required chat-support environment secret is missing.");
      return json({ error: "Chat support is not configured yet." }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return json({ error: "Please sign in to use persistent chat support." }, 401);
    }

    // Validate the caller before using the service-role client.
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return json({ error: "Your session is invalid or has expired." }, 401);
    }

    let body: { action?: unknown; message?: unknown; clientMessageId?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400);
    }

    const action = body.action ?? "send";
    if (!["load", "send", "reopen"].includes(String(action))) {
      return json({ error: "Unsupported chat action." }, 400);
    }

    if (
      action === "send" &&
      (typeof body.message !== "string" ||
        !body.message.trim() ||
        body.message.length > 4000)
    ) {
      return json({ error: "Message must contain 1–4000 characters." }, 400);
    }

    if (
      action === "send" &&
      (typeof body.clientMessageId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.clientMessageId))
    ) {
      return json({ error: "A valid client message ID is required." }, 400);
    }

    // Service role is used only after authenticating the caller.
    // This key must remain in Supabase secrets and never reach the browser.
    const db = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
      let { data: conversation, error: conversationError } = await db
        .from("support_conversations")
        .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
        .eq("customer_id", user.id)
        .maybeSingle();

      if (conversationError) {
        console.error("Conversation lookup failed:", conversationError.message);
        return json({ error: "Unable to load your support conversation." }, 500);
      }

      if (action === "load") {
        if (!conversation) return json({ conversation: null, messages: [] });

        const { data: savedMessages, error: messagesError } = await db
          .from("support_messages")
          .select("id, sender_type, sender_id, content, created_at")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Message history lookup failed:", messagesError.message);
          return json({ error: "Unable to load your message history." }, 500);
        }

        return json({ conversation, messages: savedMessages ?? [] });
      }

      if (action === "reopen") {
        if (!conversation) {
          return json({ error: "There is no conversation to reopen yet." }, 404);
        }
        if (conversation.status !== "resolved") {
          return json({ error: "This conversation is not resolved." }, 409);
        }

        const { data: reopened, error: reopenError } = await db
          .from("support_conversations")
          .update({
            status: "active",
            handoff_requested: false,
            handoff_requested_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversation.id)
          .eq("customer_id", user.id)
          .eq("status", "resolved")
          .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
          .maybeSingle();

        if (reopenError || !reopened) {
          console.error("Conversation reopen failed:", reopenError?.message);
          return json({ error: "Unable to reopen this conversation." }, 500);
        }

        return json({ conversation: reopened });
      }

      const message = (body.message as string).trim();
      const clientMessageId = body.clientMessageId as string;

      if (!conversation) {
        const { data: created, error: createError } = await db
          .from("support_conversations")
          .insert({ customer_id: user.id, status: "active" })
          .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
          .single();

        if (createError || !created) {
          console.error("Conversation creation failed:", createError?.message);
          return json({ error: "Unable to start your support conversation." }, 500);
        }
        conversation = created;
      }

      if (conversation.status === "resolved") {
        return json({
          error: "This conversation is resolved. Reopen it before sending a new message.",
          code: "CONVERSATION_RESOLVED",
        }, 409);
      }

      // Idempotency: retries reuse the same clientMessageId. Reuse the
      // persisted customer message, but resume processing if its AI reply was
      // never saved and the conversation is still active.
      const { data: existingMessage, error: existingMessageError } = await db
        .from("support_messages")
        .select("id, sender_type, sender_id, content, created_at")
        .eq("conversation_id", conversation.id)
        .eq("sender_type", "customer")
        .eq("client_message_id", clientMessageId)
        .maybeSingle();

      if (existingMessageError) {
        console.error("Idempotency lookup failed:", existingMessageError.message);
        return json({ error: "Unable to verify whether your message was already saved." }, 500);
      }

      let savedUserMessage: {
        id: string;
        sender_type: string;
        sender_id: string | null;
        content: string;
        created_at: string;
      };

      if (existingMessage) {
        const { data: followupMessages, error: followupError } = await db
          .from("support_messages")
          .select("id, sender_type, sender_id, content, created_at")
          .eq("conversation_id", conversation.id)
          .eq("reply_to_message_id", existingMessage.id)
          .eq("sender_type", "ai")
          .limit(1);

        if (followupError) {
          console.error("Idempotent reply lookup failed:", followupError.message);
          return json({ error: "Unable to check whether a reply was already saved." }, 500);
        }

        const existingReply = followupMessages?.[0] ?? null;
        const waitingForHuman =
          conversation.status === "awaiting_support" || conversation.handoff_requested;

        // A saved reply means the original request completed; return it.
        // A handoff means AI must stay stopped, even on retry.
        if (existingReply || waitingForHuman) {
          return json({
            conversation,
            userMessage: existingMessage,
            replyMessage: existingReply?.sender_type === "ai" ? existingReply : null,
            reply: existingReply?.sender_type === "ai" ? existingReply.content : null,
            handoff: {
              requested: waitingForHuman,
              status: waitingForHuman ? "awaiting_support" : "duplicate_request",
            },
            duplicate: true,
          });
        }

        // No reply was saved and the conversation is active: safely resume
        // processing the original persisted message without inserting it again.
        savedUserMessage = existingMessage;
      } else {
        const { data: insertedMessage, error: saveUserError } = await db
          .from("support_messages")
          .insert({
            conversation_id: conversation.id,
            sender_type: "customer",
            sender_id: user.id,
            content: message,
            client_message_id: clientMessageId,
          })
          .select("id, sender_type, sender_id, content, created_at")
          .single();

        if (saveUserError || !insertedMessage) {
          // A concurrent request may have inserted the same idempotency key.
          const { data: racedMessage } = await db
            .from("support_messages")
            .select("id, sender_type, sender_id, content, created_at")
            .eq("conversation_id", conversation.id)
            .eq("sender_type", "customer")
            .eq("client_message_id", clientMessageId)
            .maybeSingle();

          if (racedMessage) {
            return json({
              conversation,
              userMessage: racedMessage,
              replyMessage: null,
              reply: null,
              handoff: {
                requested: conversation.status === "awaiting_support" || conversation.handoff_requested,
                status: conversation.status === "awaiting_support" ? "awaiting_support" : "duplicate_request",
              },
              duplicate: true,
            });
          }

          console.error("Customer message save failed:", saveUserError?.message);
          return json({ error: "Unable to save your message. Please try again." }, 500);
        }

        savedUserMessage = insertedMessage;
      }

      // Always use the persisted message body on retries, not a changed body
      // supplied with a previously used clientMessageId.
      const processingMessage = savedUserMessage.content;

      const now = new Date().toISOString();
      await db.from("support_conversations")
        .update({ updated_at: now })
        .eq("id", conversation.id)
        .eq("customer_id", user.id);

      // Once human support has been requested, keep saving customer messages
      // but do not generate additional AI replies while the conversation waits.
      if (conversation.status === "awaiting_support" || conversation.handoff_requested) {
        return json({
          conversation: {
            ...conversation,
            updated_at: now,
          },
          userMessage: savedUserMessage,
          replyMessage: null,
          reply: null,
          handoff: { requested: true, status: "awaiting_support" },
        });
      }

      if (requestsHumanSupport(processingMessage)) {
        // Perform the status transition and acknowledgment insert atomically.
        // The database function locks the conversation row and prevents duplicate
        // handoff acknowledgments when requests arrive concurrently.
        const { data: handoffResult, error: handoffError } = await db.rpc(
          "request_human_support",
          {
            p_conversation_id: conversation.id,
            p_customer_id: user.id,
          },
        );

        if (handoffError) {
          console.error("Handoff request failed:", handoffError.message);
          return json({
            error: "Your message was saved, but we couldn't complete the handoff request. Please reload the chat.",
          }, 500);
        }

        if (!handoffResult?.accepted) {
          // Another request may have changed the conversation before this RPC
          // acquired the row lock. Reload current state instead of claiming success.
          const { data: latestConversation, error: latestConversationError } = await db
            .from("support_conversations")
            .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
            .eq("id", conversation.id)
            .eq("customer_id", user.id)
            .maybeSingle();

          if (latestConversationError || !latestConversation) {
            console.error("Conversation lookup after rejected handoff failed:", latestConversationError?.message);
            return json({ error: "The conversation changed while your request was being processed. Please reload the chat." }, 500);
          }

          return json({
            conversation: latestConversation,
            userMessage: savedUserMessage,
            replyMessage: null,
            reply: null,
            handoff: {
              requested: latestConversation.status === "awaiting_support" || latestConversation.handoff_requested,
              status: latestConversation.status === "awaiting_support" ? "awaiting_support" : latestConversation.status,
            },
          }, 409);
        }

        return json({
          conversation: handoffResult.conversation,
          userMessage: savedUserMessage,
          replyMessage: handoffResult.replyMessage,
          reply: handoffResult.reply,
          handoff: { requested: true, status: "awaiting_support" },
        });
      }

      // Claim this exact customer message before doing catalog or AI work.
      // Concurrent retries either reuse a completed reply, wait for the owner,
      // or reclaim an expired/failed lease.
      const { data: claimResult, error: claimError } = await db.rpc("claim_ai_reply", {
        p_conversation_id: conversation.id,
        p_customer_id: user.id,
        p_customer_message_id: savedUserMessage.id,
        p_lease_seconds: 120,
      });

      if (claimError || !claimResult) {
        console.error("AI reply claim failed:", claimError?.message);
        return json({ error: "Unable to prepare your reply safely. Please try again." }, 500);
      }

      if (claimResult.status === "completed" && claimResult.replyMessage) {
        return json({
          conversation,
          userMessage: savedUserMessage,
          replyMessage: claimResult.replyMessage,
          reply: claimResult.replyMessage.content,
          handoff: { requested: false, status: "not_requested" },
          duplicate: true,
        });
      }

      if (claimResult.status === "busy") {
        return json({
          conversation,
          userMessage: savedUserMessage,
          replyMessage: null,
          reply: null,
          processing: true,
          code: "AI_REPLY_IN_PROGRESS",
        }, 202);
      }

      if (claimResult.status !== "claimed" || typeof claimResult.claimToken !== "string") {
        const { data: latestConversation } = await db
          .from("support_conversations")
          .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
          .eq("id", conversation.id)
          .eq("customer_id", user.id)
          .maybeSingle();
        return json({
          conversation: latestConversation ?? conversation,
          userMessage: savedUserMessage,
          replyMessage: null,
          reply: null,
          handoff: {
            requested: !!(latestConversation?.handoff_requested || latestConversation?.status === "awaiting_support"),
            status: latestConversation?.status ?? "inactive",
          },
        }, 409);
      }
      const aiClaimToken = claimResult.claimToken as string;
      const releaseAiClaim = async (reason: string) => {
        const { error } = await db.rpc("fail_ai_reply", {
          p_customer_message_id: savedUserMessage.id,
          p_claim_token: aiClaimToken,
          p_error: reason,
        });
        if (error) console.error("AI claim release failed:", error.message);
      };

      // Use persisted history rather than trusting browser-supplied history.
      const { data: priorMessages, error: historyError } = await db
        .from("support_messages")
        .select("sender_type, content")
        .eq("conversation_id", conversation.id)
        .neq("id", savedUserMessage.id)
        .order("created_at", { ascending: true })
        .limit(40);

      if (historyError) {
        console.error("Conversation history lookup failed:", historyError.message);
        await releaseAiClaim("Conversation history lookup failed");
        return json({ error: "Unable to prepare your conversation history." }, 500);
      }

      const history: ChatMessage[] = (priorMessages ?? [])
        .filter((item) => item.sender_type === "customer" || item.sender_type === "ai")
        .map((item) => ({
          role: item.sender_type === "customer" ? "user" : "model",
          text: item.content,
        }))
        .slice(-12);

      let catalogContext = "";
      try {
        catalogContext = await getCatalogContext(db, processingMessage);
      } catch (catalogError) {
        console.error("Catalog context retrieval failed:", catalogError);
      }

      let reply: string;
      try {
        reply = await getGeminiReply(geminiKey, history, processingMessage, catalogContext);
        // Enforce a deterministic catalog check for explicit GPU model names.
        // This leaves non-GPU support responses and persistence unchanged.
        if (requestedCatalogCategories(message).some((category) => category.name === "Graphics Cards")) {
          reply = validateGpuRecommendations(reply, catalogContext);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          await releaseAiClaim("AI request timed out");
          return json({ error: "The AI took too long to respond. Please try again." }, 504);
        }
        if (error instanceof Error && error.message === "AI_LIMIT") {
          await releaseAiClaim("AI usage limit reached");
          return json({ error: "AI usage limit reached. Please try again later." }, 502);
        }
        if (error instanceof Error && error.message === "AI_BUSY") {
          await releaseAiClaim("AI service busy");
          return json({ error: "The AI service is busy. Please try again shortly." }, 502);
        }
        if (error instanceof Error && error.message === "AI_EMPTY") {
          await releaseAiClaim("AI returned empty response");
          return json({ error: "The AI returned an empty response." }, 502);
        }
        console.error("Gemini request failed:", error);
        await releaseAiClaim("Gemini request failed");
        return json({ error: "The AI assistant could not respond. Please try again." }, 502);
      }

      // The database function locks the conversation row and checks its current
      // state in the same transaction that inserts the AI reply. This serializes
      // the final save against a concurrent human-handoff status update.
      const { data: aiMessage, error: saveAiError } = await db.rpc(
        "save_ai_reply_if_active",
        {
          p_conversation_id: conversation.id,
          p_customer_id: user.id,
          p_customer_message_id: savedUserMessage.id,
          p_claim_token: aiClaimToken,
          p_content: reply,
        },
      );

      if (saveAiError) {
        console.error("AI message save failed:", saveAiError.message);
        await releaseAiClaim("AI reply persistence failed");
        return json({ error: "The AI replied, but we couldn't save its response. Please try again." }, 500);
      }

      // A null result means handoff/resolution won the race while Gemini was
      // generating. Do not return or persist the generated AI response.
      if (!aiMessage) {
        const { data: latestConversation, error: latestConversationError } = await db
          .from("support_conversations")
          .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
          .eq("id", conversation.id)
          .eq("customer_id", user.id)
          .single();

        if (latestConversationError || !latestConversation) {
          console.error("Conversation state lookup after skipped AI reply failed:", latestConversationError?.message);
          return json({ error: "The conversation changed while your reply was being prepared. Please reload the chat." }, 500);
        }

        return json({
          conversation: latestConversation,
          userMessage: savedUserMessage,
          replyMessage: null,
          reply: null,
          handoff: {
            requested: latestConversation.status === "awaiting_support" || latestConversation.handoff_requested,
            status: latestConversation.status === "awaiting_support" ? "awaiting_support" : latestConversation.status,
          },
        });
      }

      const { data: updatedConversation } = await db
        .from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id)
        .eq("customer_id", user.id)
        .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
        .single();

      return json({
        conversation: updatedConversation ?? conversation,
        userMessage: savedUserMessage,
        replyMessage: aiMessage,
        reply,
        handoff: { requested: false, status: "not_requested" },
      });
    } catch (error) {
      console.error("Chat support persistence error:", error);
      return json({ error: "Unable to process chat support right now." }, 500);
    }
  },
};
