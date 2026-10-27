import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Package,
  Printer,
  Search,
  Truck,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { supabase } from "../../lib/supabaseClient";
import { edgeFunctionErrorMessage } from "../../lib/edgeFunctionErrors";
import { fetchAllRows } from "../../lib/fetchAllRows";

/* The existing schema stores fulfillment state on orders.order_status.
   Confirmation already owns the stock deduction workflow; fulfillment only
   advances the status with an expected-current-status guard. */
const RPC = {
  confirm: (id) => ["confirm_customer_order", { p_order_id: id }],
  cancel: (id) => ["cancel_customer_order", { p_order_id: id }],
  collect: (id) => ["record_cod_collection", { p_order_id: id }],
};

const PAGE_SIZE = 8;

const TABS = [
  { key: "All", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLE = {
  pending: { pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  confirmed: { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  processing: { pill: "bg-slate-100 text-slate-600", dot: "bg-slate-500" },
  shipped: { pill: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
  delivered: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-600" },
  cancelled: { pill: "bg-rose-100 text-rose-600", dot: "bg-rose-500" },
};

const PAYMENT_DOT = {
  paid: "bg-emerald-500",
  unpaid: "bg-amber-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
  refunded: "bg-slate-500",
  partially_refunded: "bg-slate-500",
};

const DATE_RANGES = ["All Time", "Today", "Last 7 Days", "Last 30 Days"];

const formatPrice = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

const label = (s) =>
  String(s ?? "")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

const isToday = (iso) =>
  iso && new Date(iso).toDateString() === new Date().toDateString();

/* ---- Defensive readers: shipping_address (jsonb) and order_items
   column names are not confirmed, so we try the common variants. ---- */
function customerName(o) {
  const a = o.shipping_address ?? {};
  return (
    a.full_name ??
    a.fullName ??
    a.name ??
    a.recipient_name ??
    [a.first_name, a.last_name].filter(Boolean).join(" ") ??
    ""
  ) || o.customer_email || "Customer";
}

function customerLocation(o) {
  const a = o.shipping_address ?? {};
  return (
    [a.city ?? a.municipality, a.province ?? a.state].filter(Boolean).join(", ") ||
    a.address ||
    a.address_line1 ||
    "—"
  );
}

function itemName(it) {
  return (
    it.product_name ?? it.name ?? it.title ?? it.sku ?? it.products?.name ?? "Item"
  );
}
const itemQty = (it) => it.quantity ?? it.qty ?? 1;
const itemTotal = (it) =>
  it.line_total ?? it.total ?? it.total_price ?? it.subtotal ?? null;

function toOrder(row) {
  return {
    ...row,
    items: row.order_items ?? [],
    _name: customerName(row),
    _location: customerLocation(row),
  };
}

/* ---- Which staff actions are valid for an order right now ---- */
function getActions(o) {
  const s = o.order_status;
  const actions = [];

  if (s === "pending") {
    actions.push({
      key: "confirm",
      label: "Confirm",
      tone: "primary",
      call: () => RPC.confirm(o.id),
      title: "Confirm this order?",
      body: "This checks stock for every item and deducts it. If any item is short, nothing is deducted and the order stays pending.",
    });
  }
  if (s === "confirmed") {
    actions.push({
      key: "processing",
      label: "Start Processing",
      tone: "primary",
      from: "confirmed",
      to: "processing",
    });
  }
  if (s === "processing") {
    actions.push({
      key: "shipped",
      label: "Mark Shipped",
      tone: "primary",
      from: "processing",
      to: "shipped",
    });
  }
  if (s === "shipped") {
    actions.push({
      key: "delivered",
      label: "Mark Delivered",
      tone: "primary",
      from: "shipped",
      to: "delivered",
    });
  }
  if (s === "delivered" && o.payment_status !== "paid") {
    actions.push({
      key: "collect",
      label: "Record COD",
      tone: "success",
      call: () => RPC.collect(o.id),
      title: "Record COD collection?",
      body: "This marks the order as paid. Only do this once the cash has been received.",
    });
  }
  if (s === "pending" || s === "confirmed") {
    actions.push({
      key: "cancel",
      label: "Cancel",
      tone: "danger",
      call: () => RPC.cancel(o.id),
      title: "Cancel this order?",
      body:
        s === "confirmed"
          ? "Stock that was deducted on confirmation will be restored."
          : "The order will be cancelled. No stock was deducted yet.",
    });
  }
  return actions;
}

const TONE = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
};

export default function AdminOrderFulfillment({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null); // { type, text }
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("All Time");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [confirming, setConfirming] = useState(null); // { order, action }

  async function loadOrders() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await fetchAllRows(() => supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }));

    if (error) {
      console.error("Order list load failed:", error);
      setLoadError("Could not load orders. Refresh to try again.");
      setOrders([]);
    } else {
      setOrders((data ?? []).map(toOrder));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function runAction(order, action) {
    setConfirming(null);
    setBusyId(order.id);
    try {
      let error;

if (action.to) {
  const { data, error: rpcError } = await supabase.rpc(
    "update_order_fulfillment",
    {
      p_order_id: order.id,
      p_new_status: action.to,
    }
  );

  error = rpcError;

  if (!error && data?.error) {
    error = new Error(data.error);
  }
} else {
  const [fn, args] = action.call();
  ({ error } = await supabase.rpc(fn, args));
}

      if (error) {
        console.error("Order action failed:", error);
        setNotice({
          type: "error",
          text: `${action.label} failed on ${order.order_number}: ${action.to ? await edgeFunctionErrorMessage(error) : "Please refresh and try again."}`,
        });
        return;
      }
      setNotice({ type: "success", text: `${action.label} done for ${order.order_number}.` });
      await loadOrders();
    } catch (error) {
      setNotice({
        type: "error",
        text: `${action.label} failed on ${order.order_number}: ${error.message}`,
      });
    } finally {
      setBusyId(null);
    }
  }

  function onActionClick(order, action) {
    if (action.title) setConfirming({ order, action });
    else if (!busyId) runAction(order, action);
  }

  /* ---- Summary numbers (computed from real data) ---- */
  const stats = useMemo(() => {
    const by = (s) => orders.filter((o) => o.order_status === s);
    const deliveredToday = by("delivered").filter((o) => isToday(o.updated_at));
    return {
      pending: by("pending").length,
      inProgress: by("confirmed").length + by("processing").length,
      shipped: by("shipped").length,
      deliveredToday: deliveredToday.length,
      deliveredTodayTotal: deliveredToday.reduce((s, o) => s + Number(o.total || 0), 0),
      awaitingCod: by("delivered").filter((o) => o.payment_status !== "paid").length,
    };
  }, [orders]);

  const tabCounts = useMemo(() => {
    const counts = { All: orders.length };
    orders.forEach((o) => {
      counts[o.order_status] = (counts[o.order_status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const days = { Today: 1, "Last 7 Days": 7, "Last 30 Days": 30 }[range];

    return orders.filter((o) => {
      if (activeTab !== "All" && o.order_status !== activeTab) return false;

      if (range === "Today" && !isToday(o.created_at)) return false;
      if (days && range !== "Today") {
        if (now - new Date(o.created_at).getTime() > days * 86400000) return false;
      }

      if (!q) return true;
      return (
        String(o.order_number ?? "").toLowerCase().includes(q) ||
        String(o.customer_email ?? "").toLowerCase().includes(q) ||
        o._name.toLowerCase().includes(q) ||
        o._location.toLowerCase().includes(q) ||
        o.items.some((it) => itemName(it).toLowerCase().includes(q))
      );
    });
  }, [orders, activeTab, query, range]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function exportCsv() {
    const header = [
      "Order #", "Date", "Customer", "Email", "Location",
      "Items", "Payment Status", "Total", "Order Status",
    ];
    const rows = filtered.map((o) => [
      o.order_number,
      o.created_at,
      o._name,
      o.customer_email,
      o._location,
      o.items.map((it) => `${itemQty(it)}x ${itemName(it)}`).join("; "),
      o.payment_status,
      o.total,
      o.order_status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const cards = [
    {
      title: "Awaiting Confirmation",
      value: stats.pending,
      note: "Pending COD orders",
      icon: ClipboardList,
      iconStyle: "bg-orange-50 text-orange-600",
    },
    {
      title: "Confirmed / Processing",
      value: stats.inProgress,
      note: "Being prepared for shipping",
      icon: Package,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Shipped",
      value: stats.shipped,
      note: "Out for delivery",
      icon: Truck,
      iconStyle: "bg-sky-50 text-sky-600",
    },
    {
      title: "Delivered Today",
      value: stats.deliveredToday,
      note: `${formatPrice(stats.deliveredTodayTotal)} · ${stats.awaitingCod} awaiting COD`,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <AdminLayout onLogout={onLogout}>
      {/* Heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order Fulfillment</h1>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Confirm COD orders, move them through fulfillment, and record cash
            collection after delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, note, icon: Icon, iconStyle }) => (
          <div key={title} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">{title}</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}>
                <Icon size={15} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{loading ? "…" : loadError ? "—" : value}</p>
            <p className="mt-1 text-[10px] text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      {/* Errors / notices */}
      {loadError && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          <span>Could not load orders: {loadError}</span>
          <button onClick={loadOrders} className="shrink-0 font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div
          className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="shrink-0 font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === t.key
                ? "bg-blue-700 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label} ({loadError ? "—" : tabCounts[t.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Table card */}
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 min-w-60 flex-1 items-center gap-2 rounded-lg bg-blue-50 px-3">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order #, customer, email, location, or item..."
              className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          <div className="relative">
            <Calendar
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={range}
              onChange={(e) => {
                setRange(e.target.value);
                setPage(1);
              }}
              aria-label="Date range"
              className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
            >
              {DATE_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-230 text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Status</th>
                <th className="py-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                    Loading orders…
                  </td>
                </tr>
              )}

              {!loading &&
                visible.map((o) => {
                  const st = STATUS_STYLE[o.order_status] ?? STATUS_STYLE.processing;
                  const first = o.items[0];
                  const open = expanded === o.id;
                  const actions = getActions(o);

                  return (
                    <Fragment key={o.id}>
                      <tr className="border-b border-slate-50">
                        <td className="py-3 pr-3">
                          <button
                            onClick={() => setExpanded(open ? null : o.id)}
                            className="flex items-center gap-2 text-left"
                            aria-expanded={open}
                          >
                            {open ? (
                              <ChevronUp size={13} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={13} className="text-slate-400" />
                            )}
                            <span>
                              <p className="text-xs font-bold">{o.order_number}</p>
                              <p className="text-[10px] text-slate-500">
                                {formatDate(o.created_at)}
                              </p>
                            </span>
                          </button>
                        </td>

                        <td className="px-3 py-3">
                          <p className="text-xs font-bold">{o._name}</p>
                          <p className="text-[10px] text-slate-500">{o._location}</p>
                        </td>

                        <td className="px-3 py-3 text-xs text-slate-700">
                          {first ? (
                            <>
                              <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                {itemQty(first)}x
                              </span>
                              {itemName(first)}
                              {o.items.length > 1 && (
                                <span className="ml-1 text-[10px] text-slate-500">
                                  +{o.items.length - 1} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400">No items</span>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-slate-700">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                PAYMENT_DOT[o.payment_status] ?? "bg-slate-400"
                              }`}
                            />
                            COD · {label(o.payment_status)}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-xs font-bold">
                          {formatPrice(o.total)}
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${st.pill}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {label(o.order_status)}
                          </span>
                        </td>

                        <td className="py-3 pl-3">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {actions.length === 0 && (
                              <span className="text-[10px] text-slate-400">No actions</span>
                            )}
                            {actions.map((a) => (
                              <button
                                key={a.key}
                                disabled={busyId === o.id}
                                onClick={() => onActionClick(o, a)}
                                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-semibold disabled:opacity-50 ${TONE[a.tone]}`}
                              >
                                {busyId === o.id ? "Working…" : a.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {open && (
                        <tr className="border-b border-slate-50 bg-slate-50/60">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid gap-4 text-xs md:grid-cols-2">
                              <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                  Items
                                </p>
                                {o.items.length === 0 && (
                                  <p className="text-slate-400">No line items found.</p>
                                )}
                                {o.items.map((it, i) => (
                                  <div
                                    key={it.id ?? i}
                                    className="flex justify-between gap-3 border-b border-slate-100 py-1 last:border-0"
                                  >
                                    <span>
                                      {itemQty(it)}x {itemName(it)}
                                    </span>
                                    <span className="font-semibold">
                                      {itemTotal(it) != null ? formatPrice(itemTotal(it)) : "—"}
                                    </span>
                                  </div>
                                ))}
                                <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
                                  <p>Subtotal: {formatPrice(o.subtotal)}</p>
                                  {Number(o.automatic_discount_total) > 0 && (
                                    <p>Automatic discount: −{formatPrice(o.automatic_discount_total)}</p>
                                  )}
                                  {Number(o.promo_code_discount_total) > 0 && (
                                    <p>Promo code: −{formatPrice(o.promo_code_discount_total)}</p>
                                  )}
                                  {Number(o.other_discount_total) > 0 && (
                                    <p>Other discount: −{formatPrice(o.other_discount_total)}</p>
                                  )}
                                  <p className="font-bold text-slate-800">
                                    Total: {formatPrice(o.total)}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                  Ship to
                                </p>
                                <p className="text-slate-700">{o.customer_email}</p>
                                {o.shipping_address &&
                                  Object.entries(o.shipping_address).map(([k, v]) =>
                                    v ? (
                                      <p key={k} className="text-slate-600">
                                        <span className="text-slate-400">{label(k)}: </span>
                                        {String(v)}
                                      </p>
                                    ) : null
                                  )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            {orders.length === 0 && !loadError ? (
              <>
                <p>No orders are available right now.</p>
                <p className="mx-auto mt-1 flex max-w-md items-center justify-center gap-1.5 text-xs text-amber-700">
                  <AlertTriangle size={12} />
                  Refresh the list or contact an administrator if you expected to see orders.
                </p>
              </>
            ) : (
              "No orders match this tab or search."
            )}
          </div>
        )}

        {/* Footer / pagination */}
        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Showing{" "}
              <b className="text-slate-800">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </b>{" "}
              of <b className="text-slate-800">{filtered.length}</b> orders
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 enabled:text-slate-700 enabled:hover:bg-slate-200"
              >
                Previous
              </button>
              <span className="px-2">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 enabled:text-slate-700 enabled:hover:bg-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
          >
            <h3 className="text-sm font-bold text-slate-800">
              {confirming.action.title}
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {confirming.order.order_number} · {confirming.order._name}
            </p>
            <p className="mt-3 text-xs text-slate-600">{confirming.action.body}</p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirming(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Go back
              </button>
              <button
                onClick={() => runAction(confirming.order, confirming.action)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  confirming.action.tone === "danger"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : TONE[confirming.action.tone]
                }`}
              >
                {confirming.action.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page footer */}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-[10px] text-slate-500 shadow-sm">
        <p>© 2026 TechHub Inc. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          <span className="text-slate-300">|</span>
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
          <span className="text-slate-300">|</span>
          <a href="#" className="hover:text-blue-600">Support Center</a>
        </div>
      </footer>
    </AdminLayout>
  );
}
