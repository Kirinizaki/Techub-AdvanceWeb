
import { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  ArrowUpDown,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatSupport from "../components/ChatSupport";
import ProductCard from "../components/ProductCard";

const desktopProducts = [
  {
    id: 101,
    name: "Techub Apex Gaming PC",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 54999,
    oldPrice: 59999,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
    badge: "Best Seller",
    stock: true,
    cpu: "AMD Ryzen 5",
    gpu: "RTX 4060",
  },
  {
    id: 102,
    name: "Techub Phantom Gaming PC",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 72999,
    oldPrice: 79999,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
    badge: "Popular",
    stock: true,
    cpu: "AMD Ryzen 7",
    gpu: "RTX 4070",
  },
  {
    id: 103,
    name: "Techub Starter Gaming PC",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 32999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c",
    badge: "Budget Pick",
    stock: true,
    cpu: "AMD Ryzen 5",
    gpu: "RTX 3050",
  },
  {
    id: 104,
    name: "Techub Creator Workstation",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 89999,
    oldPrice: 94999,
    image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f",
    badge: "Creator",
    stock: false,
    cpu: "Intel Core i7",
    gpu: "RTX 4070",
  },
  {
    id: 105,
    name: "Techub Elite Gaming PC",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 119999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
    badge: "High Performance",
    stock: true,
    cpu: "AMD Ryzen 7",
    gpu: "RTX 4080",
  },
  {
    id: 106,
    name: "Techub Office Desktop",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 24999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
    badge: null,
    stock: true,
    cpu: "Intel Core i5",
    gpu: "Integrated",
  },
  {
    id: 107,
    name: "Techub Performance Gaming PC",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 64999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
    badge: null,
    stock: true,
    cpu: "Intel Core i5",
    gpu: "RTX 4060",
  },
  {
    id: 108,
    name: "Techub Ultimate Workstation",
    category: "Pre-built Desktop",
    brand: "Techub",
    price: 99999,
    oldPrice: 109999,
    image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f",
    badge: "Premium",
    stock: true,
    cpu: "Intel Core i7",
    gpu: "RTX 4070",
  },
];

const processors = [
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "Intel Core i5",
  "Intel Core i7",
];

const graphicsCards = [
  "RTX 3050",
  "RTX 4060",
  "RTX 4070",
  "RTX 4080",
  "Integrated",
];

const brands = ["Techub"];

function DesktopPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expanded, setExpanded] = useState({
    processor: true,
    graphics: true,
    price: true,
    brands: false,
    availability: true,
  });

  const [selectedCPUs, setSelectedCPUs] = useState([]);
  const [selectedGPUs, setSelectedGPUs] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");

  const toggleSection = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleOption = (value, selected, setSelected) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = desktopProducts.filter((product) => {
      const matchesCPU =
        selectedCPUs.length === 0 ||
        selectedCPUs.includes(product.cpu);

      const matchesGPU =
        selectedGPUs.length === 0 ||
        selectedGPUs.includes(product.gpu);

      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand);

      const matchesMin =
        minPrice === "" || product.price >= Number(minPrice);

      const matchesMax =
        maxPrice === "" || product.price <= Number(maxPrice);

      const matchesAvailability =
        availability.length === 0 ||
        availability.some((status) =>
          status === "In Stock" ? product.stock : !product.stock
        );

      return (
        matchesCPU &&
        matchesGPU &&
        matchesBrand &&
        matchesMin &&
        matchesMax &&
        matchesAvailability
      );
    });

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    selectedCPUs,
    selectedGPUs,
    selectedBrands,
    availability,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedCPUs([]);
    setSelectedGPUs([]);
    setSelectedBrands([]);
    setAvailability([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const sidebar = (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} />
          <h2 className="font-heading text-sm font-bold">Filters</h2>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Clear all
        </button>
      </div>

      <FilterSection
        title="Processor"
        open={expanded.processor}
        onToggle={() => toggleSection("processor")}
      >
        <div className="space-y-3">
          {processors.map((cpu) => (
            <label
              key={cpu}
              className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedCPUs.includes(cpu)}
                onChange={() =>
                  toggleOption(cpu, selectedCPUs, setSelectedCPUs)
                }
                className="accent-blue-600"
              />
              {cpu}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Graphics Card"
        open={expanded.graphics}
        onToggle={() => toggleSection("graphics")}
      >
        <div className="space-y-3">
          {graphicsCards.map((gpu) => (
            <label
              key={gpu}
              className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedGPUs.includes(gpu)}
                onChange={() =>
                  toggleOption(gpu, selectedGPUs, setSelectedGPUs)
                }
                className="accent-blue-600"
              />
              {gpu}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Price Range"
        open={expanded.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] text-slate-500">
            Minimum (₱)
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-blue-500"
            />
          </label>

          <label className="text-[10px] text-slate-500">
            Maximum (₱)
            <input
              type="number"
              min="0"
              placeholder="150000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-blue-500"
            />
          </label>
        </div>
      </FilterSection>

      <FilterSection
        title="Brands"
        open={expanded.brands}
        onToggle={() => toggleSection("brands")}
      >
        <div className="space-y-3">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() =>
                  toggleOption(brand, selectedBrands, setSelectedBrands)
                }
                className="accent-blue-600"
              />
              {brand}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Availability"
        open={expanded.availability}
        onToggle={() => toggleSection("availability")}
      >
        <div className="space-y-3">
          {["In Stock", "Out of Stock"].map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
            >
              <input
                type="checkbox"
                checked={availability.includes(status)}
                onChange={() =>
                  toggleOption(status, availability, setAvailability)
                }
                className="accent-blue-600"
              />
              {status}
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-slate-900">
      <Navbar />

      {/* Page heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
          <p className="mb-2 text-xs font-medium text-slate-400">
            Home <span className="mx-2">/</span> Desktop
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Ready for your next setup
              </p>

              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Pre-built Desktop PCs
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Discover ready-to-use gaming desktops, everyday PCs, and
                powerful workstations for your setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product listing */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold">
              All Desktop PCs
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredProducts.length} pre-built PCs
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-expanded={sidebarOpen}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold shadow-sm transition hover:border-blue-300 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="mt-6 flex items-start gap-6">
          {/* Mobile filter backdrop */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            />
          )}

          {/* Filter sidebar */}
          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 w-72.5 overflow-y-auto border-r border-slate-200 bg-white p-5 transition-transform duration-300 lg:sticky lg:top-5 lg:z-0 lg:block lg:h-[calc(100vh-40px)] lg:w-64 lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border lg:shadow-sm`}
          >
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <h2 className="font-heading text-sm font-bold">
                Desktop Filters
              </h2>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {sidebar}
          </aside>

          {/* Products area */}
          <section className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:px-4">
              <p className="text-xs text-slate-500">
                Browse our{" "}
                <span className="font-semibold text-slate-900">
                  pre-built desktop PCs
                </span>
              </p>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <ArrowUpDown size={15} />
                  <span className="hidden sm:inline">Sort by</span>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="max-w-36 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`hidden rounded-md p-2 sm:block ${
                    viewMode === "grid"
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`hidden rounded-md p-2 sm:block ${
                    viewMode === "list"
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <List size={17} />
                </button>
              </div>
            </div>

            {/* Product grid */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
                <h3 className="font-heading text-lg font-bold">
                  No desktop PCs found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your filters to see more results.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-slate-950 px-5 py-3 text-xs font-semibold text-white transition hover:bg-blue-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <ChatSupport />
    </div>
  );
}

function FilterSection({ title, open, onToggle, children }) {
  return (
    <section className="border-t border-slate-100 py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-bold text-slate-900">{title}</span>

        {open ? (
          <ChevronDown size={16} className="text-slate-400" />
        ) : (
          <ChevronRight size={16} className="text-slate-400" />
        )}
      </button>

      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

export default DesktopPage;
