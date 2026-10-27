
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const isValidUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Required Supabase environment variables are missing.");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    // Verify the caller's actual Supabase session.
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
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Invalid or expired session." }, 401);
    }

    // Use the service-role client only after verifying the caller.
    // Never expose this key to the frontend.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Authorization is checked server-side for every request.
    const { data: roleRecord, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "employee"])
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error("Unable to verify staff role:", roleError.message);
      return jsonResponse({ error: "Unable to verify permissions." }, 500);
    }

    if (!roleRecord) {
      return jsonResponse(
        { error: "You are not authorized to access staff support." },
        403,
      );
    }

    let body: {
      action?: string;
      conversation_id?: string;
      content?: string;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON request." }, 400);
    }

    // List conversations currently awaiting human support.
    if (body.action === "list") {
      const { data, error } = await adminClient
        .from("support_conversations")
        .select(
          "id, customer_id, status, handoff_requested, handoff_requested_at, created_at, updated_at",
        )
        .eq("status", "awaiting_support")
        .eq("handoff_requested", true)
        .order("handoff_requested_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Unable to load support inbox:", error.message);
        return jsonResponse({ error: "Unable to load support inbox." }, 500);
      }

      return jsonResponse({ conversations: data ?? [] });
    }

    // Load messages for a conversation in the active support queue.
    if (body.action === "messages") {
      if (!isValidUuid(body.conversation_id)) {
        return jsonResponse({ error: "Invalid conversation ID." }, 400);
      }

      const { data: conversation, error: conversationError } =
        await adminClient
          .from("support_conversations")
          .select("id, status, handoff_requested")
          .eq("id", body.conversation_id)
          .eq("status", "awaiting_support")
          .eq("handoff_requested", true)
          .maybeSingle();

      if (conversationError) {
        console.error("Unable to verify conversation:", conversationError.message);
        return jsonResponse({ error: "Unable to load conversation." }, 500);
      }

      if (!conversation) {
        return jsonResponse(
          { error: "Conversation is not in the active support queue." },
          404,
        );
      }

      const { data: messages, error: messagesError } = await adminClient
        .from("support_messages")
        .select(
          "id, conversation_id, sender_type, sender_id, content, created_at, reply_to_message_id",
        )
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(500);

      if (messagesError) {
        console.error("Unable to load messages:", messagesError.message);
        return jsonResponse({ error: "Unable to load messages." }, 500);
      }

      return jsonResponse({ conversation, messages: messages ?? [] });
    }

    // Send a human reply. The AI handoff remains active.
    if (body.action === "reply") {
      if (!isValidUuid(body.conversation_id)) {
        return jsonResponse({ error: "Invalid conversation ID." }, 400);
      }

      if (typeof body.content !== "string") {
        return jsonResponse({ error: "Message content is required." }, 400);
      }

      const content = body.content.trim();

      if (!content) {
        return jsonResponse({ error: "Message cannot be empty." }, 400);
      }

      if (content.length > 4000) {
        return jsonResponse(
          { error: "Message cannot exceed 4000 characters." },
          400,
        );
      }

      const { data: conversation, error: conversationError } =
        await adminClient
          .from("support_conversations")
          .select("id")
          .eq("id", body.conversation_id)
          .eq("status", "awaiting_support")
          .eq("handoff_requested", true)
          .maybeSingle();

      if (conversationError) {
        console.error("Unable to verify conversation:", conversationError.message);
        return jsonResponse({ error: "Unable to send reply." }, 500);
      }

      if (!conversation) {
        return jsonResponse(
          { error: "Conversation is not awaiting human support." },
          409,
        );
      }

      const { data: message, error: insertError } = await adminClient
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          sender_type: "human",
          sender_id: user.id,
          content,
        })
        .select(
          "id, conversation_id, sender_type, sender_id, content, created_at, reply_to_message_id",
        )
        .single();

      if (insertError) {
        console.error("Unable to save human reply:", insertError.message);
        return jsonResponse({ error: "Unable to save reply." }, 500);
      }

      const { error: updateError } = await adminClient
        .from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id)
        .eq("status", "awaiting_support")
        .eq("handoff_requested", true);

      if (updateError) {
        // The reply was saved; report the timestamp update issue separately.
        console.error("Unable to update conversation timestamp:", updateError.message);
      }

      return jsonResponse({ message });
    }

    return jsonResponse(
      { error: "Unknown action. Use list, messages, or reply." },
      400,
    );
  } catch (error) {
    console.error("Unexpected manage-support error:", error);
    return jsonResponse({ error: "An unexpected server error occurred." }, 500);
  }
});
