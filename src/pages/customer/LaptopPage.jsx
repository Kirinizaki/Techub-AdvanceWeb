
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

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import ProductCard from "../../components/customer/ProductCard";

const laptopProducts = [
  {
    id: 201,
    name: "Techub Nitro Gaming Laptop",
    category: "Laptop",
    brand: "Acer",
    price: 49999,
    oldPrice: 54999,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
    badge: "Best Seller",
    stock: true,
    processor: "Intel Core i5",
    graphics: "RTX 4050",
    ram: "16GB",
    storage: "512GB SSD",
    screen: "15.6-inch",
    laptopType: "Gaming",
  },
  {
    id: 202,
    name: "Techub ROG Performance Laptop",
    category: "Laptop",
    brand: "ASUS",
    price: 79999,
    oldPrice: 84999,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
    badge: "Popular",
    stock: true,
    processor: "Intel Core i7",
    graphics: "RTX 4060",
    ram: "16GB",
    storage: "1TB SSD",
    screen: "16-inch",
    laptopType: "Gaming",
  },
  {
    id: 203,
    name: "Techub Everyday Laptop",
    category: "Laptop",
    brand: "Lenovo",
    price: 27999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    badge: "Budget Pick",
    stock: true,
    processor: "AMD Ryzen 5",
    graphics: "Integrated",
    ram: "8GB",
    storage: "512GB SSD",
    screen: "14-inch",
    laptopType: "Everyday",
  },
  {
    id: 204,
    name: "Techub Creator Pro Laptop",
    category: "Laptop",
    brand: "ASUS",
    price: 94999,
    oldPrice: 99999,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
    badge: "Creator",
    stock: true,
    processor: "Intel Core i7",
    graphics: "RTX 4070",
    ram: "32GB",
    storage: "1TB SSD",
    screen: "16-inch",
    laptopType: "Creator",
  },
  {
    id: 205,
    name: "Techub Gaming Essential",
    category: "Laptop",
    brand: "HP",
    price: 42999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
    badge: null,
    stock: false,
    processor: "AMD Ryzen 5",
    graphics: "RTX 3050",
    ram: "16GB",
    storage: "512GB SSD",
    screen: "15.6-inch",
    laptopType: "Gaming",
  },
  {
    id: 206,
    name: "Techub Business Laptop",
    category: "Laptop",
    brand: "Dell",
    price: 38999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
    badge: null,
    stock: true,
    processor: "Intel Core i5",
    graphics: "Integrated",
    ram: "16GB",
    storage: "512GB SSD",
    screen: "14-inch",
    laptopType: "Business",
  },
  {
    id: 207,
    name: "Techub Ultra Gaming Laptop",
    category: "Laptop",
    brand: "MSI",
    price: 109999,
    oldPrice: 119999,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
    badge: "High Performance",
    stock: true,
    processor: "Intel Core i9",
    graphics: "RTX 4080",
    ram: "32GB",
    storage: "2TB SSD",
    screen: "17-inch",
    laptopType: "Gaming",
  },
  {
    id: 208,
    name: "Techub Student Laptop",
    category: "Laptop",
    brand: "Lenovo",
    price: 22999,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    badge: "Value Pick",
    stock: true,
    processor: "Intel Core i5",
    graphics: "Integrated",
    ram: "8GB",
    storage: "256GB SSD",
    screen: "14-inch",
    laptopType: "Everyday",
  },
];

const laptopTypes = ["Gaming", "Creator", "Business", "Everyday"];

const processors = [
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "AMD Ryzen 5",
];

const graphicsOptions = [
  "RTX 3050",
  "RTX 4050",
  "RTX 4060",
  "RTX 4070",
  "RTX 4080",
  "Integrated",
];

const brands = ["Acer", "ASUS", "Dell", "HP", "Lenovo", "MSI"];

const ramOptions = ["8GB", "16GB", "32GB"];

function LaptopPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expanded, setExpanded] = useState({
    type: true,
    processor: false,
    graphics: false,
    ram: false,
    price: true,
    brands: false,
    availability: true,
  });

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCPUs, setSelectedCPUs] = useState([]);
  const [selectedGPUs, setSelectedGPUs] = useState([]);
  const [selectedRAM, setSelectedRAM] = useState([]);
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
    let result = laptopProducts.filter((product) => {
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(product.laptopType);

      const matchesCPU =
        selectedCPUs.length === 0 ||
        selectedCPUs.includes(product.processor);

      const matchesGPU =
        selectedGPUs.length === 0 ||
        selectedGPUs.includes(product.graphics);

      const matchesRAM =
        selectedRAM.length === 0 ||
        selectedRAM.includes(product.ram);

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
        matchesType &&
        matchesCPU &&
        matchesGPU &&
        matchesRAM &&
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
    selectedTypes,
    selectedCPUs,
    selectedGPUs,
    selectedRAM,
    selectedBrands,
    availability,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCPUs([]);
    setSelectedGPUs([]);
    setSelectedRAM([]);
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
        title="Laptop Type"
        open={expanded.type}
        onToggle={() => toggleSection("type")}
      >
        <div className="space-y-3">
          {laptopTypes.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() =>
                  toggleOption(type, selectedTypes, setSelectedTypes)
                }
                className="accent-blue-600"
              />
              {type}
            </label>
          ))}
        </div>
      </FilterSection>

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
          {graphicsOptions.map((gpu) => (
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
        title="Memory (RAM)"
        open={expanded.ram}
        onToggle={() => toggleSection("ram")}
      >
        <div className="space-y-3">
          {ramOptions.map((ram) => (
            <label
              key={ram}
              className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
            >
              <input
                type="checkbox"
                checked={selectedRAM.includes(ram)}
                onChange={() =>
                  toggleOption(ram, selectedRAM, setSelectedRAM)
                }
                className="accent-blue-600"
              />
              {ram}
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
            Home <span className="mx-2">/</span> Laptop
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Performance meets portability
              </p>

              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Laptops
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Find gaming laptops, creator machines, and everyday
                notebooks designed for work, study, and play.
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
              All Laptops
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredProducts.length} sample laptops
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
                Laptop Filters
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
                  laptop collection
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
                  No laptops found
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

export default LaptopPage;
