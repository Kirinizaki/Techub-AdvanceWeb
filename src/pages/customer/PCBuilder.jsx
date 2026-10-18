import { useMemo, useState } from "react";
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Monitor,
  Fan,
  Keyboard,
  Mouse,
  Headphones,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Box,
  Search,
  Plus,
  Check,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";

const coreComponents = [
  {
    id: "processor",
    name: "Processor",
    description: "The brain of your machine",
    icon: Cpu,
    filters: { brands: ["AMD", "Intel"], sockets: ["AM4", "AM5", "LGA1700"], chipsets: [] },
    products: [
      { id: "cpu-5600", name: "AMD Ryzen 5 5600", brand: "AMD", price: 5799, stock: true, specs: ["6 Cores / 12 Threads", "3.5GHz Base", "AM4"], socket: "AM4", chipset: "B550", image: "/images/components/ryzen-5-5600.png" },
      { id: "cpu-5700x", name: "AMD Ryzen 7 5700X", brand: "AMD", price: 8999, stock: true, specs: ["8 Cores / 16 Threads", "3.4GHz Base", "AM4"], socket: "AM4", chipset: "B550", image: "/images/components/ryzen-7-5700x.png" },
      { id: "cpu-7800x3d", name: "AMD Ryzen 7 7800X3D", brand: "AMD", price: 21999, stock: true, specs: ["8 Cores / 16 Threads", "3D V-Cache", "AM5"], socket: "AM5", chipset: "B650", image: "/images/components/ryzen-7-7800x3d.png" },
      { id: "cpu-14400f", name: "Intel Core i5-14400F", brand: "Intel", price: 10999, stock: false, specs: ["10 Cores / 16 Threads", "Up to 4.7GHz", "LGA1700"], socket: "LGA1700", chipset: "B760", image: "/images/components/core-i5-14400f.png" },
    ],
  },
  {
    id: "motherboard",
    name: "Motherboard",
    description: "The hub for all your components",
    icon: CircuitBoard,
    filters: { brands: ["ASRock", "ASUS", "Gigabyte", "MSI", "Biostar"], sockets: ["AM4", "AM5", "LGA1700"], chipsets: ["A520", "B550", "B650", "B760"] },
    products: [
      { id: "mb-b550m", name: "MSI B550M PRO-VDH WiFi", brand: "MSI", price: 4999, stock: true, specs: ["Micro-ATX", "DDR4", "Wi-Fi"], socket: "AM4", chipset: "B550", memory: "DDR4", image: "/images/components/msi-b550m-pro-vdh.png" },
      { id: "mb-a520m", name: "Biostar A520MHP", brand: "Biostar", price: 2295, stock: true, specs: ["Micro-ATX", "DDR4", "AM4 Socket"], socket: "AM4", chipset: "A520", memory: "DDR4", image: "/images/components/biostar-a520mhp.png" },
      { id: "mb-b650m", name: "Gigabyte B650M DS3H", brand: "Gigabyte", price: 7499, stock: true, specs: ["Micro-ATX", "DDR5", "AM5 Socket"], socket: "AM5", chipset: "B650", memory: "DDR5", image: "/images/components/gigabyte-b650m-ds3h.png" },
      { id: "mb-b760m", name: "MSI B760M Gaming Plus", brand: "MSI", price: 8999, stock: true, specs: ["Micro-ATX", "DDR5", "LGA1700"], socket: "LGA1700", chipset: "B760", memory: "DDR5", image: "/images/components/msi-b760m-gaming-plus.png" },
      { id: "mb-asus-b550", name: "ASUS Prime B550M-A WiFi II", brand: "ASUS", price: 5995, stock: false, specs: ["Micro-ATX", "DDR4", "Wi-Fi"], socket: "AM4", chipset: "B550", memory: "DDR4", image: "/images/components/asus-prime-b550m.png" },
    ],
  },
  {
    id: "ram",
    name: "RAM",
    description: "High-speed system memory",
    icon: MemoryStick,
    filters: { brands: ["Corsair", "G.Skill", "Kingston", "TeamGroup"], sockets: [], chipsets: [] },
    products: [
      { id: "ram-16-ddr4", name: "Kingston Fury 16GB DDR4 3200MHz", brand: "Kingston", price: 1999, stock: true, specs: ["16GB (2 x 8GB)", "DDR4", "3200MHz"], memory: "DDR4", image: "/images/components/kingston-fury-ddr4.png" },
      { id: "ram-32-ddr4", name: "Corsair Vengeance 32GB DDR4", brand: "Corsair", price: 3499, stock: true, specs: ["32GB (2 x 16GB)", "DDR4", "3200MHz"], memory: "DDR4", image: "/images/components/corsair-vengeance-ddr4.png" },
      { id: "ram-32-ddr5", name: "G.Skill Ripjaws 32GB DDR5", brand: "G.Skill", price: 4999, stock: true, specs: ["32GB (2 x 16GB)", "DDR5", "6000MHz"], memory: "DDR5", image: "/images/components/gskill-ripjaws-ddr5.png" },
      { id: "ram-64-ddr5", name: "Kingston Fury 64GB DDR5", brand: "Kingston", price: 8999, stock: false, specs: ["64GB (2 x 32GB)", "DDR5", "6000MHz"], memory: "DDR5", image: "/images/components/kingston-fury-ddr5.png" },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    description: "Fast and reliable storage",
    icon: HardDrive,
    filters: { brands: ["Crucial", "Kingston", "Samsung", "Western Digital"], sockets: [], chipsets: [] },
    products: [
      { id: "ssd-500", name: "Kingston NV2 500GB NVMe SSD", brand: "Kingston", price: 1799, stock: true, specs: ["500GB", "M.2 NVMe", "PCIe 4.0"], image: "/images/components/kingston-nv2.png" },
      { id: "ssd-1tb", name: "WD Blue SN580 1TB NVMe SSD", brand: "Western Digital", price: 2999, stock: true, specs: ["1TB", "M.2 NVMe", "PCIe 4.0"], image: "/images/components/wd-blue-sn580.png" },
      { id: "ssd-2tb", name: "Samsung 990 EVO 2TB SSD", brand: "Samsung", price: 5499, stock: true, specs: ["2TB", "M.2 NVMe", "High speed"], image: "/images/components/samsung-990-evo.png" },
    ],
  },
  {
    id: "graphics",
    name: "Graphics Card",
    description: "Graphics and visual processing",
    icon: CircuitBoard,
    filters: { brands: ["ASUS", "Gigabyte", "MSI", "Zotac"], sockets: [], chipsets: [] },
    products: [
      { id: "gpu-4060", name: "MSI GeForce RTX 4060 8GB", brand: "MSI", price: 18999, stock: true, specs: ["8GB GDDR6", "DLSS 3", "Dual Fan"], image: "/images/components/msi-rtx-4060.png" },
      { id: "gpu-7600", name: "Gigabyte Radeon RX 7600 8GB", brand: "Gigabyte", price: 16999, stock: true, specs: ["8GB GDDR6", "RDNA 3", "Dual Fan"], image: "/images/components/rx-7600.png" },
      { id: "gpu-5060", name: "Zotac GeForce RTX 5060 8GB", brand: "Zotac", price: 19999, stock: false, specs: ["8GB GDDR7", "DLSS", "Dual Fan"], image: "/images/components/zotac-rtx-5060.png" },
      { id: "gpu-5070", name: "ASUS GeForce RTX 5070 12GB", brand: "ASUS", price: 38999, stock: true, specs: ["12GB GDDR7", "Ray Tracing", "Triple Fan"], image: "/images/components/asus-rtx-5070.png" },
    ],
  },
  {
    id: "chassis",
    name: "Chassis",
    description: "Your PC's protective enclosure",
    icon: Box,
    filters: { brands: ["Cooler Master", "DarkFlash", "Montech", "NZXT"], sockets: [], chipsets: [] },
    products: [
      { id: "case-matx", name: "DarkFlash Micro-ATX Airflow Case", brand: "DarkFlash", price: 1999, stock: true, specs: ["Micro-ATX", "Mesh Front", "Black"], image: "/images/components/darkflash-matx.png" },
      { id: "case-mid", name: "Montech Mid-Tower Tempered Glass", brand: "Montech", price: 2999, stock: true, specs: ["ATX / Micro-ATX", "Tempered Glass", "Black"], image: "/images/components/montech-mid-tower.png" },
      { id: "case-premium", name: "NZXT Premium ATX Gaming Case", brand: "NZXT", price: 4999, stock: false, specs: ["ATX", "Tempered Glass", "Cable Management"], image: "/images/components/nzxt-case.png" },
    ],
  },
  {
    id: "psu",
    name: "Power Supply",
    description: "Efficient and reliable power",
    icon: Zap,
    filters: { brands: ["Cooler Master", "Corsair", "FSP", "Seasonic"], sockets: [], chipsets: [] },
    products: [
      { id: "psu-550", name: "Cooler Master 550W Bronze", brand: "Cooler Master", price: 2499, stock: true, specs: ["550W", "80+ Bronze", "Non-Modular"], wattage: 550, image: "/images/components/cooler-master-550w.png" },
      { id: "psu-650", name: "Corsair CV650 650W Bronze", brand: "Corsair", price: 2999, stock: true, specs: ["650W", "80+ Bronze", "Non-Modular"], wattage: 650, image: "/images/components/corsair-cv650.png" },
      { id: "psu-750", name: "Seasonic 750W Gold", brand: "Seasonic", price: 4999, stock: true, specs: ["750W", "80+ Gold", "Fully Modular"], wattage: 750, image: "/images/components/seasonic-750w.png" },
      { id: "psu-850", name: "FSP 850W Gold", brand: "FSP", price: 6499, stock: false, specs: ["850W", "80+ Gold", "Fully Modular"], wattage: 850, image: "/images/components/fsp-850w.png" },
    ],
  },
];

const additionalComponents = [
  { id: "monitor", name: "Monitor", icon: Monitor, filters: { brands: ["AOC", "ASUS", "LG", "Samsung"], sockets: [], chipsets: [] }, products: [
    { id: "mon-24", name: "AOC 24-inch 1080p 100Hz", brand: "AOC", price: 4499, stock: true, specs: ["24-inch", "1080p", "100Hz"], image: "/images/components/aoc-monitor.png" },
    { id: "mon-180", name: "ASUS 24-inch 180Hz Gaming Monitor", brand: "ASUS", price: 6999, stock: true, specs: ["24-inch", "1080p", "180Hz"], image: "/images/components/asus-monitor.png" },
  ] },
  { id: "cooler", name: "CPU Cooler", icon: Fan, filters: { brands: ["DeepCool", "ID-Cooling", "Thermalright"], sockets: [], chipsets: [] }, products: [
    { id: "cool-air", name: "DeepCool Tower Air Cooler", brand: "DeepCool", price: 1499, stock: true, specs: ["Air cooling", "120mm fan", "AM4 / AM5"], image: "/images/components/deepcool-air-cooler.png" },
    { id: "cool-liquid", name: "ID-Cooling 240mm Liquid Cooler", brand: "ID-Cooling", price: 3999, stock: true, specs: ["240mm radiator", "ARGB", "Liquid cooling"], image: "/images/components/id-cooling-240.png" },
  ] },
  { id: "keyboard", name: "Keyboard", icon: Keyboard, filters: { brands: ["Logitech", "Redragon", "Royal Kludge"], sockets: [], chipsets: [] }, products: [
    { id: "key-mem", name: "Redragon Membrane Keyboard", brand: "Redragon", price: 499, stock: true, specs: ["Full size", "Wired", "Membrane"], image: "/images/components/redragon-keyboard.png" },
    { id: "key-mech", name: "Royal Kludge Mechanical Keyboard", brand: "Royal Kludge", price: 1499, stock: true, specs: ["Mechanical", "RGB", "USB-C"], image: "/images/components/rk-keyboard.png" },
  ] },
  { id: "mouse", name: "Mouse", icon: Mouse, filters: { brands: ["Logitech", "Razer", "Redragon"], sockets: [], chipsets: [] }, products: [
    { id: "mouse-wired", name: "Redragon Wired Gaming Mouse", brand: "Redragon", price: 499, stock: true, specs: ["Wired", "Adjustable DPI", "RGB"], image: "/images/components/redragon-mouse.png" },
    { id: "mouse-wireless", name: "Logitech Wireless Gaming Mouse", brand: "Logitech", price: 1999, stock: true, specs: ["Wireless", "Low latency", "Rechargeable"], image: "/images/components/logitech-mouse.png" },
  ] },
  { id: "headset", name: "Headset", icon: Headphones, filters: { brands: ["HyperX", "Logitech", "Razer"], sockets: [], chipsets: [] }, products: [
    { id: "head-wired", name: "HyperX Wired Stereo Headset", brand: "HyperX", price: 799, stock: true, specs: ["Wired", "Over-ear", "Built-in mic"], image: "/images/components/hyperx-headset.png" },
    { id: "head-wireless", name: "Logitech Wireless Gaming Headset", brand: "Logitech", price: 3499, stock: false, specs: ["Wireless", "Surround audio", "Built-in mic"], image: "/images/components/logitech-headset.png" },
  ] },
  { id: "fans", name: "Additional Fans", icon: Fan, filters: { brands: ["Arctic", "Cooler Master", "DarkFlash"], sockets: [], chipsets: [] }, products: [
    { id: "fan-single", name: "DarkFlash 120mm Case Fan", brand: "DarkFlash", price: 299, stock: true, specs: ["120mm", "PWM", "Black"], image: "/images/components/darkflash-fan.png" },
    { id: "fan-pack", name: "Cooler Master 3-Pack ARGB Fans", brand: "Cooler Master", price: 999, stock: true, specs: ["3 fans", "ARGB", "120mm"], image: "/images/components/argb-fans.png" },
  ] },
];

const formatPrice = (price) => `₱${price.toLocaleString("en-PH")}`;
const allComponents = [...coreComponents, ...additionalComponents];

function ProductImage({ product, component }) {
  const [failed, setFailed] = useState(false);
  const Icon = component.icon;

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF1FB] sm:h-28 sm:w-28">
      {!failed && product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-2"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon size={38} strokeWidth={1.4} className="text-[#42658F]" />
      )}
    </div>
  );
}

