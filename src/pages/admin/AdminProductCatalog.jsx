import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download, Plus, Search, Package, Layers, CircleCheck, ChevronLeft,
  ChevronRight, Pencil, Copy, Eye, LayoutGrid, List, Cpu, Monitor,
  MemoryStick, HardDrive, CircuitBoard, Laptop, RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';

const formatPrice = (price) =>
  `₱${Number(price || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const productIcon = (category = '') => {
  const value = category.toLowerCase();
  if (value.includes('gpu') || value.includes('cpu') || value.includes('processor')) return Cpu;
  if (value.includes('motherboard')) return CircuitBoard;
  if (value.includes('monitor') || value.includes('display')) return Monitor;
  if (value.includes('ram') || value.includes('memory')) return MemoryStick;
  if (value.includes('storage') || value.includes('ssd') || value.includes('drive')) return HardDrive;
  if (value.includes('laptop')) return Laptop;
  return Package;
};

const blankProduct = {
  name: '',
  sku: '',
  category_id: '',
  brand_id: '',
  price: '',
  stock_quantity: '0',
  description: '',
  image_url: '',
  product_type: '',
};

export default function AdminProductCatalog({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState(blankProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    const [productResult, categoryResult, brandResult] = await Promise.all([
      supabase
        .from('products')
        .select('id, sku, name, slug, description, price, image_url, category_id, brand_id, stock_quantity, is_active, created_at, updated_at, product_type')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug').order('name'),
      supabase.from('brands').select('id, name, slug').order('name'),
    ]);

    const failed = productResult.error || categoryResult.error || brandResult.error;
    if (failed) {
      setError(failed.message || 'Could not load catalog data.');
      setLoading(false);
      return;
    }

    const categoryRows = categoryResult.data || [];
    const brandRows = brandResult.data || [];
    const categoryNames = new Map(categoryRows.map((item) => [item.id, item.name]));
    const brandNames = new Map(brandRows.map((item) => [item.id, item.name]));

    setCategories(categoryRows);
    setBrands(brandRows);
    setProducts((productResult.data || []).map((item) => ({
      ...item,
      category: categoryNames.get(item.category_id) || 'Uncategorized',
      brand: brandNames.get(item.brand_id) || '—',
      stock: Number(item.stock_quantity || 0),
      status: item.is_active ? 'Active' : 'Inactive',
      icon: productIcon(categoryNames.get(item.category_id)),
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products.filter((product) => {
      const matchesSearch =
        (product.name || '').toLowerCase().includes(query) ||
        (product.sku || '').toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query);
      const matchesCategory = category === 'All' || product.category === category;
      const matchesBrand = brand === 'All' || product.brand === brand;
      const matchesStatus =
        status === 'All' ||
        (status === 'Out of Stock'
          ? product.stock === 0
          : status === 'Active'
            ? product.is_active && product.stock > 0
            : product.status === status);
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [products, search, category, brand, status]);

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeCount = products.filter((item) => item.is_active).length;
  const categoryCount = new Set(products.map((item) => item.category_id)).size;
  const stockCount = products.reduce((total, item) => total + item.stock, 0);
  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setBrand('All');
    setStatus('All');
    setPage(1);
  };

  const clearForm = () => {
    setNewProduct(blankProduct);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!newProduct.name.trim() || !newProduct.category_id || newProduct.price === '') {
      setError('Product name, category, and price are required.');
      return;
    }
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock_quantity);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setError('Enter a valid non-negative price and whole-number stock quantity.');
      return;
    }

    const categoryRow = categories.find((item) => item.id === newProduct.category_id);
    if (!categoryRow) {
      setError('Please choose a valid category.');
      return;
    }

    const payload = {
      name: newProduct.name.trim(),
      slug: makeSlug(newProduct.name) || `product-${Date.now()}`,
      sku: newProduct.sku.trim() || null,
      description: newProduct.description.trim() || null,
      price,
      image_url: newProduct.image_url.trim() || null,
      category_id: newProduct.category_id,
      brand_id: newProduct.brand_id || null,
      stock_quantity: stock,
      is_active: stock > 0,
      product_type: newProduct.product_type.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    let result;
    if (editingProduct) {
      result = await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      result = await supabase.from('products').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    await loadCatalog();
    clearForm();
    resetFilters();
    setNotice(editingProduct ? 'Product updated in Supabase.' : 'Product added to Supabase.');
    setSaving(false);
  };

  const startEdit = (product) => {
    setError('');
    setNotice('');
    setEditingProduct(product);
    setNewProduct({
      name: product.name || '',
      sku: product.sku || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      price: String(product.price ?? ''),
      stock_quantity: String(product.stock_quantity ?? 0),
      description: product.description || '',
      image_url: product.image_url || '',
      product_type: product.product_type || '',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = async (product) => {
    setError('');
    setNotice('');
    const name = `${product.name} (Copy)`;
    const payload = {
      name,
      slug: `${makeSlug(name)}-${Date.now().toString(36)}`,
      sku: product.sku ? `${product.sku}-COPY-${Date.now().toString(36)}` : null,
      description: product.description || null,
      price: Number(product.price),
      image_url: product.image_url || null,
      category_id: product.category_id,
      brand_id: product.brand_id || null,
      stock_quantity: Number(product.stock_quantity || 0),
      is_active: Boolean(product.is_active),
      product_type: product.product_type || null,
      updated_at: new Date().toISOString(),
    };
    const { error: insertError } = await supabase.from('products').insert(payload);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    await loadCatalog();
    resetFilters();
    setNotice('Product duplicated in Supabase.');
  };

  const handleExport = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status'];
    const rows = filteredProducts.map((product) => [
      product.name, product.sku || '', product.category, product.brand,
      product.price, product.stock, product.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'techhub-product-catalog.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="min-w-0 space-y-4 font-sans text-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">Product Catalog</h1>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Live Operations</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Manage product listings, categories, stock, and catalog status.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={loadCatalog} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <RefreshCw size={13} /> Refresh
            </button>
            <button type="button" onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Download size={13} /> Export Catalog
            </button>
            <button type="button" onClick={() => { setEditingProduct(null); setNewProduct(blankProduct); setShowAddForm((value) => !value); }} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              <Plus size={14} /> Add New Product
            </button>
          </div>
        </div>

        {(error || notice) && (
          <div role="status" className={`rounded-lg border px-3 py-2 text-xs ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {error || notice}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleSaveProduct} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button type="button" onClick={clearForm} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="text-xs font-medium text-slate-600">Product Name
                <input required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Enter product name" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
              <label className="text-xs font-medium text-slate-600">SKU (optional)
                <input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="Enter SKU" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
              <label className="text-xs font-medium text-slate-600">Category
                <select required value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500">
                  <option value="">Choose category</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">Brand (optional)
                <select value={newProduct.brand_id} onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500">
                  <option value="">No brand</option>
                  {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">Price (₱)
                <input required type="number" min="0" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
              <label className="text-xs font-medium text-slate-600">Stock Units
                <input required type="number" min="0" step="1" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
              <label className="text-xs font-medium text-slate-600">Image URL (optional)
                <input type="url" value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
              <label className="text-xs font-medium text-slate-600">Product Type (optional)
                <input value={newProduct.product_type} onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })} placeholder="e.g. component" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
              <label className="text-xs font-medium text-slate-600 sm:col-span-2 xl:col-span-3">Description (optional)
                <textarea rows={2} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Product description" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500" />
              </label>
            </div>
            <button disabled={saving} type="submit" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Save Product'}
            </button>
          </form>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-xs font-medium text-slate-600">Active Catalog</p><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600"><Package size={13} /></span></div>
            <p className="mt-2 text-2xl font-bold">{activeCount.toLocaleString()}<span className="ml-1 text-xs font-medium text-slate-500">Products</span></p>
            <p className="mt-2 text-[11px] text-slate-500"><span className="font-semibold text-emerald-600">{products.length} listed</span> in Supabase</p>
            <button type="button" onClick={resetFilters} className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800">View full inventory →</button>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-xs font-medium text-slate-600">Department Categories</p><span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600"><Layers size={13} /></span></div>
            <p className="mt-2 text-2xl font-bold">{categoryCount}<span className="ml-1 text-xs font-medium text-slate-500">Categories used</span></p>
            <p className="mt-2 text-[11px] text-slate-500">{categories.length} available categories</p>
            <button type="button" onClick={() => { setCategory('All'); resetPage(); }} className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800">Show all categories →</button>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-xs font-medium text-slate-600">In Stock Units</p><span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"><CircleCheck size={13} /></span></div>
            <p className="mt-2 text-2xl font-bold">{stockCount.toLocaleString()}<span className="ml-1 text-xs font-medium text-slate-500">Units</span></p>
            <p className="mt-2 text-[11px] text-emerald-600">Across listed products</p>
            <button type="button" onClick={() => { setStatus('Out of Stock'); resetPage(); }} className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800">View out-of-stock items →</button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} placeholder="Filter by product name, brand, or model..." className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600">Category:
                <select value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} className="max-w-32 bg-transparent text-[10px] outline-none">
                  <option value="All">All</option>
                  {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600">Brand:
                <select value={brand} onChange={(e) => { setBrand(e.target.value); resetPage(); }} className="max-w-28 bg-transparent text-[10px] outline-none">
                  <option value="All">All</option>
                  {[...new Set(products.map((item) => item.brand))].filter((item) => item && item !== '—').sort().map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[10px] font-medium text-slate-600">Status:
                <select value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="max-w-32 bg-transparent text-[10px] outline-none">
                  <option value="All">All</option><option value="Active">Active and in stock</option><option value="Out of Stock">Out of Stock</option><option value="Inactive">Inactive</option>
                </select>
              </label>
              <div className="flex rounded-lg border border-slate-200 p-0.5">
                <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded-md p-1.5 ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}><List size={14} /></button>
                <button type="button" aria-label="Grid view" onClick={() => setView('grid')} className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}><LayoutGrid size={14} /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-4 py-12 text-center text-xs text-slate-500">Loading products from Supabase…</div>
          ) : view === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left">
                <thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Product Name &amp; SKU</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Brand</th><th className="px-3 py-3">Base Price</th><th className="px-3 py-3">Stock Status</th><th className="px-3 py-3">Catalog Status</th><th className="px-3 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {visibleProducts.map((product) => {
                    const ProductIcon = product.icon;
                    const lowStock = product.stock > 0 && product.stock < 10;
                    return <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                      <td className="px-3 py-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600"><ProductIcon size={15} /></span><div className="min-w-0"><p className="max-w-65 text-xs font-bold text-slate-800">{product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">SKU: {product.sku || '—'}</p></div></div></td>
                      <td className="px-3 py-3"><span className="rounded bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-slate-600">{product.category}</span></td>
                      <td className="px-3 py-3 text-xs text-slate-600">{product.brand}</td>
                      <td className="px-3 py-3 text-xs font-bold text-slate-900">{formatPrice(product.price)}</td>
                      <td className="px-3 py-3"><p className={`text-[10px] font-semibold ${product.stock === 0 ? 'text-rose-600' : lowStock ? 'text-amber-600' : 'text-emerald-600'}`}>{product.stock} units</p><p className="text-[10px] text-slate-500">{product.stock === 0 ? 'Out of Stock' : lowStock ? 'Low Stock' : 'In Stock'}</p></td>
                      <td className="px-3 py-3"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>{product.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-3 py-3"><div className="flex items-center justify-end gap-1">
                        <button type="button" title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => startEdit(product)} className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Pencil size={13} /></button>
                        <button type="button" title="Duplicate product" aria-label={`Duplicate ${product.name}`} onClick={() => handleDuplicate(product)} className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Copy size={13} /></button>
                        <button type="button" title="View product details" aria-label={`View ${product.name}`} onClick={() => window.alert(`Product: ${product.name}\nSKU: ${product.sku || '—'}\nCategory: ${product.category}\nBrand: ${product.brand}\nPrice: ${formatPrice(product.price)}\nStock: ${product.stock}\nStatus: ${product.status}`)} className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Eye size={13} /></button>
                      </div></td>
                    </tr>;
                  })}
                  {visibleProducts.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center"><Package size={26} className="mx-auto mb-2 text-slate-300" /><p className="text-sm font-semibold text-slate-700">No products found</p><p className="mt-1 text-xs text-slate-500">Try changing your search or filters.</p><button type="button" onClick={resetFilters} className="mt-3 text-xs font-semibold text-blue-600 hover:underline">Clear filters</button></td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => {
                const ProductIcon = product.icon;
                return <article key={product.id} className="rounded-xl border border-slate-200 p-4 hover:border-blue-200">
                  <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><ProductIcon size={18} /></span><div className="min-w-0 flex-1"><h3 className="text-xs font-bold">{product.name}</h3><p className="mt-1 text-[10px] text-slate-400">SKU: {product.sku || '—'}</p></div></div>
                  <div className="mt-4 flex items-center justify-between gap-2"><span className="rounded bg-blue-50 px-2 py-1 text-[10px] text-slate-600">{product.category}</span><span className="text-xs font-bold">{formatPrice(product.price)}</span></div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[11px] text-slate-500">{product.stock} units in stock</span><button type="button" onClick={() => startEdit(product)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"><Pencil size={12} /> Edit</button></div>
                </article>;
              })}
              {visibleProducts.length === 0 && <p className="col-span-full py-10 text-center text-xs text-slate-500">No products match your filters.</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] text-slate-500">Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products</p>
            <div className="flex items-center gap-1">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage((previous) => previous - 1)} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={12} /> Previous</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).filter((number) => number === 1 || number === totalPages || Math.abs(number - currentPage) <= 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-semibold ${currentPage === number ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{number}</button>)}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((previous) => previous + 1)} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={12} /></button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
