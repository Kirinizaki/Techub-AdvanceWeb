import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  ArrowUpDown,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import ProductCard from "../../components/customer/ProductCard";
import { 
  getProducts,
  getCategories,
  getBrands, 
} from "../../services/productService";


function ProductsPage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [specFiltersOpen, setSpecFiltersOpen] = useState(false);
  const [selectedSpecifications, setSelectedSpecifications] = useState({});
  const [gridColumns, setGridColumns] = useState(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 420) return 2;
    return 1;
  });
  const productsPerPage = gridColumns * 3;
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    brands: false,
    availability: true,
  });

  const toggleSection = (section) => {
      setExpanded((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };
    
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      const nextColumns = width >= 1280 ? 4 : width >= 1024 ? 3 : width >= 420 ? 2 : 1;

      setGridColumns((currentColumns) => {
        if (currentColumns !== nextColumns) {
          setCurrentPage(1);
        }
        return nextColumns;
      });
    };

    window.addEventListener("resize", updateGridColumns);
    updateGridColumns();

    return () => window.removeEventListener("resize", updateGridColumns);
  }, []);

  useEffect(() => {
    setSelectedSpecifications({});
    if (!categoryFromUrl) {
      setSelectedCategories([]);
      return;
    }

    const matchingCategory = categories.find(
      (category) =>
        category.name.toLowerCase() === categoryFromUrl.toLowerCase()
    );

    setSelectedCategories(
      matchingCategory ? [matchingCategory.name] : []
    );
  }, [categoryFromUrl, categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    selectedSpecifications,
  ]);


  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const [productData, categoryData, brandData] = await Promise.all([
          getProducts("component"),
          getCategories(),
          getBrands(),
        ]);

        if (cancelled) return;

        setProducts(productData);
        setCategories(categoryData);
        setBrands(brandData);
      } catch (err) {
        console.error("Error loading components catalog:", err);

        if (!cancelled) {
          setError("Unable to load components. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  
  
const selectedCategory = selectedCategories.length === 1 ? selectedCategories[0] : null;

  // Keep the specification popup focused on a small set of useful filters per category.
  // Each spec filter maps to the labels used by the product specifications in Supabase.
  const specificationFilterConfig = {
    "CPUs": [
      { key: "__manufacturer", label: "Manufacturer", source: "brand" },
      { key: "__family", label: "Product Family", labels: ["product family", "family", "series", "processor family", "cpu family"] },
      { key: "__socket", label: "Socket Type", labels: ["socket", "socket type", "cpu socket"] },
    ],
    "Graphics Cards": [
      { key: "__manufacturer", label: "Manufacturer", source: "brand" },
      { key: "__gpuFamily", label: "GPU Family", labels: ["gpu family", "graphics processor", "chipset", "gpu", "graphics chipset"] },
      { key: "__vram", label: "VRAM", labels: ["vram", "memory size", "graphics memory", "video memory"] },
    ],
    "Motherboards": [
      { key: "__manufacturer", label: "Manufacturer", source: "brand" },
      { key: "__socket", label: "Socket Type", labels: ["socket", "socket type", "cpu socket"] },
      { key: "__formFactor", label: "Form Factor", labels: ["form factor", "motherboard form factor", "board size"] },
    ],
    "Memory (RAM)": [
      { key: "__memoryType", label: "Memory Type", labels: ["memory type", "ram type", "type", "generation"] },
      { key: "__capacity", label: "Capacity", labels: ["capacity", "total capacity", "memory capacity", "size"] },
      { key: "__speed", label: "Speed", labels: ["speed", "memory speed", "data rate", "frequency"] },
    ],
    "Storage": [
      { key: "__driveType", label: "Drive Type", labels: ["storage type", "drive type", "type", "form factor", "interface"] },
      { key: "__capacity", label: "Capacity", labels: ["capacity", "storage capacity", "size"] },
    ],
    "CPU Coolers": [
      { key: "__coolerType", label: "Cooler Type", labels: ["cooler type", "cooling type", "type"] },
      { key: "__socket", label: "Socket Compatibility", labels: ["socket compatibility", "supported socket", "socket", "cpu socket"] },
    ],
    "Power Supplies": [
      { key: "__wattage", label: "Wattage", labels: ["wattage", "power output", "total power", "output power"] },
      { key: "__modularity", label: "Modularity", labels: ["modularity", "modular"] },
      { key: "__formFactor", label: "Form Factor", labels: ["form factor", "psu form factor"] },
    ],
    "PC Cases": [
      { key: "__caseFormFactor", label: "Case Form Factor", labels: ["case form factor", "form factor", "case type"] },
      { key: "__motherboardSupport", label: "Motherboard Compatibility", labels: ["supported motherboard sizes", "motherboard support", "motherboard compatibility", "motherboard form factor"] },
    ],
  };

  const specificationOptions = (() => {
    if (!selectedCategory) return [];

    const config = specificationFilterConfig[selectedCategory] || [];
    const categoryProducts = products.filter((product) => product.category === selectedCategory);
    const normalize = (value) => String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");

    return config.map((filter) => {
      const values = new Set();

      categoryProducts.forEach((product) => {
        if (filter.source === "brand") {
          if (product.brand && String(product.brand).trim()) values.add(String(product.brand).trim());
          return;
        }

        (product.specifications || []).forEach((item) => {
          if (!Array.isArray(item) || item.length < 2) return;
          const label = normalize(item[0]);
          const value = String(item[1] ?? "").trim();
          const matchesLabel = filter.labels?.some((candidate) =>
            label === candidate || label.includes(candidate)
          );
          if (matchesLabel && value && value !== "—" && value.toLowerCase() !== "n/a") {
            values.add(value);
          }
        });
      });

      return {
        key: filter.key,
        label: filter.label,
        source: filter.source || "specification",
        values: [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      };
    }).filter((filter) => filter.values.length > 1);
  })();

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand);

      const matchesMinPrice =
        minPrice === "" || product.price >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || product.price <= Number(maxPrice);

      const matchesAvailability =
        !inStockOnly || product.stock === "In Stock";

      const matchesSpecifications = Object.entries(selectedSpecifications).every(
        ([filterKey, selectedValue]) => {
          if (!selectedValue) return true;
          if (filterKey === "__manufacturer") {
            return String(product.brand || "").trim() === selectedValue;
          }

          const config = (specificationFilterConfig[selectedCategory] || []).find(
            (filter) => filter.key === filterKey
          );
          if (!config) return true;
          const normalize = (value) => String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
          return (product.specifications || []).some((item) => {
            if (!Array.isArray(item) || item.length < 2) return false;
            const label = normalize(item[0]);
            const matchesLabel = config.labels?.some((candidate) =>
              label === candidate || label.includes(candidate)
            );
            return matchesLabel && String(item[1]).trim() === selectedValue;
          });
        }
      );

      return (
        matchesCategory &&
        matchesBrand &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesAvailability &&
        matchesSpecifications
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  
  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const startItem =
    filteredProducts.length === 0 ? 0 : startIndex + 1;

  const endItem = Math.min(
    startIndex + productsPerPage,
    filteredProducts.length
  );


  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-slate-900">
      <Navbar />

      {/* Page heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">
          <p className="mb-2 text-xs font-medium text-slate-400">
            Home <span className="mx-2">/</span> Products
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Find your next upgrade
              </p>

              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                PC Components
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Discover powerful components built for your next gaming setup.
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
              All Components
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {loading
                ? "Loading components..."
                : `Showing ${startItem}–${endItem} of ${filteredProducts.length} products`}
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
          {/* Filter sidebar */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            />
          )}

          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 w-72.5 overflow-y-auto border-r border-slate-200 bg-white p-5 transition-transform duration-300 lg:sticky lg:top-5 lg:z-0 lg:block lg:h-[calc(100vh-40px)] lg:w-64 lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border lg:shadow-sm`}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} />
                <h2 className="font-heading text-sm font-bold">Filters</h2>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 hover:bg-slate-100 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <FilterSection
              title="Categories"
              open={expanded.categories}
              onToggle={() => toggleSection("categories")}
            >
              <div className="space-y-1">
                {categories
                  .filter(
                    (category) =>
                      !["laptops", "desktops"].includes(
                        category.name.trim().toLowerCase()
                      )
                  )
                  .sort((a, b) => {
                    const categoryOrder = [
                      "CPUs",
                      "Motherboards",
                      "Graphics Cards",
                      "Memory (RAM)",
                      "Storage",
                      "CPU Coolers",
                      "Power Supplies",
                      "PC Cases",
                    ];
                    const aIndex = categoryOrder.indexOf(a.name);
                    const bIndex = categoryOrder.indexOf(b.name);
                    const safeA = aIndex === -1 ? categoryOrder.length : aIndex;
                    const safeB = bIndex === -1 ? categoryOrder.length : bIndex;
                    return safeA - safeB || a.name.localeCompare(b.name);
                  })
                  .map((category) => {
                    const count = products.filter(
                      (product) => product.category === category.name
                    ).length;

                    return (
                      <label
                        key={category.id}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-blue-600"
                            checked={selectedCategories.includes(category.name)}
                            onChange={(event) => {
                              setSelectedSpecifications({});
                              setSelectedCategories((current) =>
                                event.target.checked
                                  ? [...current, category.name]
                                  : current.filter((name) => name !== category.name)
                              );
                            }}
                          />

                          {category.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {count}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </FilterSection>

            {/* Price range */}
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
                    placeholder="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </label>
              </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection
              title="Brands"
              open={expanded.brands}
              onToggle={() => toggleSection("brands")}
            >
              <div className="space-y-3">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={(event) => {
                        setSelectedBrands((current) =>
                          event.target.checked
                            ? [...current, brand.name]
                            : current.filter((name) => name !== brand.name)
                        );
                      }}
                    />

                    {brand.name}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Availability */}
            <FilterSection
              title="Availability"
              open={expanded.availability}
              onToggle={() => toggleSection("availability")}
            >
              <div className="space-y-3">
                {["In Stock"].map((status) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                  >            
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={
                        status === "In Stock"
                          ? inStockOnly
                          : false
                      }
                      onChange={(event) => {
                        if (status === "In Stock") {
                          setInStockOnly(event.target.checked);
                        }
                      }}
                    />
                    
                    {status}
                  </label>
                ))}
              </div>
            </FilterSection>

          </aside>

          {/* Products area */}
          <section className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:px-4">
              <p className="text-xs text-slate-500">
                Browse our <span className="font-semibold text-slate-900">PC components</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpecFiltersOpen((open) => !open)}
                  aria-expanded={specFiltersOpen}
                  aria-haspopup="dialog"
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                    specFiltersOpen
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  Specifications
                  {Object.values(selectedSpecifications).filter(Boolean).length > 0 && (
                    <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                      {Object.values(selectedSpecifications).filter(Boolean).length}
                    </span>
                  )}
                </button>

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
                    <option value="name">Name: A to Z</option>
                  </select>
                </label>
              </div>

              {specFiltersOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close specification filters"
                    onClick={() => setSpecFiltersOpen(false)}
                    className="fixed inset-0 z-30 cursor-default bg-transparent"
                  />
                  <div
                    role="dialog"
                    aria-label="Specification filters"
                    className="absolute right-0 top-full z-40 mt-2 w-[min(380px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Specification Filters</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {selectedCategory
                            ? `Narrow down ${selectedCategory} by its specifications.`
                            : "Select one category in the sidebar to see relevant specifications."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpecFiltersOpen(false)}
                        aria-label="Close specification filters"
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {!selectedCategory ? (
                      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        Choose exactly one category, such as Storage or CPUs, to show matching filters.
                      </p>
                    ) : specificationOptions.length === 0 ? (
                      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                        No varying specification options were found for this category. Check that its products have specification values saved in the database.
                      </p>
                    ) : (
                      <div className="mt-4 max-h-[55vh] space-y-4 overflow-y-auto pr-1">
                        {specificationOptions.map(({ key, label, values }) => (
                          <label key={key} className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
                            <select
                              value={selectedSpecifications[key] || ""}
                              onChange={(event) =>
                                setSelectedSpecifications((current) => ({
                                  ...current,
                                  [key]: event.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                            >
                              <option value="">Any {label}</option>
                              {values.map((value) => (
                                <option key={value} value={value}>{value}</option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    )}

                    {Object.values(selectedSpecifications).some(Boolean) && (
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedSpecifications({})}
                          className="text-xs font-medium text-slate-500 hover:text-slate-900"
                        >
                          Clear filters
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpecFiltersOpen(false)}
                          className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading components...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-white p-10 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {products.length === 0
                    ? "No products available yet."
                    : "No products match your filters."}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {products.length === 0
                    ? "Products will appear here once they are added to the catalog."
                    : "Try adjusting your filters or price range to see more products."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}


            
            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Product pagination"
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={currentPage === page ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-500"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
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
        <span className="text-xs font-bold text-slate-900">
          {title}
        </span>

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

export default ProductsPage;
