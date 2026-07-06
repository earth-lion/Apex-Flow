import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, X, Users } from 'lucide-react';

function CustomerModal({ customer, branchId, onClose }) {
    const editing = !!customer;
    const [form, setForm] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
        branch_id: customer?.branch_id || branchId,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const method = editing ? 'put' : 'post';
        const url = editing ? `/customers/${customer.id}` : '/customers';
        router[method](url, form, {
            onError: (errs) => { setErrors(errs); setLoading(false); },
            onSuccess: () => onClose(),
        });
    };

    const field = (key, label, type = 'text', placeholder = '') => (
        <div className="input-group">
            <label className="input-label">{label}</label>
            <input
                type={type}
                className="input-field"
                value={form[key]}
                placeholder={placeholder}
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
                    <h2 className="modal-title">{editing ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {field('name', 'Full Name', 'text', 'e.g. John Smith')}
                        <div className="form-grid-2">
                            {field('phone', 'Phone', 'tel', '+1 234 567 890')}
                            {field('email', 'Email', 'email', 'john@example.com')}
                        </div>
                        {field('address', 'Address', 'text', '123 Main St, City')}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading && <span className="spinner" style={{ width: 16, height: 16 }} />}
                            {editing ? 'Save Changes' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CustomersIndex({ customers, filters }) {
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const branchId = 1;
    const pagData = customers?.data || [];
    const meta = customers?.meta || {};

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customers', { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (customer) => {
        if (!confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
        router.delete(`/customers/${customer.id}`);
    };

    return (
        <AppLayout title="Customers" subtitle="Manage your customer accounts">
            <Head title="Customers" />

            <div className="page-header">
                <div className="page-header-left">
                    <h2>Customers</h2>
                    <p>{meta.total || 0} customers registered</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
                    <Plus size={16} /> Add Customer
                </button>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="input-group" style={{ flex: '1 1 260px' }}>
                            <label className="input-label">Search customers</label>
                            <div className="input-with-icon">
                                <Search size={16} className="input-icon" />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Name or phone..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                        {search && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); router.get('/customers'); }}>
                                <X size={14} /> Clear
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-wrap">
                    {pagData.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Balance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagData.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--color-navy-700), var(--color-gold-600))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0,
                                                }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{c.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--color-slate-400)' }}>{c.phone || '—'}</td>
                                        <td style={{ color: 'var(--color-slate-400)' }}>{c.email || '—'}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: Number(c.balance) > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                                            }}>
                                                ${Number(c.balance || 0).toFixed(2)}
                                            </span>
                                            {Number(c.balance) > 0 && (
                                                <span className="badge badge-warning" style={{ marginLeft: 6 }}>Owes</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal({ type: 'edit', customer: c })} title="Edit">
                                                    <Edit size={15} />
                                                </button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(c)} title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <h3>No customers found</h3>
                            <p>Add your first customer to get started.</p>
                        </div>
                    )}
                </div>
                {meta.last_page > 1 && (
                    <div className="pagination">
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(pg => (
                            <button
                                key={pg}
                                className={`page-btn ${meta.current_page === pg ? 'active' : ''}`}
                                onClick={() => router.get('/customers', { ...filters, page: pg }, { preserveState: true })}
                            >
                                {pg}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {modal?.type === 'create' && <CustomerModal branchId={branchId} onClose={() => setModal(null)} />}
            {modal?.type === 'edit' && <CustomerModal customer={modal.customer} branchId={branchId} onClose={() => setModal(null)} />}
        </AppLayout>
    );
}