function PCBuilder() {
  const [selected, setSelected] = useState({});
  const [activeComponent, setActiveComponent] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("price-asc");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSockets, setSelectedSockets] = useState([]);
  const [selectedChipsets, setSelectedChipsets] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const coreCount = coreComponents.filter((component) => selected[component.id]).length;
  const subtotal = useMemo(
    () => allComponents.reduce((total, component) => total + (selected[component.id]?.price || 0), 0),
    [selected]
  );

  const compatibility = useMemo(() => {
    const cpu = selected.processor;
    const board = selected.motherboard;
    const ram = selected.ram;
    const gpu = selected.graphics;
    const psu = selected.psu;
    const issues = [];

    if (cpu && board && cpu.socket && board.socket && cpu.socket !== board.socket) {
      issues.push(`CPU socket (${cpu.socket}) does not match motherboard socket (${board.socket}).`);
    }
    if (ram && board && ram.memory && board.memory && ram.memory !== board.memory) {
      issues.push(`Memory type (${ram.memory}) does not match the selected motherboard (${board.memory}).`);
    }
    if (gpu?.id === "gpu-5070" && psu?.wattage && psu.wattage < 750) {
      issues.push("A 750W or higher power supply is recommended for this GPU.");
    }

    if (coreCount < coreComponents.length) {
      return {
        status: "incomplete",
        title: "Build in progress",
        message: "Select all core components to review your configuration.",
        issues,
      };
    }
    if (issues.length) {
      return {
        status: "warning",
        title: "Compatibility check needed",
        message: "Review these potential compatibility issues before checkout.",
        issues,
      };
    }
    return {
      status: "compatible",
      title: "System looks compatible",
      message: "No known socket, memory, or basic power conflicts were detected.",
      issues: [],
    };
  }, [selected, coreCount]);

  const openCatalog = (component) => {
    setActiveComponent(component);
    setSearch("");
    setSort("price-asc");
    setSelectedBrands([]);
    setSelectedSockets([]);
    setSelectedChipsets([]);
    setInStockOnly(true);
    setFiltersOpen(true);
  };

  const toggleFilter = (value, values, setter) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const filteredProducts = useMemo(() => {
    if (!activeComponent) return [];
    const products = activeComponent.products.filter((product) => {
      const query = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.specs.some((spec) => spec.toLowerCase().includes(query));
      const matchesStock = !inStockOnly || product.stock;
      const matchesBrand = !selectedBrands.length || selectedBrands.includes(product.brand);
      const matchesSocket = !selectedSockets.length || selectedSockets.includes(product.socket);
      const matchesChipset = !selectedChipsets.length || selectedChipsets.includes(product.chipset);
      return matchesSearch && matchesStock && matchesBrand && matchesSocket && matchesChipset;
    });

    return products.sort((a, b) => {
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return a.price - b.price;
    });
  }, [activeComponent, search, sort, inStockOnly, selectedBrands, selectedSockets, selectedChipsets]);

  const chooseProduct = (product) => {
    setSelected((previous) => ({ ...previous, [activeComponent.id]: product }));
    setActiveComponent(null);
    setCheckoutMessage("");
  };

  const resetBuild = () => {
    setSelected({});
    setCheckoutMessage("");
  };



  const ComponentRow = ({ component, isCore = false }) => {
    const Icon = component.icon;
    const item = selected[component.id];

    return (
      <div key={component.id} className="flex min-h-19 items-center gap-3 rounded-xl border border-[#DFE5EF] bg-white px-3 py-3 transition-colors hover:border-[#8EACD8] sm:px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FB] text-[#42658F]">
          <Icon size={21} strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#101A2B]">{component.name}</h3>
          {item ? (
            <>
              <p className="mt-1 truncate text-xs text-[#64748B]">{item.name}</p>
              <p className="mt-1 text-xs font-semibold text-[#0B477D]">{formatPrice(item.price)}</p>
            </>
          ) : (
            <p className="mt-1 text-xs text-[#64748B]">{component.description || "Choose an option for your build"}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`text-[10px] font-semibold sm:text-xs ${item ? "text-emerald-700" : "text-[#64748B]"}`}>
            {item ? "Selected" : "Empty"}
          </span>
          <button
            type="button"
            onClick={() => openCatalog(component)}
            className="rounded bg-[#08477F] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#06345D] sm:min-w-26 sm:text-xs"
          >
            {item ? "Change Component" : isCore ? "Select Component" : "Add Optional"}
          </button>
          {item && (
            <button
              type="button"
              onClick={() => setSelected((previous) => {
                const updated = { ...previous };
                delete updated[component.id];
                return updated;
              })}
              className="text-[10px] text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">Home&nbsp; / &nbsp;PC Builder</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#101A2B] sm:text-3xl">PC BUILDER &amp; CONFIGURATOR</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            Build your ideal workstation or gaming PC. Browse products, compare specifications, and select components for your configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="min-w-0">
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide">Core Components</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-[#64748B]">{coreCount} of {coreComponents.length} selected</span>
                  <button
                    type="button"
                    onClick={resetBuild}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D5DEEA] bg-white px-3 py-2 text-xs font-semibold text-[#172033] transition hover:border-[#9BB8E4] hover:bg-[#F8FAFF] sm:text-sm"
                  >
                    <RotateCcw size={14} /> Reset Build
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                {coreComponents.map((component) => <ComponentRow key={component.id} component={component} isCore />)}
              </div>
            </section>
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide">Additional Components</h2>
              <div className="space-y-2.5">
                {additionalComponents.map((component) => <ComponentRow key={component.id} component={component} />)}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-5">
            <section className="overflow-hidden rounded-xl border border-[#DFE5EF] bg-white">
              <div className="bg-[#08477F] px-5 py-4 text-center text-white">
                <h2 className="text-base font-bold">Build Summary</h2>
                <p className="mt-1 text-xs text-blue-100">Your custom PC configuration</p>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">Selected Components</span><span className="font-semibold">{Object.keys(selected).length}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">Subtotal</span><span className="font-bold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">Assembly Fee</span><span className="font-semibold">Free</span>
                </div>
                <div className="border-t border-[#DFE5EF] pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">Estimated Total</span><span className="text-xl font-extrabold text-[#08477F] tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Sample prices for UI development. Verify against your actual catalog.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (coreCount !== coreComponents.length) {
                      setCheckoutMessage("Please select all seven core components before checkout.");
                    } else if (compatibility.issues.length) {
                      setCheckoutMessage("Please resolve the compatibility warnings before checkout.");
                    } else {
                      setCheckoutMessage("Your build is ready. Connect this action to your existing cart and checkout flow.");
                    }
                  }}
                  className="w-full rounded-lg bg-[#A9C4FF] px-4 py-3 text-sm font-extrabold text-[#101A2B] transition hover:bg-[#8FB0FA]">
                  Checkout
                </button>
                {checkoutMessage && <p role="status" className="rounded-md bg-[#E7F0FF] p-3 text-xs leading-5 text-[#153D6B]">{checkoutMessage}</p>}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-xs text-slate-600"><ShieldCheck size={19} /> Secure Payment</div>
                  <div className="flex items-center gap-3 text-xs text-slate-600"><Truck size={19} /> Fast Delivery</div>
                  <div className="flex items-center gap-3 text-xs text-slate-600"><RotateCcw size={19} /> Easy Returns</div>
                </div>
              </div>
            </section>

            <section className={`rounded-xl border p-4 ${compatibility.status === "warning" ? "border-[#C9DDF7] bg-[#EAF2FF]" : compatibility.status === "compatible" ? "border-[#C9DDF7] bg-[#EAF2FF]" : "border-[#C9DDF7] bg-[#EAF2FF]"}`}>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={21} className={`shrink-0 ${compatibility.status === "warning" ? "text-[#2563EB]" : compatibility.status === "compatible" ? "text-[#2563EB]" : "text-[#2563A6]"}`} />
                <div>
                  <h3 className="text-sm font-bold">{compatibility.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#64748B]">{compatibility.message}</p>
                  {compatibility.issues.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-[#08477F]">{compatibility.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />

      <ChatSupport />

      {/* Product catalog modal */}
      {activeComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080F24]/65 p-3 sm:p-6" onClick={() => setActiveComponent(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="catalog-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#DFE5EF] bg-[#F6F8FC] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#DFE5EF] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0B477D]">Techub Component Catalog</p>
                <h2 id="catalog-title" className="mt-1 text-lg font-extrabold sm:text-xl">Select {activeComponent.name}</h2>
                <p className="mt-1 text-xs text-[#64748B]">Compare available products, specifications, and prices.</p>
              </div>
              <button type="button" aria-label="Close product catalog" onClick={() => setActiveComponent(null)} className="rounded-lg border border-[#DFE5EF] p-2 hover:bg-[#F0F5FC]"><X size={19} /></button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[235px_minmax(0,1fr)]">
              {/* Filters */}
              <aside className="overflow-y-auto border-b border-[#DFE5EF] bg-[#F8FAFD] p-4 md:border-b-0 md:border-r">
                <div className="relative">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]" />
                </div>
                <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="mt-4 flex w-full items-center justify-between text-sm font-bold"><span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</span><ChevronDown size={16} className={filtersOpen ? "rotate-180 transition" : "transition"} /></button>

                {filtersOpen && (
                  <div className="mt-4 space-y-5">
                    <FilterGroup title="Brand" values={activeComponent.filters?.brands || []} selected={selectedBrands} onToggle={(value) => toggleFilter(value, selectedBrands, setSelectedBrands)} />
                    {activeComponent.filters?.sockets?.length > 0 && <FilterGroup title="Socket" values={activeComponent.filters.sockets} selected={selectedSockets} onToggle={(value) => toggleFilter(value, selectedSockets, setSelectedSockets)} />}
                    {activeComponent.filters?.chipsets?.length > 0 && <FilterGroup title="Chipset" values={activeComponent.filters.chipsets} selected={selectedChipsets} onToggle={(value) => toggleFilter(value, selectedChipsets, setSelectedChipsets)} />}
                    <button type="button" onClick={() => { setSelectedBrands([]); setSelectedSockets([]); setSelectedChipsets([]); setSearch(""); setInStockOnly(true); }} className="text-xs font-semibold text-[#08477F] underline underline-offset-2">Clear filters</button>
                  </div>
                )}
              </aside>

              {/* Product listing */}
              <div className="flex min-h-0 flex-col bg-[#F6F8FC]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE5EF] bg-white px-4 py-3 sm:px-5">
                  <p className="text-xs text-[#64748B]"><span className="font-bold text-[#101A2B]">{filteredProducts.length}</span> products found</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#64748B]">
                      <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="accent-[#2563EB]" />
                      In stock
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#64748B]">
                      Sort:
                      <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-[#2563EB]">
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F6F8FC] p-4 sm:p-5">
                  {filteredProducts.map((product) => {
                    const isSelected = selected[activeComponent.id]?.id === product.id;
                    return (
                      <article key={product.id} className={`flex flex-col gap-4 rounded-xl border bg-white p-3 transition sm:flex-row sm:items-center sm:p-4 ${isSelected ? "border-[#08477F] ring-1 ring-[#08477F]/20" : "border-[#DFE5EF] hover:border-[#9BB8E4]"}`}>
                        <ProductImage product={product} component={activeComponent} />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{product.brand}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${product.stock ? "bg-[#EAF2FF] text-[#08477F]" : "bg-slate-100 text-slate-500"}`}>{product.stock ? "In Stock" : "Out of Stock"}</span>
                          </div>
                          <h3 className="text-sm font-bold leading-5 text-[#17221A] sm:text-base">{product.name}</h3>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {product.specs.map((spec) => <span key={spec} className="rounded border border-[#DFE5EF] bg-[#F8FAFD] px-2 py-1 text-[10px] text-[#52627A]">{spec}</span>)}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:w-36 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                          <div className="sm:text-right">
                            <p className="text-lg font-extrabold text-[#0B477D]">{formatPrice(product.price)}</p>
                            <p className="text-[10px] text-slate-500">Sample price</p>
                          </div>
                          <button type="button" disabled={!product.stock} onClick={() => chooseProduct(product)} className={`inline-flex min-w-25 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold text-white transition ${!product.stock ? "cursor-not-allowed bg-slate-400" : isSelected ? "bg-[#08477F] hover:bg-[#06345D]" : "bg-[#08477F] hover:bg-[#06345D]"}`}>
                            {isSelected ? <><Check size={15} /> Selected</> : <><Plus size={15} /> Select</>}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {filteredProducts.length === 0 && <div className="rounded-xl border border-dashed border-[#BFCBBC] bg-white px-5 py-12 text-center"><Search size={28} className="mx-auto text-[#829080]" /><p className="mt-3 text-sm font-bold">No products found</p><p className="mt-1 text-xs text-[#64748B]">Try changing your search or filters.</p></div>}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, values, selected, onToggle }) {
  if (!values.length) return null;
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#64748B]">{title}</legend>
      <div className="space-y-2">
        {values.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="accent-[#2563EB]" />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default PCBuilder;
