import { useCallback, useEffect, useRef, useState } from "react";
import { Headset, X, Send, Bot, UserRound, RotateCcw } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

function mapSavedMessage(item) {
  const sender =
    item.sender_type === "customer"
      ? "user"
      : item.sender_type === "human"
        ? "staff"
        : "support";

  return {
    id: item.id,
    text: item.content,
    sender,
    staffName: item.sender_type === "human" ? "Techub Support Agent" : undefined,
    createdAt: item.created_at,
  };
}

function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const invokeChat = useCallback(async (body) => {
    const { data, error } = await supabase.functions.invoke("chat-support", {
      body,
    });
    if (error) throw error;
    if (!data) throw new Error("Chat support returned no data.");
    if (data.error) {
      const requestError = new Error(data.error);
      requestError.code = data.code;
      throw requestError;
    }
    return data;
  }, []);

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await invokeChat({ action: "load" });
      setConversation(data.conversation ?? null);
      setMessages((data.messages ?? []).map(mapSavedMessage));
      setIsLoaded(true);
    } catch (error) {
      console.error("Unable to load support conversation:", error);
      setLoadError(
        error?.message || "We couldn't load your saved chat. Please sign in and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [invokeChat]);

  useEffect(() => {
    if (isOpen && !isLoaded) loadConversation();
  }, [isOpen, isLoaded, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleReopen = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await invokeChat({ action: "reopen" });
      setConversation(data.conversation);
      setLoadError("");
    } catch (error) {
      console.error("Unable to reopen support conversation:", error);
      setLoadError(error?.message || "We couldn't reopen this conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || isLoading || !isLoaded) return;

    if (conversation?.status === "resolved") {
      setLoadError("This conversation is resolved. Reopen it before sending a message.");
      return;
    }

    setMessage("");
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await invokeChat({ action: "send", message: text });
      if (data.conversation) setConversation(data.conversation);

      setMessages((prev) => [
        ...prev,
        mapSavedMessage(data.userMessage ?? {
          id: crypto.randomUUID(),
          sender_type: "customer",
          content: text,
          created_at: new Date().toISOString(),
        }),
        mapSavedMessage(data.replyMessage ?? {
          id: crypto.randomUUID(),
          sender_type: "ai",
          content: data.reply,
          created_at: new Date().toISOString(),
        }),
      ]);
    } catch (error) {
      console.error("Chat support error:", error);
      setMessage(text);
      setLoadError(error?.message || "Sorry, we couldn't send your message. Please try again.");
      if (error?.code === "CONVERSATION_RESOLVED") {
        await loadConversation();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-4 flex h-112.5 w-85 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-[#0b1025] p-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Headset size={21} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Techub Support</h3>
              <p className="text-xs text-gray-300">
                {conversation?.status === "awaiting_support"
                  ? "Human support requested"
                  : conversation?.status === "resolved"
                    ? "Conversation resolved"
                    : "AI Assistant"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {!isLoaded && !loadError && (
              <p className="text-sm text-gray-500" role="status">
                Loading your saved conversation...
              </p>
            )}

            {loadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700" role="alert">
                {loadError}
                <button type="button" onClick={loadConversation} className="ml-2 underline">
                  Retry
                </button>
              </div>
            )}

            {isLoaded && messages.length === 0 && (
              <div className="self-start rounded-xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Bot size={13} className="text-blue-600" />
                  Techub AI Assistant
                </div>
                Hi! Welcome to Techub. How can we help you today?
              </div>
            )}

            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex max-w-[90%] flex-col gap-1 ${item.sender === "user" ? "self-end" : "self-start"}`}
              >
                {item.sender !== "user" && (
                  <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-gray-500">
                    {item.sender === "staff" ? <UserRound size={13} /> : <Bot size={13} className="text-blue-600" />}
                    <span>
                      {item.sender === "staff" ? item.staffName || "Techub Support Agent" : "Techub AI Assistant"}
                    </span>
                  </div>
                )}
                <div
                  className={`whitespace-pre-wrap wrap-break-word rounded-xl px-3 py-2 text-sm ${
                    item.sender === "user"
                      ? "rounded-br-sm bg-blue-600 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {conversation?.status === "resolved" && (
              <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                <p className="mb-2 text-gray-700">
                  This conversation has been resolved. Your previous messages are saved.
                </p>
                <button
                  type="button"
                  onClick={handleReopen}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Reopen conversation
                </button>
              </div>
            )}

            {isLoading && (
              <div className="self-start rounded-xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500" role="status">
                Techub is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={conversation?.status === "resolved" ? "Reopen chat to continue..." : "Type your message..."}
              aria-label="Type your message"
              disabled={isLoading || !isLoaded || conversation?.status === "resolved"}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading || !isLoaded || conversation?.status === "resolved"}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close chat support" : "Open chat support"}
          aria-expanded={isOpen}
          className="flex h-14.5 w-38 items-center justify-center gap-2 rounded-lg bg-[#A9C5FF] text-[#0B1025] shadow-lg transition hover:bg-[#94B6FF]"
        >
          <Headset size={21} strokeWidth={2} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[8px] font-semibold uppercase tracking-wide">Need Help?</span>
            <span className="text-sm font-bold">Chat Support</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default ChatSupport;
