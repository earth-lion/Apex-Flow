import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Cell,
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingBag,
    BarChart2, Download, Filter, Calendar,
} from 'lucide-react';

const COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

function SummaryCard({ icon: Icon, label, value, sub, color = 'gold' }) {
    const colors = {
        gold:  { bg: 'rgba(217,119,6,.15)',   fg: '#fbbf24' },
        green: { bg: 'rgba(16,185,129,.15)',  fg: '#10b981' },
        red:   { bg: 'rgba(239,68,68,.15)',   fg: '#ef4444' },
        blue:  { bg: 'rgba(59,130,246,.15)',  fg: '#3b82f6' },
    };
    const c = colors[color];
    return (
        <div style={{
            background: 'var(--color-navy-800)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 14, padding: '20px 24px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,.25)',
        }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} />
            </div>
            <div>
                <div style={{ fontSize: 12, color: 'var(--color-slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: 4 }}>{value}</div>
                {sub && <div style={{ fontSize: 12, color: c.fg, marginTop: 4 }}>{sub}</div>}
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
            <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>
            {payload.map(e => (
                <p key={e.name} style={{ color: e.color, fontWeight: 600 }}>
                    {e.name}: ${Number(e.value).toLocaleString()}
                </p>
            ))}
        </div>
    );
};

export default function ReportsIndex({ summary = {}, daily_sales = [], top_products = [], top_customers = [], invoices = [], filters = {} }) {
    const [from, setFrom]   = useState(filters.from || '');
    const [to, setTo]       = useState(filters.to || '');
    const [type, setType]   = useState(filters.type || 'all');

    const fmt = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const applyFilter = (e) => {
        e.preventDefault();
        router.get('/reports', { from, to, type }, { preserveState: true, replace: true });
    };

    // CSV export — uses the props data passed from server
    const exportCsv = () => {
        const rows = [
            ['Date', 'Type', 'Invoice', 'Customer/Supplier', 'Total'],
            ...invoices.map(inv => [
                new Date(inv.created_at).toLocaleDateString(),
                inv.type,
                inv.invoice_number || '',
                inv.customer?.name || inv.supplier?.name || '—',
                Number(inv.total || 0).toFixed(2),
            ]),
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `report-${from || 'all'}-to-${to || 'all'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const profitColor = summary.gross_profit >= 0 ? '#10b981' : '#ef4444';

    return (
        <AppLayout title="Reports" subtitle="Financial analysis & performance metrics">
            <Head title="Reports" />

            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h2>Reports & Analytics</h2>
                    <p>Detailed financial breakdown for the selected period</p>
                </div>
                <button className="btn btn-secondary" onClick={exportCsv} style={{ gap: 6 }}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Date Filter */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                    <form onSubmit={applyFilter} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="input-group" style={{ flex: '1 1 180px' }}>
                            <label className="input-label">From Date</label>
                            <input type="date" className="input-field" value={from} onChange={e => setFrom(e.target.value)} />
                        </div>
                        <div className="input-group" style={{ flex: '1 1 180px' }}>
                            <label className="input-label">To Date</label>
                            <input type="date" className="input-field" value={to} onChange={e => setTo(e.target.value)} />
                        </div>
                        <div className="input-group" style={{ flex: '1 1 160px' }}>
                            <label className="input-label">Type</label>
                            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                                <option value="all">All Transactions</option>
                                <option value="sale">Sales Only</option>
                                <option value="purchase">Purchases Only</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Filter size={14} /> Apply Filter
                        </button>
                    </form>
                </div>
            </div>

            {/* KPI Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
                <SummaryCard icon={TrendingUp}   label="Total Sales"     value={fmt(summary.total_sales)}     color="gold" />
                <SummaryCard icon={ShoppingBag}  label="Total Purchases" value={fmt(summary.total_purchases)} color="blue" />
                <SummaryCard icon={DollarSign}   label="Gross Profit"    value={fmt(summary.gross_profit)}    color={summary.gross_profit >= 0 ? 'green' : 'red'}
                    sub={`Margin: ${summary.profit_margin}%`} />
                <SummaryCard icon={BarChart2}    label="Cost of Goods"   value={fmt(summary.cogs)}            color="red" />
            </div>

            {/* Daily Sales Chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Daily Sales Trend</div>
                        <div className="card-subtitle">Revenue per day in selected period</div>
                    </div>
                </div>
                <div className="card-body">
                    {daily_sales.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={daily_sales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="dsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#d97706" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" name="Revenue" stroke="#d97706" strokeWidth={2} fill="url(#dsGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: '30px 0' }}>
                            <p>No sales data for the selected period.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products + Top Customers */}
            <div data-reports-grid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

                {/* Top Products */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Top Products</div>
                    </div>
                    <div className="card-body" style={{ padding: '12px 0 0' }}>
                        {top_products.length > 0 ? (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead><tr><th>#</th><th>Product</th><th>Sold</th><th>Revenue</th></tr></thead>
                                    <tbody>
                                        {top_products.map((p, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <span style={{ background: i < 3 ? 'rgba(217,119,6,.2)' : 'rgba(100,116,139,.15)', color: i < 3 ? '#fbbf24' : '#94a3b8', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
                                                        #{i + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                    <div style={{ fontSize: 11, color: '#64748b' }}>{p.sku}</div>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{Number(p.sold_qty).toLocaleString()}</td>
                                                <td style={{ color: '#fbbf24', fontWeight: 600 }}>${Number(p.revenue).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '30px 0' }}><p>No data.</p></div>
                        )}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Top Customers</div>
                    </div>
                    <div className="card-body" style={{ padding: '12px 0 0' }}>
                        {top_customers.length > 0 ? (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead><tr><th>#</th><th>Customer</th><th>Orders</th><th>Spent</th></tr></thead>
                                    <tbody>
                                        {top_customers.map((c, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <span style={{ background: i < 3 ? 'rgba(59,130,246,.2)' : 'rgba(100,116,139,.15)', color: i < 3 ? '#60a5fa' : '#94a3b8', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
                                                        #{i + 1}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{c.customer?.name ?? '—'}</td>
                                                <td>{c.invoice_count}</td>
                                                <td style={{ color: '#fbbf24', fontWeight: 600 }}>${Number(c.total_spent).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '30px 0' }}><p>No data.</p></div>
                        )}
                    </div>
                </div>

            </div>

        </AppLayout>
    );
}
