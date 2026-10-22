import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const productsPerPage = 8;
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

        console.table(
          productData.map((product) => ({
            name: product.name,
            productType: product.productType,
            category: product.category,
          }))
        );

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

    return (
      matchesCategory &&
      matchesBrand &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesAvailability
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
                {categories
                  .filter(
                    (category) =>
                      !["laptops", "desktops"].includes(
                        category.name.trim().toLowerCase()
                      )
                  )
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
