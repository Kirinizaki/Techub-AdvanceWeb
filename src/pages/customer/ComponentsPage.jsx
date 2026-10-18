
import { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  X,
  ArrowUpDown,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import ProductCard from "../../components/customer/ProductCard";
import { products } from "../../data/products";

const categories = [
  { name: "Processors", count: 24 },
  { name: "Graphics Cards", count: 18 },
  { name: "Motherboards", count: 16 },
  { name: "Memory", count: 12 },
  { name: "Storage", count: 20 },
  { name: "Power Supply", count: 10 },
  { name: "Cooling Systems", count: 14 },
];

const brands = ["Intel", "AMD", "NVIDIA", "ASUS", "Corsair", "Samsung"];

function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
              Showing {products.length} sample products
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
                <h2 className="font-heading text-sm font-bold">
                  Filters
                </h2>
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
                {categories.map((category) => (
                  <label
                    key={category.name}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                      />
                      {category.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {category.count}
                    </span>
                  </label>
                ))}
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
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </label>

                <label className="text-[10px] text-slate-500">
                  Maximum (₱)
                  <input
                    type="number"
                    placeholder="100000"
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
                    key={brand}
                    className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                    />
                    {brand}
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
                {["In Stock", "Out of Stock"].map((status) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </FilterSection>

            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-slate-950 py-3 text-xs font-semibold text-white transition hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </aside>

          {/* Products area */}
          <section className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:px-4">
              <p className="text-xs text-slate-500">
                Browse our <span className="font-semibold text-slate-900">
                  PC components
                </span>
              </p>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <ArrowUpDown size={15} />
                  <span className="hidden sm:inline">Sort by</span>
                  <select
                    defaultValue="featured"
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
                  aria-label="Grid view"
                  className="hidden rounded-md bg-blue-50 p-2 text-blue-600 sm:block"
                >
                  <LayoutGrid size={17} />
                </button>

                <button
                  type="button"
                  aria-label="List view"
                  className="hidden rounded-md p-2 text-slate-400 hover:bg-slate-100 sm:block"
                >
                  <List size={17} />
                </button>
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination preview */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400"
              >
                Previous
              </button>

              <button
                type="button"
                aria-current="page"
                className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white"
              >
                1
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600"
              >
                2
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600"
              >
                3
              </button>

              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
              >
                Next
              </button>
            </div>
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
