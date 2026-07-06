import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, X, Building, CheckCircle2, XCircle } from 'lucide-react';

function BranchModal({ branch, onClose }) {
    const editing = !!branch;
    const [form, setForm] = useState({
        name: branch?.name || '',
        code: branch?.code || '',
        phone: branch?.phone || '',
        email: branch?.email || '',
        address: branch?.address || '',
        status: branch ? !!branch.status : true,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const method = editing ? 'put' : 'post';
        const url = editing ? `/branches/${branch.id}` : '/branches';
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
                    <h2 className="modal-title">{editing ? 'Edit Branch' : 'Add Branch'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-grid-2">
                            {field('name', 'Branch Name', 'text', 'e.g. West Coast branch')}
                            {field('code', 'Branch Code', 'text', 'e.g. WC-01')}
                        </div>
                        <div className="form-grid-2">
                            {field('phone', 'Phone', 'tel')}
                            {field('email', 'Email', 'email')}
                        </div>
                        {field('address', 'Address')}
                        
                        <div className="input-group" style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 }}>
                            <input 
                                type="checkbox" 
                                id="branch-status"
                                checked={form.status}
                                onChange={e => setForm({ ...form, status: e.target.checked })}
                                style={{ width: 18, height: 18, accentColor: 'var(--color-gold-500)' }}
                            />
                            <label htmlFor="branch-status" className="input-label" style={{ margin: 0, cursor: 'pointer' }}>Active Branch</label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading && <span className="spinner" style={{ width: 16, height: 16 }} />}
                            {editing ? 'Save Changes' : 'Add Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BranchesIndex({ branches }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (branch) => {
        if (!confirm(`Are you sure you want to delete branch "${branch.name}"?`)) return;
        router.delete(`/branches/${branch.id}`);
    };

    return (
        <AppLayout title="Branches" subtitle="Manage company offices and warehouses">
            <Head title="Branches" />
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Branches</h2>
                    <p>{branches?.length || 0} branches registered</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
                    <Plus size={16} /> Add Branch
                </button>
            </div>

            <div className="card">
                <div className="table-wrap">
                    {branches && branches.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr><th>Branch Info</th><th>Code</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {branches.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(212,163,89,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold-500)', flexShrink: 0 }}>
                                                    <Building size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>{b.address || 'No address'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500, color: 'var(--color-slate-300)' }}>
                                            <code>{b.code}</code>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>
                                                <div>{b.phone || '—'}</div>
                                                <div style={{ color: 'var(--color-slate-400)', fontSize: 12 }}>{b.email || '—'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${b.status ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {b.status ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {b.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal({ type: 'edit', branch: b })}><Edit size={15} /></button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b)}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🏢</div>
                            <h3>No branches found</h3>
                        </div>
                    )}
                </div>
            </div>

            {modal?.type === 'create' && <BranchModal onClose={() => setModal(null)} />}
            {modal?.type === 'edit' && <BranchModal branch={modal.branch} onClose={() => setModal(null)} />}
        </AppLayout>
    );
}
