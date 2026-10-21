
import { useMemo, useState } from 'react';
import {
  Download,
  Plus,
  Search,
  Package,
  Layers,
  CircleCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Copy,
  Eye,
  LayoutGrid,
  List,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Laptop,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

const initialProducts = [
  {
    id: 1,
    name: 'ASUS ROG Strix GeForce RTX 4070 Ti SUPER OC',
    sku: 'ROG-RTX4070TIS-O16G',
    category: 'GPU',
    brand: 'ASUS',
    price: 58490,
    stock: 14,
    status: 'Active',
    icon: Cpu,
  },
  {
    id: 2,
    name: 'AMD Ryzen 7 7800X3D Processor',
    sku: 'AMD-AM5-100000910WOF',
    category: 'CPU',
    brand: 'AMD',
    price: 24950,
    stock: 28,
    status: 'Active',
    icon: Cpu,
  },
  {
    id: 3,
    name: 'MSI MAG B650 Tomahawk WiFi Motherboard',
    sku: 'MSI-MAG-B650-TOMA',
    category: 'Motherboard',
    brand: 'MSI',
    price: 13800,
    stock: 9,
    status: 'Active',
    icon: CircuitBoard,
  },
  {
    id: 4,
    name: 'Samsung Odyssey Neo G9 49" Gaming Monitor',
    sku: 'SAM-LS49AG950NNXZA',
    category: 'Monitor',
    brand: 'Samsung',
    price: 89990,
    stock: 4,
    status: 'Active',
    icon: Monitor,
  },
  {
    id: 5,
    name: 'Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz',
    sku: 'CMH32GX5M2B6000C30',
    category: 'RAM',
    brand: 'Corsair',
    price: 7450,
    stock: 45,
    status: 'Active',
    icon: MemoryStick,
  },
  {
    id: 6,
    name: 'Lian Li O11 Dynamic EVO Mid-Tower Case',
    sku: 'LI-O11D-EVO-BLK',
    category: 'PC Cases',
    brand: 'Lian Li',
    price: 10200,
    stock: 0,
    status: 'Out of Stock',
    icon: Package,
  },
  {
    id: 7,
    name: 'Kingston KC3000 2TB PCIe 4.0 NVMe SSD',
    sku: 'SKC3000D/2048G',
    category: 'Storage',
    brand: 'Kingston',
    price: 9650,
    stock: 19,
    status: 'Active',
    icon: HardDrive,
  },
  {
    id: 8,
    name: 'Logitech G Pro X Mechanical Gaming Keyboard',
    sku: 'LOG-GPROX-KB',
    category: 'Peripherals',
    brand: 'Logitech',
    price: 6495,
    stock: 12,
    status: 'Active',
    icon: Package,
  },
  {
    id: 9,
    name: 'ASUS TUF Gaming A15 Laptop',
    sku: 'ASUS-TUF-A15',
    category: 'Laptops',
    brand: 'ASUS',
    price: 62995,
    stock: 7,
    status: 'Active',
    icon: Laptop,
  },
];

const categories = [
  'All',
  'GPU',
  'CPU',
  'Motherboard',
  'Monitor',
  'RAM',
  'PC Cases',
  'Storage',
  'Peripherals',
  'Laptops',
];

const formatPrice = (price) =>
  `₱${price.toLocaleString('en-PH')}`;

export default function AdminProductCatalog() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'GPU',
    brand: '',
    price: '',
    stock: '',
  });

  const pageSize = 7;

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);

      const matchesCategory =
        category === 'All' || product.category === category;

      const matchesBrand =
        brand === 'All' || product.brand === brand;

      const matchesStatus =
        status === 'All' || product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesStatus
      );
    });
  }, [products, search, category, brand, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeCount = products.filter(
    (product) => product.status === 'Active'
  ).length;

  const categoryCount = new Set(
    products.map((product) => product.category)
  ).size;

  const stockCount = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const resetPage = () => setPage(1);

  const handleAddProduct = (event) => {
    event.preventDefault();

    if (
      !newProduct.name.trim() ||
      !newProduct.sku.trim() ||
      !newProduct.brand.trim() ||
      newProduct.price === '' ||
      newProduct.stock === ''
    ) {
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      sku: newProduct.sku.trim(),
      category: newProduct.category,
      brand: newProduct.brand.trim(),
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      status: Number(newProduct.stock) > 0 ? 'Active' : 'Out of Stock',
      icon: Package,
    };

    setProducts((previous) => [product, ...previous]);
    setNewProduct({
      name: '',
      sku: '',
      category: 'GPU',
      brand: '',
      price: '',
      stock: '',
    });
    setShowAddForm(false);
    setSearch('');
    setCategory('All');
    setBrand('All');
    setStatus('All');
    setPage(1);
  };

  const handleExport = () => {
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Brand',
      'Price',
      'Stock',
      'Status',
    ];

    const rows = filteredProducts.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.brand,
      product.price,
      product.stock,
      product.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'techhub-product-catalog.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleDuplicate = (product) => {
    const duplicate = {
      ...product,
      id: Date.now(),
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
    };

    setProducts((previous) => [duplicate, ...previous]);
    setPage(1);
    setSearch('');
    setCategory('All');
    setBrand('All');
    setStatus('All');
  };

  const handleEdit = (product) => {
    const updatedName = window.prompt(
      'Enter the product name:',
      product.name
    );

    if (updatedName === null || !updatedName.trim()) return;

    const updatedPrice = window.prompt(
      'Enter the product price:',
      String(product.price)
    );

    if (updatedPrice === null || updatedPrice.trim() === '') return;

    const price = Number(updatedPrice);

    if (!Number.isFinite(price) || price < 0) {
      window.alert('Please enter a valid price.');
      return;
    }

    setProducts((previous) =>
      previous.map((item) =>
        item.id === product.id
          ? {
              ...item,
              name: updatedName.trim(),
              price,
            }
          : item
      )
    );
  };

  return (
    <AdminLayout>
      <div className="min-w-0 space-y-4 font-sans text-slate-900">
        {/* Page heading */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">
                Product Catalog
              </h1>

              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Live Operations
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Full System Access • Manage product listings, categories,
              specifications, and catalog status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={13} />
              Export Catalog
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm((previous) => !previous)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={14} />
              Add New Product
            </button>
          </div>
        </div>

        {/* Add product form */}
        {showAddForm && (
          <form
            onSubmit={handleAddProduct}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">Add New Product</h2>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="text-xs font-medium text-slate-600">
                Product Name
                <input
                  required
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                SKU
                <input
                  required
                  value={newProduct.sku}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      sku: event.target.value,
                    })
                  }
                  placeholder="Enter SKU"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Brand
                <input
                  required
                  value={newProduct.brand}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      brand: event.target.value,
                    })
                  }
                  placeholder="Enter brand"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Category
                <select
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      category: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                >
                  {categories
                    .filter((item) => item !== 'All')
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label className="text-xs font-medium text-slate-600">
                Price (₱)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      price: event.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Stock Units
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.stock}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      stock: event.target.value,
                    })
                  }
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Save Product
            </button>
          </form>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-600">
                Total Active Catalog
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <Package size={13} />
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold">
              {activeCount.toLocaleString()}
              <span className="ml-1 text-xs font-medium text-slate-500">
                Products
              </span>
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
              <span className="font-semibold text-emerald-600">
                {products.length} listed
              </span>
              {' '}in this sample catalog
            </p>

            <button
              type="button"
              onClick={() => {
                setStatus('All');
                setCategory('All');
                setBrand('All');
                setSearch('');
                resetPage();
              }}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View full inventory →
            </button>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-600">
                Department Categories
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                <Layers size={13} />
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold">
              {categoryCount}
              <span className="ml-1 text-xs font-medium text-slate-500">
                Categories
              </span>
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
              Components, laptops, and peripherals
            </p>

            <button
              type="button"
              onClick={() => {
                setCategory('All');
                resetPage();
              }}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Manage taxonomies →
            </button>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-600">
                In Stock Units
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <CircleCheck size={13} />
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold">
              {stockCount.toLocaleString()}
              <span className="ml-1 text-xs font-medium text-slate-500">
                Units
              </span>
            </p>

            <p className="mt-2 text-[11px] text-emerald-600">
              Across listed products
            </p>

            <button
              type="button"
              onClick={() => {
                setStatus('Out of Stock');
                resetPage();
              }}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View stock status →
            </button>
          </div>
        </section>

        {/* Catalog table */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          {/* Search and filters */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={14} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                placeholder="Filter by product name, brand, or model..."
                className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600">
                Category:
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    resetPage();
                  }}
                  className="max-w-28 bg-transparent text-[10px] outline-none"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600">
                Brand:
                <select
                  value={brand}
                  onChange={(event) => {
                    setBrand(event.target.value);
                    resetPage();
                  }}
                  className="max-w-24 bg-transparent text-[10px] outline-none"
                >
                  <option value="All">All</option>
                  {[...new Set(products.map((item) => item.brand))]
                    .sort()
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600">
                Status:
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    resetPage();
                  }}
                  className="max-w-28 bg-transparent text-[10px] outline-none"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </label>

              <div className="flex rounded-lg border border-slate-200 p-0.5">
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setView('list')}
                  className={`rounded-md p-1.5 ${
                    view === 'list'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <List size={14} />
                </button>

                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setView('grid')}
                  className={`rounded-md p-1.5 ${
                    view === 'grid'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* List view */}
          {view === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3">Product Name &amp; Model</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Brand</th>
                    <th className="px-3 py-3">Base Price</th>
                    <th className="px-3 py-3">Stock Status</th>
                    <th className="px-3 py-3">Catalog Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleProducts.map((product) => {
                    const ProductIcon = product.icon;
                    const lowStock =
                      product.stock > 0 && product.stock < 10;

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                              <ProductIcon size={15} />
                            </span>

                            <div className="min-w-0">
                              <p className="max-w-[260px] text-xs font-bold text-slate-800">
                                {product.name}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                SKU: {product.sku}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span className="rounded bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-slate-600">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-xs text-slate-600">
                          {product.brand}
                        </td>

                        <td className="px-3 py-3 text-xs font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-start gap-1.5">
                            <span
                              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                                product.stock === 0
                                  ? 'bg-rose-500'
                                  : lowStock
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                              }`}
                            />

                            <div>
                              <p
                                className={`text-[10px] font-semibold ${
                                  product.stock === 0
                                    ? 'text-rose-600'
                                    : lowStock
                                      ? 'text-amber-600'
                                      : 'text-slate-700'
                                }`}
                              >
                                {product.stock} units
                              </p>

                              <p
                                className={`text-[10px] ${
                                  product.stock === 0
                                    ? 'text-rose-500'
                                    : lowStock
                                      ? 'text-amber-600'
                                      : 'text-emerald-600'
                                }`}
                              >
                                {product.stock === 0
                                  ? 'Out of Stock'
                                  : lowStock
                                    ? 'Low Stock'
                                    : 'In Stock'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
                              product.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-600'
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Edit product name and price"
                              aria-label={`Edit ${product.name}`}
                              onClick={() => handleEdit(product)}
                              className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              type="button"
                              title="Duplicate product"
                              aria-label={`Duplicate ${product.name}`}
                              onClick={() => handleDuplicate(product)}
                              className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Copy size={13} />
                            </button>

                            <button
                              type="button"
                              title="View product details"
                              aria-label={`View ${product.name}`}
                              onClick={() =>
                                window.alert(
                                  `Product: ${product.name}\nSKU: ${product.sku}\nCategory: ${product.category}\nBrand: ${product.brand}\nPrice: ${formatPrice(product.price)}\nStock: ${product.stock}\nStatus: ${product.status}`
                                )
                              }
                              className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {visibleProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center"
                      >
                        <Package
                          size={26}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        <p className="text-sm font-semibold text-slate-700">
                          No products found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Try changing your search or filter settings.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setCategory('All');
                            setBrand('All');
                            setStatus('All');
                            resetPage();
                          }}
                          className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid view */
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => {
                const ProductIcon = product.icon;

                return (
                  <article
                    key={product.id}
                    className="rounded-xl border border-slate-200 p-4 hover:border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <ProductIcon size={18} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-400">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="rounded bg-blue-50 px-2 py-1 text-[10px] text-slate-600">
                        {product.category}
                      </span>
                      <span className="text-xs font-bold">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[11px] text-slate-500">
                        {product.stock} units in stock
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    </div>
                  </article>
                );
              })}

              {visibleProducts.length === 0 && (
                <p className="col-span-full py-10 text-center text-xs text-slate-500">
                  No products match your filters.
                </p>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">
              Showing{' '}
              {filteredProducts.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              {' '}to{' '}
              {Math.min(currentPage * pageSize, filteredProducts.length)}
              {' '}of {filteredProducts.length} products
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((previous) => previous - 1)}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={12} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    Math.abs(number - currentPage) <= 1
                )
                .map((number, index, numbers) => (
                  <span key={number} className="contents">
                    {index > 0 && number - numbers[index - 1] > 1 && (
                      <span className="px-1 text-[10px] text-slate-400">
                        ...
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setPage(number)}
                      className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-semibold ${
                        currentPage === number
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {number}
                    </button>
                  </span>
                ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((previous) => previous + 1)}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
