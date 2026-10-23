import { useEffect, useMemo, useState } from "react";
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Monitor,
  Fan,
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
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";

const COMPONENTS = [
  { id: "processor", name: "Processor (CPU)", description: "The brain of your machine", icon: Cpu, category: ["CPU", "CPUs", "Processors", "Processor"] },
  { id: "motherboard", name: "Motherboard", description: "Connects your PC components", icon: CircuitBoard, category: ["Motherboards", "Motherboard"] },
  { id: "ram", name: "Memory (RAM)", description: "System memory", icon: MemoryStick, category: ["Memory (RAM)", "Memory", "RAM"] },
  { id: "storage", name: "Storage", description: "SSD and hard drives", icon: HardDrive, category: ["Storage", "Storage Drives", "SSD", "Hard Drives"] },
  { id: "graphics", name: "Graphics Card (GPU)", description: "Graphics and visual processing", icon: Monitor, category: ["Graphics Cards", "Graphics Card", "GPUs", "GPU"] },
  { id: "chassis", name: "PC Case", description: "Your PC's enclosure", icon: Box, category: ["PC Cases", "Cases", "PC Case", "Case"] },
  { id: "psu", name: "Power Supply (PSU)", description: "Power for your system", icon: Zap, category: ["Power Supplies", "Power Supply", "PSU"] },
  { id: "cooler", name: "CPU Cooler", description: "Keeps your processor cool", icon: Fan, category: ["CPU Coolers", "CPU Cooler", "Coolers"] },
];

