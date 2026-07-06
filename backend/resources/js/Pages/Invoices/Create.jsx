import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Plus, Trash2, ArrowLeft, Calculator } from 'lucide-react';

export default function InvoicesCreate({ customers, suppliers, products }) {
    const [form, setForm] = useState({
        type: 'sale',
        branch_id: 1,
        customer_id: '',
        supplier_id: '',
        status: 'paid',
        payment_method: 'cash',
        discount: 0,
        tax_rate: 0.15,
        notes: '',
        items: [],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const addItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, { product_id: '', quantity: 1, unit_price: 0 }],
        }));
    };

    const removeItem = (idx) => {
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };

    const updateItem = (idx, key, value) => {
        setForm(f => {
            const items = [...f.items];
            items[idx] = { ...items[idx], [key]: value };

            // Auto-fill price from product catalog
            if (key === 'product_id') {
                const prod = products.find(p => String(p.id) === String(value));
                if (prod) items[idx].unit_price = prod.price;
            }
            return { ...f, items };
        });
    };

    // Calculations
    const subtotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unit_price)), 0);
    const discountAmt = Number(form.discount) || 0;
    const taxAmt = (subtotal - discountAmt) * Number(form.tax_rate);
    const total = subtotal - discountAmt + taxAmt;

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post('/invoices', form, {
            onError: (errs) => { setErrors(errs); setLoading(false); },
            onSuccess: () => { },
        });
    };

    const isSale = form.type === 'sale' || form.type === 'return';
    const isPurchase = form.type === 'purchase';

    return (
        <AppLayout title="New Invoice" subtitle="Create a sale, purchase, return, or waste record">
            <Head title="New Invoice" />

            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/invoices" className="btn btn-ghost btn-icon">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="page-header-left">
                        <h2>Create Invoice</h2>
                        <p>Fill in the details below</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
                    {/* Left Column: Main Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Invoice Type & Details */}
                        <div className="card">
                            <div className="card-header"><div className="card-title">Invoice Details</div></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="form-grid-2">
                                    <div className="input-group">
                                        <label className="input-label">Type *</label>
                                        <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                            <option value="sale">Sale</option>
                                            <option value="purchase">Purchase</option>
                                            <option value="return">Return</option>
                                            <option value="waste">Waste</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Status *</label>
                                        <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                            <option value="paid">Paid</option>
                                            <option value="partial">Partial</option>
                                            <option value="unpaid">Unpaid</option>
                                        </select>
                                    </div>
                                </div>

                                {(isSale) && (
                                    <div className="input-group">
                                        <label className="input-label">Customer</label>
                                        <select className="input-field" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                                            <option value="">Select customer (optional)...</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {(isPurchase) && (
                                    <div className="input-group">
                                        <label className="input-label">Supplier</label>
                                        <select className="input-field" value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
                                            <option value="">Select supplier (optional)...</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="form-grid-2">
                                    <div className="input-group">
                                        <label className="input-label">Payment Method</label>
                                        <select className="input-field" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="credit">Credit (deferred)</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Discount ($)</label>
                                        <input type="number" className="input-field" min="0" step="0.01" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Notes</label>
                                    <textarea className="input-field" rows={2} style={{ resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Line Items</div>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                                    <Plus size={14} /> Add Item
                                </button>
                            </div>
                            <div className="card-body">
                                {errors.items && <div className="flash flash-error" style={{ marginBottom: 12 }}>{errors.items}</div>}

                                {form.items.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-slate-500)' }}>
                                        No items yet. Click "Add Item" to start.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {/* Header */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 100px 40px', gap: 8, padding: '0 4px' }}>
                                            <span className="input-label">Product</span>
                                            <span className="input-label">Qty</span>
                                            <span className="input-label">Unit Price</span>
                                            <span className="input-label">Total</span>
                                            <span />
                                        </div>

                                        {form.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 100px 40px', gap: 8, alignItems: 'center' }}>
                                                <select
                                                    className="input-field"
                                                    value={item.product_id}
                                                    onChange={e => updateItem(idx, 'product_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select product...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} (Stock: {p.stock})
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number" min="1" className="input-field"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                />
                                                <input
                                                    type="number" min="0" step="0.01" className="input-field"
                                                    value={item.unit_price}
                                                    onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                                                />
                                                <div style={{ fontWeight: 600, color: 'var(--color-gold-400)', padding: '0 4px' }}>
                                                    ${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                                                </div>
                                                <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(idx)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calculator size={18} style={{ color: 'var(--color-gold-400)' }} />
                                    <div className="card-title">Summary</div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
                                        { label: 'Discount', value: `-$${discountAmt.toFixed(2)}`, color: 'var(--color-success)' },
                                        { label: `Tax (${(Number(form.tax_rate) * 100).toFixed(0)}%)`, value: `$${taxAmt.toFixed(2)}` },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                            <span style={{ color: 'var(--color-slate-400)' }}>{row.label}</span>
                                            <span style={{ fontWeight: 500, color: row.color || 'var(--color-slate-200)' }}>{row.value}</span>
                                        </div>
                                    ))}
                                    <hr className="divider" />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Total</span>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gold-400)' }}>
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || form.items.length === 0}>
                                        {loading && <span className="spinner" style={{ width: 16, height: 16 }} />}
                                        Create Invoice
                                    </button>
                                    <Link href="/invoices" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                                        Cancel
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tax rate input */}
                        <div className="card">
                            <div className="card-body">
                                <div className="input-group">
                                    <label className="input-label">Tax Rate (%)</label>
                                    <input
                                        type="number" min="0" max="100" step="1"
                                        className="input-field"
                                        value={Number(form.tax_rate) * 100}
                                        onChange={e => setForm({ ...form, tax_rate: Number(e.target.value) / 100 })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responsive overrides */}
                <style>{`
                    @media (max-width: 768px) {
                        form > div[style*="grid-template-columns: 1fr 340px"] {
                            grid-template-columns: 1fr !important;
                        }
                        form > div > div:last-child {
                            position: static !important;
                        }
                        [style*="gridTemplateColumns: '2fr 100px 120px 100px 40px'"] {
                            grid-template-columns: 1fr 60px 80px 70px 36px !important;
                        }
                    }
                `}</style>
            </form>
        </AppLayout>
    );
}
