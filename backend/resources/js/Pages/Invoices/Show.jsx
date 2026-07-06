import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, User, Truck, Hash } from 'lucide-react';

const TYPE_BADGE = { sale: 'badge-success', purchase: 'badge-info', return: 'badge-warning', waste: 'badge-danger' };
const STATUS_BADGE = { paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger' };

export default function InvoiceShow({ invoice }) {
    const inv = invoice?.data || invoice || {};

    return (
        <AppLayout title={`Invoice ${inv.invoice_number}`} subtitle="Invoice details and line items">
            <Head title={`Invoice ${inv.invoice_number}`} />

            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/invoices" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
                    <div className="page-header-left">
                        <h2 style={{ fontFamily: 'monospace' }}>{inv.invoice_number}</h2>
                        <p>
                            <span className={`badge ${TYPE_BADGE[inv.type]}`} style={{ textTransform: 'capitalize', marginRight: 8 }}>{inv.type}</span>
                            <span className={`badge ${STATUS_BADGE[inv.status]}`} style={{ textTransform: 'capitalize' }}>{inv.status}</span>
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a
                        href={`/invoices/${inv.id}/pdf`}
                        className="btn btn-secondary"
                        style={{ gap: 8 }}
                        download
                    >
                        <FileText size={16} />
                        Download PDF
                    </a>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-header"><div className="card-title">Line Items</div></div>
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(inv.items || []).map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{item.product?.name}</td>
                                            <td><code style={{ background: 'rgba(255,255,255,.06)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{item.product?.sku}</code></td>
                                            <td>{item.quantity}</td>
                                            <td>${Number(item.unit_price).toFixed(2)}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--color-gold-400)' }}>${Number(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Party info */}
                    <div className="card">
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {inv.customer && (
                                <div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                        <User size={14} style={{ color: 'var(--color-slate-400)' }} />
                                        <span className="input-label">Customer</span>
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{inv.customer.name}</div>
                                    <div style={{ color: 'var(--color-slate-500)', fontSize: 13 }}>{inv.customer.email}</div>
                                </div>
                            )}
                            {inv.supplier && (
                                <div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                        <Truck size={14} style={{ color: 'var(--color-slate-400)' }} />
                                        <span className="input-label">Supplier</span>
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{inv.supplier.name}</div>
                                </div>
                            )}
                            <div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                    <Hash size={14} style={{ color: 'var(--color-slate-400)' }} />
                                    <span className="input-label">Payment Method</span>
                                </div>
                                <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{inv.payment_method || '—'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="card">
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Subtotal', value: `$${Number(inv.subtotal || 0).toFixed(2)}` },
                                { label: 'Discount', value: `-$${Number(inv.discount || 0).toFixed(2)}`, color: 'var(--color-success)' },
                                { label: 'Tax', value: `$${Number(inv.tax || 0).toFixed(2)}` },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                    <span style={{ color: 'var(--color-slate-400)' }}>{row.label}</span>
                                    <span style={{ fontWeight: 500, color: row.color || 'var(--color-slate-200)' }}>{row.value}</span>
                                </div>
                            ))}
                            <hr className="divider" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Total</span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gold-400)' }}>
                                    ${Number(inv.total || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ color: 'var(--color-slate-500)', fontSize: 12, textAlign: 'center' }}>
                        Created {inv.created_at ? new Date(inv.created_at).toLocaleString() : '—'}<br />
                        by {inv.user?.name || '—'}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    [style*="grid-template-columns: 1fr 300px"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AppLayout>
    );
}