const formatPrice = (price) =>
  `₱${Number(price || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const normalize = (value) => String(value ?? "").trim().toLowerCase();
const getSpec = (product, label) =>
  product.specifications?.find(([key]) => normalize(key) === normalize(label))?.[1] ?? null;

function categoryForProduct(product) {
  const category = normalize(product.category);
  return COMPONENTS.find((component) =>
    component.category.some((name) => normalize(name) === category)
  )?.id ?? null;
}

function toBuilderProduct(product) {
  const specs = (product.specifications ?? [])
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => `${label}: ${value}`);
  const read = (...labels) => {
    for (const label of labels) {
      const value = getSpec(product, label);
      if (value !== null && value !== "") return value;
    }
    return null;
  };
  const numberFrom = (value) => {
    if (value == null) return null;
    const match = String(value).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
  };
  return {
    ...product,
    stock: Number(product.stockQuantity) > 0,
    specs,
    socket: read("Socket"),
    memoryType: read("Memory Type"),
    formFactor: read("Form Factor"),
    supportedMotherboardSizes: read("Supported Motherboard Sizes"),
    gpuLength: numberFrom(read("Length")),
    maxGpuLength: numberFrom(read("Maximum GPU Length")),
    coolerHeight: numberFrom(read("Cooler Height")),
    maxCoolerHeight: numberFrom(read("Maximum CPU Cooler Height")),
    coolerSockets: read("Compatible CPU Sockets"),
    psuWattage: numberFrom(read("Rated Wattage")),
    recommendedPsu: numberFrom(read("Recommended PSU")),
    boardPower: numberFrom(read("Board Power")),
    psuFormFactor: read("PSU Form Factor"),
    powerConnectors: read("Power Connectors"),
    storageInterface: read("Interface"),
    capacity: read("Capacity"),
    speed: read("Speed"),
    chipset: read("Chipset"),
    coreCount: read("Cores"),
    vram: read("VRAM"),
    storageType: read("Storage Type"),
    efficiency: read("Efficiency Rating"),
    modularity: read("Modularity"),
    coolerType: read("Cooler Type"),
    radiatorSize: read("Radiator Size"),
  };
}

function getNumericSpec(product, ...labels) {
  for (const label of labels) {
    const value = getSpec(product, label);
    if (value !== null && value !== "") {
      const match = String(value).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
      if (match) return Number(match[0]);
    }
  }
  return null;
}

function normalizeStorageInterface(value) {
  const normalized = normalize(value);
  if (!normalized) return null;
  if (normalized.includes("sata")) return "SATA";
  if (normalized.includes("nvme") || normalized.includes("pcie")) return "NVMe";
  return String(value).trim();
}

function getFilterValue(product, filterKey) {
  const directValues = {
    brand: product.brand,
    socket: product.socket,
    chipset: getSpec(product, "Chipset"),
    coreCount: getSpec(product, "Cores"),
    formFactor: getSpec(product, "Form Factor"),
    memoryType: getSpec(product, "Memory Type"),
    capacity: getSpec(product, "Capacity"),
    speed: getSpec(product, "Speed"),
    storageType: getSpec(product, "Storage Type"),
    interface: getSpec(product, "Interface"),
    vram: getSpec(product, "VRAM"),
    supportedMotherboardSizes: getSpec(product, "Supported Motherboard Sizes"),
    wattage: getSpec(product, "Rated Wattage"),
    efficiency: getSpec(product, "Efficiency Rating"),
    modularity: getSpec(product, "Modularity"),
    coolerType: getSpec(product, "Cooler Type"),
    coolerSockets: getSpec(product, "Compatible CPU Sockets"),
    radiatorSize: getSpec(product, "Radiator Size"),
  };
  if (filterKey === "interface") {
    return normalizeStorageInterface(directValues.interface);
  }
  return directValues[filterKey] ?? null;
}

const FILTERS_BY_CATEGORY = {
  processor: [
    ["Brand", "brand"],
    ["Socket", "socket"],
    ["Core Count", "coreCount"],
  ],
  motherboard: [
    ["Brand", "brand"],
    ["Socket", "socket"],
    ["Chipset", "chipset"],
    ["Form Factor", "formFactor"],
    ["RAM Type", "memoryType"],
  ],
  ram: [
    ["Brand", "brand"],
    ["DDR Type", "memoryType"],
    ["Capacity", "capacity"],
    ["Speed", "speed"],
  ],
  storage: [
    ["Brand", "brand"],
    ["Storage Type", "storageType"],
    ["Capacity", "capacity"],
    ["Interface", "interface"],
  ],
  graphics: [
    ["Brand", "brand"],
    ["Chipset", "chipset"],
    ["VRAM", "vram"],
  ],
  chassis: [
    ["Brand", "brand"],
    ["Supported Motherboard Size", "supportedMotherboardSizes"],
  ],
  psu: [
    ["Brand", "brand"],
    ["Wattage", "wattage"],
    ["Efficiency Rating", "efficiency"],
    ["Modularity", "modularity"],
    ["Form Factor", "formFactor"],
  ],
  cooler: [
    ["Brand", "brand"],
    ["Cooler Type", "coolerType"],
    ["Supported Socket", "coolerSockets"],
    ["Radiator Size", "radiatorSize"],
  ],
};

function getCompatibilityIssuesForProduct(product, selected) {
  const issues = [];
  const cpu = selected.processor;
  const board = selected.motherboard;
  const ram = selected.ram;
  const gpu = selected.graphics;
  const psu = selected.psu;
  const chassis = selected.chassis;
  const cooler = selected.cooler;

  if (product.builderCategory === "motherboard" && cpu && cpu.socket && product.socket) {
    if (normalize(cpu.socket) !== normalize(product.socket)) {
      issues.push("CPU socket mismatch");
    }
  }
  if (product.builderCategory === "processor" && board && product.socket && board.socket) {
    if (normalize(product.socket) !== normalize(board.socket)) {
      issues.push("Motherboard socket mismatch");
    }
  }
  if (product.builderCategory === "motherboard" && ram && product.memoryType && ram.memoryType) {
    if (normalize(product.memoryType) !== normalize(ram.memoryType)) {
      issues.push("RAM generation mismatch");
    }
  }
  if (product.builderCategory === "ram" && board && product.memoryType && board.memoryType) {
    if (normalize(product.memoryType) !== normalize(board.memoryType)) {
      issues.push("RAM generation mismatch");
    }
  }
  if (product.builderCategory === "graphics" && chassis && product.gpuLength != null && chassis.maxGpuLength != null) {
    if (product.gpuLength > chassis.maxGpuLength) {
      issues.push("GPU is too long for the selected case");
    }
  }
  if (product.builderCategory === "chassis") {
    if (board && board.formFactor && product.supportedMotherboardSizes) {
      if (!normalize(product.supportedMotherboardSizes).includes(normalize(board.formFactor))) {
        issues.push("Motherboard form factor may not fit this case");
      }
    }
    if (gpu && gpu.gpuLength != null && product.maxGpuLength != null && gpu.gpuLength > product.maxGpuLength) {
      issues.push("Selected GPU is too long for this case");
    }
    if (cooler && cooler.coolerHeight != null && product.maxCoolerHeight != null && cooler.coolerHeight > product.maxCoolerHeight) {
      issues.push("Selected CPU cooler is too tall for this case");
    }
  }
  if (product.builderCategory === "psu" && gpu && gpu.recommendedPsu != null && product.psuWattage != null) {
    if (product.psuWattage < gpu.recommendedPsu) {
      issues.push("PSU is below the GPU's recommended wattage");
    }
  }
  if (product.builderCategory === "cooler" && cpu && cpu.socket && product.coolerSockets) {
    if (!normalize(product.coolerSockets).includes(normalize(cpu.socket))) {
      issues.push("CPU cooler socket support mismatch");
    }
  }
  if (product.builderCategory === "cooler" && chassis && product.coolerHeight != null && chassis.maxCoolerHeight != null) {
    if (product.coolerHeight > chassis.maxCoolerHeight) {
      issues.push("CPU cooler is too tall for the selected case");
    }
  }
  return issues;
}

function ProductImage({ product, component }) {
  const [failed, setFailed] = useState(false);
  const Icon = component.icon;
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF1FB] sm:h-28 sm:w-28">
      {!failed && product.image ? (
        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-2" onError={() => setFailed(true)} />
      ) : <Icon size={38} strokeWidth={1.4} className="text-[#42658F]" />}
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

export default function PCBuilder() {
  const { addToCart, cartItems } = useCart();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState({});
  const [activeComponent, setActiveComponent] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("price-asc");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [cartBusy, setCartBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProducts("component")
      .then((products) => {
        if (!mounted) return;
        const normalizedProducts = products
          .map((product) => ({ ...toBuilderProduct(product), builderCategory: categoryForProduct(product) }))
          .filter((product) => product.builderCategory);
        setCatalogProducts(normalizedProducts);
        setLoadError("");
      })
      .catch((error) => {
        console.error("Failed to load PC Builder products:", error);
        if (mounted) setLoadError("We couldn't load the component catalog. Please try again.");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const components = useMemo(
    () => COMPONENTS.map((component) => ({
      ...component,
      products: catalogProducts.filter((product) => product.builderCategory === component.id),
    })),
    [catalogProducts]
  );

  const coreCount = COMPONENTS.filter((component) => component.id !== "cooler" && selected[component.id]).length;
  const selectedCount = Object.keys(selected).length;
  const subtotal = useMemo(
    () => Object.values(selected).reduce((total, product) => total + Number(product.price || 0), 0),
    [selected]
  );

  const compatibility = useMemo(() => {
    const issues = [];
    const cpu = selected.processor;
    const board = selected.motherboard;
    const ram = selected.ram;
    const gpu = selected.graphics;
    const psu = selected.psu;
    const chassis = selected.chassis;
    const cooler = selected.cooler;

    if (cpu && board) {
      if (cpu.socket && board.socket && normalize(cpu.socket) !== normalize(board.socket)) {
        issues.push({ type: "error", message: `CPU socket (${cpu.socket}) does not match motherboard socket (${board.socket}).`, suggestion: "Choose a motherboard with the same CPU socket." });
      } else if (!cpu.socket || !board.socket) {
        issues.push({ type: "info", message: "CPU or motherboard socket information is missing, so socket compatibility could not be verified." });
      }
    }
    if (ram && board) {
      if (ram.memoryType && board.memoryType && normalize(ram.memoryType) !== normalize(board.memoryType)) {
        issues.push({ type: "error", message: `RAM type (${ram.memoryType}) does not match motherboard memory type (${board.memoryType}).`, suggestion: `Choose ${board.memoryType} memory.` });
      } else if (!ram.memoryType || !board.memoryType) {
        issues.push({ type: "info", message: "RAM or motherboard memory type is missing, so memory compatibility could not be verified." });
      }
    }
    if (gpu && chassis) {
      if (gpu.gpuLength != null && chassis.maxGpuLength != null && gpu.gpuLength > chassis.maxGpuLength) {
        issues.push({ type: "error", message: `GPU length (${gpu.gpuLength} mm) exceeds the case clearance (${chassis.maxGpuLength} mm).`, suggestion: "Choose a larger case or a shorter graphics card." });
      } else if (gpu.gpuLength == null || chassis.maxGpuLength == null) {
        issues.push({ type: "info", message: "GPU length or case clearance is missing, so physical fit could not be verified." });
      }
    }
    if (board && chassis) {
      if (board.formFactor && chassis.supportedMotherboardSizes) {
        const supported = normalize(chassis.supportedMotherboardSizes);
        if (!supported.includes(normalize(board.formFactor))) {
          issues.push({ type: "error", message: `The case's listed motherboard support (${chassis.supportedMotherboardSizes}) may not include ${board.formFactor}.`, suggestion: "Check the case specification or select a case that supports this motherboard size." });
        }
      } else {
        issues.push({ type: "info", message: "Motherboard or case form-factor information is missing, so fit could not be fully verified." });
      }
    }
    if (cpu && cooler) {
      if (cpu.socket && cooler.coolerSockets) {
        if (!normalize(cooler.coolerSockets).includes(normalize(cpu.socket))) {
          issues.push({ type: "error", message: `The cooler's listed sockets (${cooler.coolerSockets}) may not support ${cpu.socket}.`, suggestion: "Choose a cooler that explicitly supports the CPU socket." });
        }
      } else {
        issues.push({ type: "info", message: "CPU or cooler socket support is missing, so cooler compatibility could not be verified." });
      }
    }
    if (cooler && chassis && cooler.coolerHeight != null && chassis.maxCoolerHeight != null && cooler.coolerHeight > chassis.maxCoolerHeight) {
      issues.push({ type: "error", message: `Cooler height (${cooler.coolerHeight} mm) exceeds case clearance (${chassis.maxCoolerHeight} mm).`, suggestion: "Choose a shorter cooler or a case with more clearance." });
    }
    if (gpu && psu) {
      if (gpu.recommendedPsu != null && psu.psuWattage != null && psu.psuWattage < gpu.recommendedPsu) {
        issues.push({ type: "warning", message: `The GPU recommends a ${gpu.recommendedPsu} W PSU, but the selected PSU is ${psu.psuWattage} W.`, suggestion: "Consider a PSU meeting or exceeding the GPU manufacturer's recommendation." });
      } else if (gpu.recommendedPsu == null || psu.psuWattage == null) {
        issues.push({ type: "info", message: "GPU recommended PSU or PSU wattage information is missing, so power suitability could not be fully checked." });
      }
    }
    return issues;
  }, [selected]);

  const openCatalog = (component) => {
    setActiveComponent(component);
    setSearch("");
    setSort("price-asc");
    setSelectedFilters({});
    setInStockOnly(true);
    setFiltersOpen(true);
  };

  const activeFilterDefinitions = activeComponent
    ? FILTERS_BY_CATEGORY[activeComponent.id] ?? [["Brand", "brand"]]
    : [];

  const filterOptions = useMemo(() => {
    if (!activeComponent) return {};

    return Object.fromEntries(
      activeFilterDefinitions.map(([label, key]) => {
        const values = activeComponent.products
          .map((product) => getFilterValue(product, key))
          .filter((value) => value !== null && value !== undefined && value !== "")
          .flatMap((value) => {
            if (Array.isArray(value)) return value;
            if (key === "coolerSockets" || key === "supportedMotherboardSizes") {
              return String(value).split(/[,/|]+/).map((part) => part.trim()).filter(Boolean);
            }
            return [String(value)];
          });

        return [
          key,
          {
            label,
            values: [...new Set(values)].sort((a, b) =>
              String(a).localeCompare(String(b), undefined, { numeric: true })
            ),
          },
        ];
      })
    );
  }, [activeComponent, activeFilterDefinitions]);

  const toggleCategoryFilter = (key, value) => {
    setSelectedFilters((previous) => {
      const currentValues = previous[key] ?? [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...previous, [key]: nextValues };
    });
  };

  const filteredProducts = useMemo(() => {
    if (!activeComponent) return [];

    const query = search.trim().toLowerCase();
    const products = activeComponent.products.filter((product) => {
      const searchableText = [product.name, product.brand, ...product.specs]
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchableText.includes(query);
      const matchesStock = !inStockOnly || product.stock;
      const matchesCompatibility = getCompatibilityIssuesForProduct(product, selected).length === 0;
      const matchesFilters = activeFilterDefinitions.every(([, key]) => {
        const chosenValues = selectedFilters[key] ?? [];
        if (chosenValues.length === 0) return true;

        const productValue = getFilterValue(product, key);
        if (productValue == null || productValue === "") return false;
        const productValues = Array.isArray(productValue)
          ? productValue.map(String)
          : String(productValue).split(/[,/|]+/).map((value) => value.trim());

        return chosenValues.some((value) => productValues.includes(value));
      });

      return matchesSearch && matchesStock && matchesCompatibility && matchesFilters;
    });

    return [...products].sort((a, b) => {
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return Number(a.price) - Number(b.price);
    });
  }, [
    activeComponent,
    activeFilterDefinitions,
    search,
    sort,
    inStockOnly,
    selected,
    selectedFilters,
  ]);

  const chooseProduct = (product) => {
    setSelected((previous) => ({ ...previous, [activeComponent.id]: product }));
    setActiveComponent(null);
    setCheckoutMessage("");
  };

  const resetBuild = () => {
    setSelected({});
    setCheckoutMessage("");
  };

  const removeComponent = (id) => {
    setSelected((previous) => {
      const updated = { ...previous };
      delete updated[id];
      return updated;
    });
    setCheckoutMessage("");
  };

  const addBuildToCart = () => {
    setCheckoutMessage("");
    const items = Object.values(selected);
    if (!items.length) {
      setCheckoutMessage("Select at least one component before adding your build to the cart.");
      return;
    }
    const unavailable = items.find((item) => Number(item.stockQuantity) <= 0);
    if (unavailable) {
      setCheckoutMessage(`${unavailable.name} is out of stock. Remove it or select an available alternative.`);
      return;
    }
    const hardConflict = compatibility.some((issue) => issue.type === "error");
    if (hardConflict) {
      setCheckoutMessage("Your build has known compatibility conflicts. Review the warnings before adding it to the cart.");
      return;
    }

    // Validate the whole build against current cart quantities before dispatching
    // individual items. CartContext's current boolean return is not reliable because
    // it is assigned inside a React state updater.
    const overStock = items.find((product) => {
      const existing = cartItems.find((item) => item.id === product.id);
      return Number(existing?.quantity || 0) + 1 > Number(product.stockQuantity || 0);
    });
    if (overStock) {
      setCheckoutMessage(`${overStock.name} does not have enough stock for the requested cart quantity. Review your cart or choose another product.`);
      return;
    }
    setCartBusy(true);
    for (const product of items) {
      addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: Number(product.price),
        image: product.image ?? "",
        stockQuantity: Number(product.stockQuantity) || 0,
      }, 1);
    }
    setCartBusy(false);
    setCheckoutMessage(`Added ${items.length} component${items.length === 1 ? "" : "s"} to your cart.`);
  };

  const ComponentRow = ({ component }) => {
    const Icon = component.icon;
    const item = selected[component.id];
    return (
      <div className="flex min-h-19 items-center gap-3 rounded-xl border border-[#DFE5EF] bg-white px-3 py-3 transition-colors hover:border-[#8EACD8] sm:px-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF1FB] text-[#42658F]">
          {item?.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-contain p-1"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          ) : (
            <Icon size={24} strokeWidth={1.7} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#101A2B]">{component.name}</h3>
          {item ? <>
            <p className="mt-1 truncate text-xs text-[#64748B]">{item.name}</p>
            <p className="mt-1 text-xs font-semibold text-[#0B477D]">{formatPrice(item.price)}</p>
          </> : <p className="mt-1 text-xs text-[#64748B]">{component.description}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`text-[10px] font-semibold sm:text-xs ${item ? "text-emerald-700" : "text-[#64748B]"}`}>{item ? "Selected" : "Empty"}</span>
          <button type="button" onClick={() => openCatalog(component)} className="rounded bg-[#08477F] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#06345D] sm:min-w-26 sm:text-xs">
            {item ? "Change Component" : "Select Component"}
          </button>
          {item && <button type="button" onClick={() => removeComponent(component.id)} className="text-[10px] text-red-600 hover:underline">Remove</button>}
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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101A2B] sm:text-3xl">PC BUILDER &amp; CONFIGURATOR</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">Build your ideal desktop PC. Browse real catalog products, compare specifications, and check compatibility as you configure your system.</p>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="min-w-0">
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide">Core Components</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-[#64748B]">{coreCount} of 7 core components selected</span>
                  <button type="button" onClick={resetBuild} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D5DEEA] bg-white px-3 py-2 text-xs font-semibold text-[#172033] transition hover:border-[#9BB8E4] hover:bg-[#F8FAFF] sm:text-sm"><RotateCcw size={14} /> Reset Build</button>
                </div>
              </div>
              {loading ? <div className="flex items-center gap-2 rounded-xl border border-[#DFE5EF] bg-white p-6 text-sm text-[#64748B]"><LoaderCircle className="animate-spin" size={18} /> Loading components from Techub catalog...</div> : (
                <div className="space-y-2.5">{components.filter((component) => component.id !== "cooler").map((component) => <ComponentRow key={component.id} component={component} />)}</div>
              )}
            </section>
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide">CPU Cooler</h2>
                <span className="text-xs text-[#64748B]">Optional, depending on CPU and cooling needs</span>
              </div>
              {loading ? <div className="rounded-xl border border-[#DFE5EF] bg-white p-4 text-sm text-[#64748B]">Loading CPU coolers...</div> : <ComponentRow component={components.find((component) => component.id === "cooler")} />}
            </section>
            {!loading && catalogProducts.length === 0 && !loadError && <p className="mt-4 rounded-xl border border-dashed border-[#BFCBBC] bg-white p-5 text-sm text-[#64748B]">No products were found for the builder categories. Check your product categories and product_type values in Supabase.</p>}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-5">
            <section className="overflow-hidden rounded-xl border border-[#DFE5EF] bg-white">
              <div className="bg-[#08477F] px-5 py-4 text-center text-white"><h2 className="text-base font-bold">Build Summary</h2><p className="mt-1 text-xs text-blue-100">Your custom PC configuration</p></div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">Selected Components</span><span className="font-semibold">{selectedCount}</span></div>
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">Subtotal</span><span className="font-bold tabular-nums">{formatPrice(subtotal)}</span></div>
                <div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">Assembly Fee</span><span className="font-semibold">Free</span></div>
                <div className="border-t border-[#DFE5EF] pt-4"><div className="flex items-center justify-between gap-3"><span className="font-bold">Estimated Total</span><span className="text-xl font-extrabold text-[#08477F] tabular-nums">{formatPrice(subtotal)}</span></div><p className="mt-2 text-xs text-slate-500">Prices are loaded from the current catalog. Final price and stock should be confirmed at checkout.</p></div>
                <button type="button" disabled={cartBusy || selectedCount === 0} onClick={addBuildToCart} className="w-full rounded-lg bg-[#A9C4FF] px-4 py-3 text-sm font-extrabold text-[#101A2B] transition hover:bg-[#8FB0FA] disabled:cursor-not-allowed disabled:opacity-50">{cartBusy ? "Adding to Cart..." : "Add Build to Cart"}</button>
                {checkoutMessage && <p role="status" className="rounded-md bg-[#E7F0FF] p-3 text-xs leading-5 text-[#153D6B]">{checkoutMessage}</p>}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-xs text-slate-600"><ShieldCheck size={19} /> Secure Payment</div>
                  <div className="flex items-center gap-3 text-xs text-slate-600"><Truck size={19} /> Fast Delivery</div>
                  <div className="flex items-center gap-3 text-xs text-slate-600"><RotateCcw size={19} /> Easy Returns</div>
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-[#C9DDF7] bg-[#EAF2FF] p-4">
              <div className="flex items-start gap-3"><CheckCircle2 size={21} className="shrink-0 text-[#2563EB]" /><div><h3 className="text-sm font-bold">{compatibility.some((issue) => issue.type === "error") ? "Compatibility conflict detected" : compatibility.some((issue) => issue.type === "warning") ? "Review power requirements" : compatibility.some((issue) => issue.type === "info") ? "Compatibility not fully verified" : selectedCount >= 2 ? "No known conflicts detected" : "Build in progress"}</h3><p className="mt-1 text-xs leading-5 text-[#64748B]">{selectedCount < 2 ? "Select more components to check compatibility." : compatibility.length === 0 ? "No known conflicts were detected from the available specifications." : "Review the notes below. Missing product specifications can limit compatibility checks."}</p>
                {compatibility.length > 0 && <ul className="mt-3 space-y-2">{compatibility.map((issue, index) => <li key={`${issue.message}-${index}`} className="flex items-start gap-2 text-xs leading-5"><AlertTriangle size={14} className={`mt-0.5 shrink-0 ${issue.type === "error" ? "text-red-600" : issue.type === "warning" ? "text-amber-600" : "text-blue-600"}`} /><span className="text-[#08477F]">{issue.message}{issue.suggestion ? <span className="mt-1 block font-semibold">{issue.suggestion}</span> : null}</span></li>)}</ul>}
              </div></div>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
      <ChatSupport />

      {activeComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080F24]/65 p-3 sm:p-6" onClick={() => setActiveComponent(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="catalog-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#DFE5EF] bg-[#F6F8FC] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#DFE5EF] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0B477D]">
                  Techub Component Catalog
                </p>
                <h2 id="catalog-title" className="mt-1 text-lg font-extrabold sm:text-xl">
                  Select {activeComponent.name}
                </h2>
                <p className="mt-1 text-xs text-[#64748B]">
                  Compare available products, specifications, and prices.
                </p>
              </div>
              <button type="button" aria-label="Close product catalog" onClick={() => setActiveComponent(null)} className="rounded-lg border border-[#DFE5EF] p-2 hover:bg-[#F0F5FC]"><X size={19} /></button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[235px_minmax(0,1fr)]">
              <aside className="overflow-y-auto border-b border-[#DFE5EF] bg-[#F8FAFD] p-4 md:border-b-0 md:border-r">
                <div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]" /></div>
                <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="mt-4 flex w-full items-center justify-between text-sm font-bold"><span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</span><ChevronDown size={16} className={filtersOpen ? "rotate-180 transition" : "transition"} /></button>
                {filtersOpen && <div className="mt-4 space-y-5">
                  {activeFilterDefinitions.map(([label, key]) => {
                    const filter = filterOptions[key];
                    if (!filter?.values.length) return null;

                    return (
                      <FilterGroup
                        key={key}
                        title={filter.label}
                        values={filter.values}
                        selected={selectedFilters[key] ?? []}
                        onToggle={(value) => toggleCategoryFilter(key, value)}
                      />
                    );
                  })}
                  <button type="button" onClick={() => { setSelectedFilters({}); setSearch(""); setInStockOnly(true); }} className="text-xs font-semibold text-[#08477F] underline underline-offset-2">Clear filters</button>
                </div>}
              </aside>
              <div className="flex min-h-0 flex-col bg-[#F6F8FC]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE5EF] bg-white px-4 py-3 sm:px-5"><p className="text-xs text-[#64748B]"><span className="font-bold text-[#101A2B]">{filteredProducts.length}</span> products found</p><div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#64748B]"><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="accent-[#2563EB]" /> In stock</label>
                  <label className="flex items-center gap-2 text-xs text-[#64748B]">Sort:<select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs outline-none focus:border-[#2563EB]"><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A to Z</option></select></label>
                </div></div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F6F8FC] p-4 sm:p-5">
                  {filteredProducts.map((product) => {
                    const isSelected = selected[activeComponent.id]?.id === product.id;
                    return <article key={product.id} className={`flex flex-col gap-4 rounded-xl border bg-white p-3 transition sm:flex-row sm:items-center sm:p-4 ${isSelected ? "border-[#08477F] ring-1 ring-[#08477F]/20" : "border-[#DFE5EF] hover:border-[#9BB8E4]"}`}>
                      <ProductImage product={product} component={activeComponent} />
                      <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{product.brand}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${product.stock ? "bg-[#EAF2FF] text-[#08477F]" : "bg-slate-100 text-slate-500"}`}>{product.stock ? "In Stock" : "Out of Stock"}</span></div><h3 className="text-sm font-bold leading-5 text-[#17221A] sm:text-base">{product.name}</h3><div className="mt-2 flex flex-wrap gap-1.5">{product.specs.map((spec) => <span key={spec} className="rounded border border-[#DFE5EF] bg-[#F8FAFD] px-2 py-1 text-[10px] text-[#52627A]">{spec}</span>)}</div></div>
                      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:w-36 sm:flex-col sm:items-end sm:border-0 sm:pt-0"><div className="sm:text-right"><p className="text-lg font-extrabold text-[#0B477D]">{formatPrice(product.price)}</p></div><button type="button" disabled={!product.stock} onClick={() => chooseProduct(product)} className={`inline-flex min-w-25 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold text-white transition ${!product.stock ? "cursor-not-allowed bg-slate-400" : "bg-[#08477F] hover:bg-[#06345D]"}`}>{isSelected ? <><Check size={15} /> Selected</> : <><Plus size={15} /> Select</>}</button></div>
                    </article>;
                  })}
                  {filteredProducts.length === 0 && <div className="rounded-xl border border-dashed border-[#BFCBBC] bg-white px-5 py-12 text-center"><Search size={28} className="mx-auto text-[#829080]" /><p className="mt-3 text-sm font-bold">No products found</p><p className="mt-1 text-xs text-[#64748B]">Try changing your search or filters, or check that this category has products in Supabase.</p></div>}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
