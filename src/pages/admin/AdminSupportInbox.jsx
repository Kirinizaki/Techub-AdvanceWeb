import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { supabase } from "../../lib/supabaseClient";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const shortId = (value) => (value ? `${value.slice(0, 8)}…` : "Unknown customer");

export default function AdminSupportInbox({ onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const messagesEndRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const preserveScrollRef = useRef(null);
  const oldestMessageRef = useRef(null);
  const selectedIdRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((item) =>
      `${item.customer_id} ${item.id}`.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  const callSupport = useCallback(async (body) => {
    const { data, error: invokeError } = await supabase.functions.invoke(
      "manage-support",
      { body },
    );
    if (invokeError) {
      let message = invokeError.message || "Support request failed.";
      try {
        const response = invokeError.context;
        if (response && typeof response.json === "function") {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        }
      } catch {
        // Keep the original invocation error when no JSON response is available.
      }
      throw new Error(message);
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const loadConversations = useCallback(async (keepSelection = true) => {
    setLoadingConversations(true);
    setError("");
    try {
      const data = await callSupport({ action: "list" });
      const items = data.conversations ?? [];
      const newestFirst = [...items].sort((a, b) => {
        const aTime = new Date(a.handoff_requested_at || a.updated_at || a.created_at || 0).getTime();
        const bTime = new Date(b.handoff_requested_at || b.updated_at || b.created_at || 0).getTime();
        return bTime - aTime;
      });
      setConversations(newestFirst);
      setSelectedId((current) => {
        if (keepSelection && current && newestFirst.some((item) => item.id === current)) return current;
        return null;
      });
    } catch (err) {
      setError(err.message || "Unable to load the support inbox.");
    } finally {
      setLoadingConversations(false);
    }
  }, [callSupport]);

  useEffect(() => {
    loadConversations(false);
  }, [loadConversations]);

  const loadMessages = useCallback(async (conversationId, options = {}) => {
    if (!conversationId) {
      setMessages([]);
      setHasOlderMessages(false);
      return;
    }
    const { older = false } = options;
    if (older) setLoadingOlder(true);
    else setLoadingMessages(true);
    setError("");
    try {
      const before = older ? oldestMessageRef.current : null;
      const data = await callSupport({
        action: "messages",
        conversation_id: conversationId,
        limit: 30,
        before,
      });
      const page = data.messages ?? [];
      if (older) {
        const scroller = messagesScrollRef.current;
        preserveScrollRef.current = scroller
          ? { height: scroller.scrollHeight, top: scroller.scrollTop }
          : null;
        setMessages((current) => [...page, ...current]);
      } else {
        setMessages(page);
        // Initial page contains the newest messages; jump to its bottom after render.
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
        });
      }
      if (page.length) oldestMessageRef.current = page[0].created_at;
      setHasOlderMessages(Boolean(data.has_more));
    } catch (err) {
      if (!older) setMessages([]);
      setError(err.message || "Unable to load conversation messages.");
    } finally {
      if (older) setLoadingOlder(false);
      else setLoadingMessages(false);
    }
  }, [callSupport]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    oldestMessageRef.current = null;
    setHasOlderMessages(false);
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  // Preserve the reader's viewport after older messages are prepended.
  useEffect(() => {
    const saved = preserveScrollRef.current;
    const scroller = messagesScrollRef.current;
    if (!saved || !scroller) return;
    scroller.scrollTop = saved.top + (scroller.scrollHeight - saved.height);
    preserveScrollRef.current = null;
  }, [messages]);

  const handleMessagesScroll = useCallback(() => {
    const scroller = messagesScrollRef.current;
    if (!scroller || !selectedId || loadingMessages || loadingOlder || !hasOlderMessages) return;
    if (scroller.scrollTop <= 80) loadMessages(selectedId, { older: true });
  }, [selectedId, loadingMessages, loadingOlder, hasOlderMessages, loadMessages]);

  // When a new conversation opens, start at the latest message.
  useEffect(() => {
    if (!selectedId || loadingMessages || loadingOlder || preserveScrollRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [selectedId, loadingMessages, loadingOlder]);

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedId || sending) return;

    setSending(true);
    setError("");
    setNotice("");
    try {
      const data = await callSupport({
        action: "reply",
        conversation_id: selectedId,
        content,
      });
      if (data.message) {
        setMessages((current) => [...current, data.message]);
      }
      setDraft("");
      setNotice("Reply sent successfully.");
      await loadConversations(true);
    } catch (err) {
      setError(err.message || "Unable to send reply.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="flex h-[calc(100dvh-10.5rem)] min-h-[440px] flex-col gap-3 overflow-hidden">
        <header className="flex shrink-0 flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-600">Customer Service</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Support Inbox</h1>
            <p className="mt-1 text-sm text-slate-500">Review handoffs from the customer chatbot and reply directly.</p>
          </div>
          <button
            type="button"
            onClick={() => loadConversations(true)}
            disabled={loadingConversations}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={loadingConversations ? "animate-spin" : ""} />
            Refresh inbox
          </button>
        </header>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} /> {notice}
          </div>
        )}

        <section className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!selectedId && <aside className="flex min-h-0 w-full flex-col">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Waiting for support</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{conversations.length}</span>
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 focus-within:border-blue-400">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer or ID"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  aria-label="Search conversations"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingConversations && conversations.length === 0 ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Loading inbox…</div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <MessageCircle size={28} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No conversations found</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Conversations appear here after a customer requests human support.</p>
                </div>
              ) : filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => { setSelectedId(conversation.id); setNotice(""); }}
                  className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${selectedId === conversation.id ? "bg-blue-50/70" : "bg-white"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserRound size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">Customer {shortId(conversation.customer_id)}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{formatDate(conversation.handoff_requested_at || conversation.updated_at)}</span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">Conversation {shortId(conversation.id)}</span>
                      <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Awaiting support</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>}

          {selectedConversation ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => { setSelectedId(null); setMessages([]); setDraft(""); setNotice(""); }}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Back to conversations"
                    title="Back to conversations"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><UserRound size={19} /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-slate-900">Customer {shortId(selectedConversation.customer_id)}</h2>
                    <p className="mt-0.5 truncate text-xs text-slate-500">Conversation ID: {selectedConversation.id}</p>
                  </div>
                  <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex">Awaiting support</span>
                </div>

                <div ref={messagesScrollRef} onScroll={handleMessagesScroll} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain bg-white px-4 py-3 sm:px-6">
                  {loadingOlder && <div className="sticky top-0 z-10 flex items-center justify-center gap-2 rounded-full bg-white/95 py-2 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" /> Loading older messages…</div>}
                  {!loadingMessages && hasOlderMessages && <p className="py-1 text-center text-[11px] text-slate-400">Scroll up to load previous messages</p>}
                  {loadingMessages ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">No messages to display.</div>
                  ) : messages.map((message) => {
                    const isHuman = message.sender_type === "human";
                    const isCustomer = message.sender_type === "customer";
                    const isStaffSide = isHuman;
                    return (
                      <div key={message.id} className={`flex ${isStaffSide ? "justify-end" : "justify-start"}`}>
                        <div className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${isStaffSide ? "items-end" : "items-start"}`}>
                          {!isCustomer && !isHuman && <span className="mb-1 ml-1 text-[10px] font-medium text-violet-700">Techub AI</span>}
                          <div className={`rounded-2xl px-3.5 py-2 ${isStaffSide ? "rounded-br-md bg-blue-600 text-white" : isCustomer ? "rounded-bl-md bg-slate-100 text-slate-900" : "rounded-bl-md bg-violet-50 text-slate-800"}`}>
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-5">{message.content}</p>
                          </div>
                          <span className={`mt-1 px-1 text-[10px] text-slate-400 ${isStaffSide ? "text-right" : "text-left"}`}>
                            {isHuman ? "You" : isCustomer ? "Customer" : ""}{(isHuman || isCustomer) ? " · " : ""}{formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
                  <label htmlFor="support-reply" className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Reply as staff</label>
                  <div className="flex items-end gap-3">
                    <textarea
                      id="support-reply"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={4000}
                      rows={2}
                      placeholder="Write a helpful reply…"
                      disabled={sending || loadingMessages}
                      className="min-h-12 max-h-32 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending || loadingMessages}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400">Up to 4,000 characters · AI replies remain paused during handoff.</p>
                </form>
              </>
            </div>
          ) : (
            <div className="hidden" aria-hidden="true">
              <ArrowDownLeft size={1} />
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
