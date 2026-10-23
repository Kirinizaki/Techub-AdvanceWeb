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

Help customers with computer hardware, gaming and productivity laptops,
PC components, troubleshooting, and general store support.

Rules:
- Be friendly, clear, and concise.
- Answer general computer questions when you can.
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

async function getGeminiReply(
  apiKey: string,
  history: ChatMessage[],
  message: string,
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
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
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

    let body: { action?: unknown; message?: unknown };
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

      const { data: savedUserMessage, error: saveUserError } = await db
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          sender_type: "customer",
          sender_id: user.id,
          content: message,
        })
        .select("id, sender_type, sender_id, content, created_at")
        .single();

      if (saveUserError || !savedUserMessage) {
        console.error("Customer message save failed:", saveUserError?.message);
        return json({ error: "Unable to save your message. Please try again." }, 500);
      }

      const now = new Date().toISOString();
      await db.from("support_conversations")
        .update({ updated_at: now })
        .eq("id", conversation.id)
        .eq("customer_id", user.id);

      if (requestsHumanSupport(message)) {
        const { data: handoffConversation, error: handoffError } = await db
          .from("support_conversations")
          .update({
            status: "awaiting_support",
            handoff_requested: true,
            handoff_requested_at: now,
            updated_at: now,
          })
          .eq("id", conversation.id)
          .eq("customer_id", user.id)
          .select("id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at")
          .single();

        if (handoffError) {
          console.error("Handoff status save failed:", handoffError.message);
          return json({ error: "Your message was saved, but we couldn't record the handoff request." }, 500);
        }

        const reply =
          "I understand you'd like to speak with a human support agent. " +
          "Your request has been saved, but automatic staff notification and live transfer " +
          "aren't available yet. A staff member has not been notified through this chat. " +
          "Please use Techub's available support channel to contact the team.";

        const { data: aiMessage, error: aiSaveError } = await db
          .from("support_messages")
          .insert({
            conversation_id: conversation.id,
            sender_type: "ai",
            sender_id: null,
            content: reply,
          })
          .select("id, sender_type, sender_id, content, created_at")
          .single();

        if (aiSaveError) {
          console.error("Handoff reply save failed:", aiSaveError.message);
          return json({ error: "Your handoff request was saved, but the reply could not be saved." }, 500);
        }

        return json({
          conversation: handoffConversation,
          userMessage: savedUserMessage,
          replyMessage: aiMessage,
          reply,
          handoff: { requested: true, status: "saved_not_notified" },
        });
      }

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
        return json({ error: "Unable to prepare your conversation history." }, 500);
      }

      const history: ChatMessage[] = (priorMessages ?? [])
        .filter((item) => item.sender_type === "customer" || item.sender_type === "ai")
        .map((item) => ({
          role: item.sender_type === "customer" ? "user" : "model",
          text: item.content,
        }))
        .slice(-12);

      let reply: string;
      try {
        reply = await getGeminiReply(geminiKey, history, message);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return json({ error: "The AI took too long to respond. Please try again." }, 504);
        }
        if (error instanceof Error && error.message === "AI_LIMIT") {
          return json({ error: "AI usage limit reached. Please try again later." }, 502);
        }
        if (error instanceof Error && error.message === "AI_BUSY") {
          return json({ error: "The AI service is busy. Please try again shortly." }, 502);
        }
        if (error instanceof Error && error.message === "AI_EMPTY") {
          return json({ error: "The AI returned an empty response." }, 502);
        }
        console.error("Gemini request failed:", error);
        return json({ error: "The AI assistant could not respond. Please try again." }, 502);
      }

      const { data: aiMessage, error: saveAiError } = await db
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          sender_type: "ai",
          sender_id: null,
          content: reply,
        })
        .select("id, sender_type, sender_id, content, created_at")
        .single();

      if (saveAiError) {
        console.error("AI message save failed:", saveAiError.message);
        return json({ error: "The AI replied, but we couldn't save its response. Please try again." }, 500);
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
