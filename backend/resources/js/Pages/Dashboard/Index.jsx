import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import AIInsightsPanel from '@/Components/AIInsightsPanel';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    TrendingUp, ShoppingCart, Package, AlertTriangle,
    ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

const PIE_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--color-navy-950)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
        }}>
            <p style={{ color: 'var(--color-slate-400)', marginBottom: 6 }}>{label}</p>
            {payload.map((entry) => (
                <p key={entry.name} style={{ color: entry.color, fontWeight: 600 }}>
                    {entry.name}: {typeof entry.value === 'number' ? `$${entry.value.toLocaleString()}` : entry.value}
                </p>
            ))}
        </div>
    );
};

function KpiCard({ icon: Icon, label, value, trend, trendUp, colorClass }) {
    return (
        <div className="kpi-card">
            <div className={`kpi-icon-wrap ${colorClass}`}>
                <Icon size={22} />
            </div>
            <div>
                <div className="kpi-label">{label}</div>
                <div className="kpi-value">{value}</div>
                {trend && (
                    <div className={`kpi-trend ${trendUp ? 'up' : 'down'}`}>
                        {trendUp ? <ArrowUpRight size={13} style={{ display: 'inline' }} /> : <ArrowDownRight size={13} style={{ display: 'inline' }} />}
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardIndex({ stats = {} }) {
    const { kpis = {}, annual_profits = [], inventory_distribution = [], top_products = [], low_stock_alerts = [] } = stats;

    const formatCurrency = (val) => `$${(val || 0).toLocaleString()}`;

    return (
        <AppLayout title="Dashboard" subtitle="Overview of your business performance">
            <Head title="Dashboard" />

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KpiCard
                    icon={TrendingUp}
                    label="Sales This Month"
                    value={formatCurrency(kpis.sales_this_month)}
                    trend="vs last month"
                    trendUp
                    colorClass="gold"
                />
                <KpiCard
                    icon={ShoppingCart}
                    label="Purchases This Month"
                    value={formatCurrency(kpis.purchases_this_month)}
                    trend="vs last month"
                    trendUp={false}
                    colorClass="blue"
                />
                <KpiCard
                    icon={Package}
                    label="Total Products"
                    value={(kpis.total_products || 0).toLocaleString()}
                    colorClass="green"
                />
                <KpiCard
                    icon={AlertTriangle}
                    label="Low Stock Alerts"
                    value={kpis.low_stock_count || 0}
                    trend={kpis.low_stock_count > 0 ? 'Needs attention' : 'All OK'}
                    trendUp={false}
                    colorClass="red"
                />
            </div>

            {/* AI Business Insights Panel */}
            <AIInsightsPanel />

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Annual Profit Area Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Annual Revenue & Profit</div>
                            <div className="card-subtitle">Monthly breakdown for current year</div>
                        </div>
                    </div>
                    <div className="card-body">
                        {annual_profits.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={annual_profits} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="sales" name="Sales" stroke="#d97706" strokeWidth={2} fill="url(#salesGrad)" />
                                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#profitGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                <p>No sales data available yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inventory Distribution Donut */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Inventory Distribution</div>
                            <div className="card-subtitle">Stock value by category</div>
                        </div>
                    </div>
                    <div className="card-body">
                        {inventory_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={inventory_distribution}
                                        dataKey="stock_value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                    >
                                        {inventory_distribution.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: 'var(--color-navy-950)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }} />
                                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                <p>No category data yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div data-dashboard-bottom style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Top Products Table */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Top Selling Products</div>
                            <div className="card-subtitle">By quantity sold this year</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: '12px 0 0' }}>
                        {top_products.length > 0 ? (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>Qty Sold</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {top_products.map((p, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <span style={{
                                                        background: i < 3 ? 'rgba(217,119,6,.2)' : 'rgba(100,116,139,.15)',
                                                        color: i < 3 ? 'var(--color-gold-400)' : 'var(--color-slate-400)',
                                                        borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700,
                                                    }}>#{i + 1}</span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--color-slate-500)' }}>{p.sku}</div>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{p.sold_qty.toLocaleString()}</td>
                                                <td style={{ color: 'var(--color-gold-400)', fontWeight: 600 }}>${p.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                <p>No sales data available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">⚠ Low Stock Alerts</div>
                            <div className="card-subtitle">Items requiring immediate attention</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: '12px 0 0' }}>
                        {low_stock_alerts.length > 0 ? (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Stock</th>
                                            <th>Min</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {low_stock_alerts.map((item, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--color-slate-500)' }}>{item.category}</div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        color: item.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)',
                                                    }}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--color-slate-400)' }}>{item.min_stock_level}</td>
                                                <td>
                                                    <span className={`badge ${item.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                                        {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                <div style={{ fontSize: 32 }}>✅</div>
                                <h3>All stock levels are healthy</h3>
                                <p>No products are below minimum stock levels.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
