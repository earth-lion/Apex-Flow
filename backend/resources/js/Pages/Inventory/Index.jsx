import AppLayout from '@/Layouts/AppLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Search, AlertTriangle, Package } from 'lucide-react';
import { useState } from 'react';

const TYPE_BADGE = { purchase: 'badge-info', sale: 'badge-success', return: 'badge-warning', waste: 'badge-danger' };

export default function InventoryIndex({ transactions, lowStockProducts, filters }) {
    const [type, setType] = useState(filters?.type || '');
    const txData = transactions?.data || [];
    const meta = transactions?.meta || {};

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/inventory', { type }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Inventory" subtitle="Stock movements and low-stock alerts">
            <Head title="Inventory" />

            <div className="page-header">
                <div className="page-header-left">
                    <h2>Inventory</h2>
                    <p>Track all stock movements and alerts</p>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts?.length > 0 && (
                <div className="card" style={{ marginBottom: 16, border: '1px solid rgba(245,158,11,.3)' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                            <div className="card-title" style={{ color: 'var(--color-warning)' }}>
                                {lowStockProducts.length} Low Stock Item{lowStockProducts.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: '12px 0 0' }}>
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Current Stock</th>
                                        <th>Min Level</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Package size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--color-slate-500)' }}>{p.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--color-slate-400)' }}>{p.category?.name}</td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-slate-400)' }}>{p.min_stock_level}</td>
                                            <td>
                                                <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                                    {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Filter */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: '14px 20px' }}>
                    <form onSubmit={handleFilter} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="input-group" style={{ flex: '1 1 180px' }}>
                            <label className="input-label">Filter by Type</label>
                            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                                <option value="">All movements</option>
                                <option value="purchase">Purchase (In)</option>
                                <option value="sale">Sale (Out)</option>
                                <option value="return">Return</option>
                                <option value="waste">Waste</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Apply</button>
                    </form>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Stock Movements</div>
                    <div className="card-subtitle">{meta.total || 0} total transactions</div>
                </div>
                <div className="table-wrap">
                    {txData.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Invoice</th>
                                    <th>By</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {txData.map(tx => (
                                    <tr key={tx.id}>
                                        <td style={{ fontWeight: 500 }}>{tx.product?.name}</td>
                                        <td>
                                            <span className={`badge ${TYPE_BADGE[tx.type] || 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: tx.quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                            }}>
                                                {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                            </span>
                                        </td>
                                        <td>
                                            {tx.invoice_id ? (
                                                <Link
                                                    href={`/invoices/${tx.invoice_id}`}
                                                    style={{ color: 'var(--color-gold-400)', fontSize: 12 }}
                                                >
                                                    #{tx.invoice_id}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td style={{ color: 'var(--color-slate-400)', fontSize: 13 }}>{tx.user?.name || '—'}</td>
                                        <td style={{ color: 'var(--color-slate-500)', fontSize: 13 }}>
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No transactions found</h3>
                            <p>Inventory movements will appear here after creating invoices.</p>
                        </div>
                    )}
                </div>
                {meta.last_page > 1 && (
                    <div className="pagination">
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(pg => (
                            <button
                                key={pg}
                                className={`page-btn ${meta.current_page === pg ? 'active' : ''}`}
                                onClick={() => router.get('/inventory', { ...filters, page: pg }, { preserveState: true })}
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
