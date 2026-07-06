import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';

function ProductModal({ product, categories, branchId, onClose }) {
    const editing = !!product;
    const [form, setForm] = useState({
        name: product?.name || '',
        sku: product?.sku || '',
        description: product?.description || '',
        category_id: product?.category_id || '',
        branch_id: product?.branch_id || branchId,
        price: product?.price || '',
        cost: product?.cost || '',
        stock: product?.stock || 0,
        min_stock_level: product?.min_stock_level || 5,
        image_url: product?.image_url || '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const method = editing ? 'put' : 'post';
        const url = editing ? `/products/${product.id}` : '/products';

        router[method](url, form, {
            onError: (errs) => { setErrors(errs); setLoading(false); },
            onSuccess: () => onClose(),
        });
    };

    const field = (key, label, type = 'text', opts = {}) => (
        <div className="input-group">
            <label className="input-label">{label}</label>
            <input
                type={type}
                className={`input-field ${errors[key] ? 'border-red-500' : ''}`}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={errors[key] ? { borderColor: 'var(--color-danger)' } : {}}
                {...opts}
            />
            {errors[key] && <span style={{ color: 'var(--color-danger)', fontSize: 12 }}>{errors[key]}</span>}
        </div>
    );

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-grid-2">
                            {field('name', 'Product Name', 'text', { placeholder: 'e.g. Wireless Mouse', required: true })}
                            {field('sku', 'SKU', 'text', { placeholder: 'e.g. WM-001', required: true })}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Category</label>
                            <select
                                className="input-field"
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                                required
                            >
                                <option value="">Select category...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.category_id && <span style={{ color: 'var(--color-danger)', fontSize: 12 }}>{errors.category_id}</span>}
                        </div>

                        <div className="form-grid-2">
                            {field('price', 'Selling Price ($)', 'number', { placeholder: '0.00', min: 0, step: '0.01' })}
                            {field('cost', 'Cost Price ($)', 'number', { placeholder: '0.00', min: 0, step: '0.01' })}
                        </div>

                        <div className="form-grid-2">
                            {field('stock', 'Initial Stock', 'number', { min: 0 })}
                            {field('min_stock_level', 'Min Stock Level', 'number', { min: 0 })}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Description (optional)</label>
                            <textarea
                                className="input-field"
                                rows={2}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {field('image_url', 'Product Image URL (optional)', 'text', { placeholder: 'e.g. https://images.unsplash.com/...' })}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
                            {editing ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirmModal({ product, onClose }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        setLoading(true);
        router.delete(`/products/${product.id}`, {
            onSuccess: () => onClose(),
            onFinish: () => setLoading(false),
        });
    };

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 400 }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: 'var(--color-danger)' }}>Delete Product</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--color-slate-400)' }}>
                        Are you sure you want to delete <strong style={{ color: '#fff' }}>{product.name}</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                        {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Trash2 size={14} />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProductsIndex({ products, categories, filters }) {
    const [modal, setModal] = useState(null); // null | { type, product? }
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || '');
    const branchId = 1; // Will come from auth context in real app

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/products', { search, category_id: selectedCategory }, { preserveState: true, replace: true });
    };

    const pagData = products?.data || [];
    const meta = products?.meta || {};

    return (
        <AppLayout title="Products" subtitle="Manage your product catalog">
            <Head title="Products" />

            <div className="page-header">
                <div className="page-header-left">
                    <h2>Products</h2>
                    <p>Total {meta.total || 0} products in inventory</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a href="/products/export/csv" className="btn btn-secondary">
                        Export CSV
                    </a>
                    <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="input-group" style={{ flex: '1 1 240px' }}>
                            <label className="input-label">Search</label>
                            <div className="input-with-icon">
                                <Search size={16} className="input-icon" />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Name or SKU..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="input-group" style={{ flex: '1 1 180px' }}>
                            <label className="input-label">Category</label>
                            <select
                                className="input-field"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All categories</option>
                                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                        {(search || selectedCategory) && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => { setSearch(''); setSelectedCategory(''); router.get('/products'); }}
                            >
                                <X size={14} /> Clear
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Products Table */}
            <div className="card">
                <div className="table-wrap">
                    {pagData.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Cost</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagData.map(product => {
                                    const isLow = product.stock <= product.min_stock_level;
                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: 8,
                                                        background: 'rgba(217,119,6,.15)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--color-gold-400)', flexShrink: 0,
                                                        overflow: 'hidden',
                                                    }}>
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <Package size={16} />
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{product.name}</span>
                                                </div>
                                            </td>
                                            <td><code style={{ background: 'rgba(255,255,255,.06)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{product.sku}</code></td>
                                            <td style={{ color: 'var(--color-slate-400)' }}>{product.category?.name}</td>
                                            <td style={{ color: 'var(--color-gold-400)', fontWeight: 600 }}>${Number(product.price).toFixed(2)}</td>
                                            <td style={{ color: 'var(--color-slate-400)' }}>${Number(product.cost).toFixed(2)}</td>
                                            <td style={{ fontWeight: 600, color: isLow ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                                {product.stock}
                                            </td>
                                            <td>
                                                <span className={`badge ${product.stock === 0 ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                                                    {product.stock === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => setModal({ type: 'edit', product })}
                                                        title="Edit"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-icon btn-sm"
                                                        onClick={() => setModal({ type: 'delete', product })}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or add a new product.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="pagination">
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-btn ${meta.current_page === page ? 'active' : ''}`}
                                onClick={() => router.get('/products', { ...filters, page }, { preserveState: true })}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal?.type === 'create' && (
                <ProductModal categories={categories} branchId={branchId} onClose={() => setModal(null)} />
            )}
            {modal?.type === 'edit' && (
                <ProductModal product={modal.product} categories={categories} branchId={branchId} onClose={() => setModal(null)} />
            )}
            {modal?.type === 'delete' && (
                <DeleteConfirmModal product={modal.product} onClose={() => setModal(null)} />
            )}
        </AppLayout>
    );
}
