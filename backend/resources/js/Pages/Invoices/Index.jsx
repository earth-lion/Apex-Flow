import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Plus, Search, Eye, Trash2, X, FileText } from 'lucide-react';

const TYPE_BADGE = {
    sale: 'badge-success',
    purchase: 'badge-info',
    return: 'badge-warning',
    waste: 'badge-danger',
};

const STATUS_BADGE = {
    paid: 'badge-success',
    partial: 'badge-warning',
    unpaid: 'badge-danger',
};

export default function InvoicesIndex({ invoices, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || '');
    const [status, setStatus] = useState(filters?.status || '');
    const pagData = invoices?.data || [];
    const meta = invoices?.meta || {};

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/invoices', { search, type, status }, { preserveState: true, replace: true });
    };

    const handleDelete = (inv) => {
        if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
        router.delete(`/invoices/${inv.id}`);
    };

    return (
        <AppLayout title="Invoices" subtitle="All transactions and billing records">
            <Head title="Invoices" />

            <div className="page-header">
                <div className="page-header-left">
                    <h2>Invoices</h2>
                    <p>{meta.total || 0} total invoices</p>
                </div>
                <Link href="/invoices/create" className="btn btn-primary">
                    <Plus size={16} /> New Invoice
                </Link>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="input-group" style={{ flex: '1 1 200px' }}>
                            <label className="input-label">Search</label>
                            <div className="input-with-icon">
                                <Search size={16} className="input-icon" />
                                <input type="text" className="input-field" placeholder="Invoice #..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="input-group" style={{ flex: '1 1 150px' }}>
                            <label className="input-label">Type</label>
                            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                                <option value="">All types</option>
                                <option value="sale">Sale</option>
                                <option value="purchase">Purchase</option>
                                <option value="return">Return</option>
                                <option value="waste">Waste</option>
                            </select>
                        </div>
                        <div className="input-group" style={{ flex: '1 1 150px' }}>
                            <label className="input-label">Status</label>
                            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Filter</button>
                        {(search || type || status) && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setType(''); setStatus(''); router.get('/invoices'); }}>
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
                                    <th>Invoice #</th>
                                    <th>Type</th>
                                    <th>Customer / Supplier</th>
                                    <th>Created By</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagData.map(inv => (
                                    <tr key={inv.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <FileText size={16} style={{ color: 'var(--color-slate-500)' }} />
                                                <span style={{ fontWeight: 600, color: 'var(--color-gold-400)', fontFamily: 'monospace' }}>
                                                    {inv.invoice_number}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${TYPE_BADGE[inv.type] || 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                                                {inv.type}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-slate-400)' }}>
                                            {inv.customer?.name || inv.supplier?.name || '—'}
                                        </td>
                                        <td style={{ color: 'var(--color-slate-400)' }}>{inv.user?.name || '—'}</td>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>${Number(inv.total).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${STATUS_BADGE[inv.status] || 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-slate-500)', fontSize: 13 }}>
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link href={`/invoices/${inv.id}`} className="btn btn-ghost btn-icon btn-sm" title="View">
                                                    <Eye size={15} />
                                                </Link>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(inv)} title="Delete">
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
                            <div className="empty-state-icon">🧾</div>
                            <h3>No invoices found</h3>
                            <p>Create your first invoice to get started.</p>
                        </div>
                    )}
                </div>
                {meta.last_page > 1 && (
                    <div className="pagination">
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(pg => (
                            <button
                                key={pg}
                                className={`page-btn ${meta.current_page === pg ? 'active' : ''}`}
                                onClick={() => router.get('/invoices', { ...filters, page: pg }, { preserveState: true })}
                            >
                                {pg}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
