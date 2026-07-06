import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Truck } from 'lucide-react';

function SupplierModal({ supplier, branchId, onClose }) {
    const editing = !!supplier;
    const [form, setForm] = useState({
        name: supplier?.name || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        address: supplier?.address || '',
        branch_id: supplier?.branch_id || branchId,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const method = editing ? 'put' : 'post';
        const url = editing ? `/suppliers/${supplier.id}` : '/suppliers';
        router[method](url, form, {
            onError: (errs) => { setErrors(errs); setLoading(false); },
            onSuccess: () => onClose(),
        });
    };

    const field = (key, label, type = 'text', placeholder = '') => (
        <div className="input-group">
            <label className="input-label">{label}</label>
            <input type={type} className="input-field" value={form[key]} placeholder={placeholder}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={errors[key] ? { borderColor: 'var(--color-danger)' } : {}}
            />
            {errors[key] && <span style={{ color: 'var(--color-danger)', fontSize: 12 }}>{errors[key]}</span>}
        </div>
    );

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {field('name', 'Supplier Name', 'text', 'e.g. Acme Corp')}
                        <div className="form-grid-2">
                            {field('phone', 'Phone', 'tel')}
                            {field('email', 'Email', 'email')}
                        </div>
                        {field('address', 'Address')}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading && <span className="spinner" style={{ width: 16, height: 16 }} />}
                            {editing ? 'Save' : 'Add Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SuppliersIndex({ suppliers, filters }) {
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const branchId = 1;
    const pagData = suppliers?.data || [];
    const meta = suppliers?.meta || {};

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/suppliers', { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (s) => {
        if (!confirm(`Delete supplier "${s.name}"?`)) return;
        router.delete(`/suppliers/${s.id}`);
    };

    return (
        <AppLayout title="Suppliers" subtitle="Manage your supplier accounts">
            <Head title="Suppliers" />
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Suppliers</h2>
                    <p>{meta.total || 0} suppliers</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
                    <Plus size={16} /> Add Supplier
                </button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="input-group" style={{ flex: '1 1 260px' }}>
                            <label className="input-label">Search suppliers</label>
                            <div className="input-with-icon">
                                <Search size={16} className="input-icon" />
                                <input type="text" className="input-field" placeholder="Name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                        {search && <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); router.get('/suppliers'); }}><X size={14} /> Clear</button>}
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="table-wrap">
                    {pagData.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr><th>Supplier</th><th>Phone</th><th>Email</th><th>Balance</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {pagData.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)', flexShrink: 0 }}>
                                                    <Truck size={16} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--color-slate-400)' }}>{s.phone || '—'}</td>
                                        <td style={{ color: 'var(--color-slate-400)' }}>{s.email || '—'}</td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: Number(s.balance) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                                ${Number(s.balance || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal({ type: 'edit', supplier: s })}><Edit size={15} /></button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(s)}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state"><div className="empty-state-icon">🚚</div><h3>No suppliers found</h3></div>
                    )}
                </div>
                {meta.last_page > 1 && (
                    <div className="pagination">
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(pg => (
                            <button key={pg} className={`page-btn ${meta.current_page === pg ? 'active' : ''}`} onClick={() => router.get('/suppliers', { ...filters, page: pg }, { preserveState: true })}>{pg}</button>
                        ))}
                    </div>
                )}
            </div>

            {modal?.type === 'create' && <SupplierModal branchId={branchId} onClose={() => setModal(null)} />}
            {modal?.type === 'edit' && <SupplierModal supplier={modal.supplier} branchId={branchId} onClose={() => setModal(null)} />}
        </AppLayout>
    );
}
