import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Truck,
    TrendingUp, BarChart3, FileText, Settings, LogOut,
    Menu, X, Bell, ChevronDown, User, Search,
    AlertTriangle, ShieldAlert, Tag, Sparkles, Send, Bot, Clock
} from 'lucide-react';
import CommandPalette from '@/Components/CommandPalette';

const navItems = [
    {
        section: 'Core',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, route: 'dashboard', permission: 'view-dashboard' },
            { label: 'Reports', href: '/reports', icon: TrendingUp, route: 'reports.index', permission: 'view-reports' },
            { label: 'Inventory', href: '/inventory', icon: Package, route: 'inventory.index', permission: 'manage-inventory' },
        ],
    },
    {
        section: 'Commerce',
        items: [
            { label: 'Invoices', href: '/invoices', icon: FileText, route: 'invoices.index', permission: 'manage-invoices' },
            { label: 'Cashier Shifts', href: '/shifts', icon: Clock, route: 'shifts.index', permission: 'view-dashboard' },
            { label: 'Products', href: '/products', icon: ShoppingCart, route: 'products.index', permission: 'manage-products' },
            { label: 'Categories', href: '/categories', icon: Tag, route: 'categories.index', permission: 'manage-products' },
            { label: 'Customers', href: '/customers', icon: Users, route: 'customers.index', permission: 'manage-customers' },
            { label: 'Suppliers', href: '/suppliers', icon: Truck, route: 'suppliers.index', permission: 'manage-suppliers' },
        ],
    },
    {
        section: 'Settings',
        items: [
            { label: 'Branches', href: '/branches', icon: Settings, route: 'branches.index', permission: 'manage-branches' },
            { label: 'Audit Trail', href: '/activity-logs', icon: BarChart3, route: 'activity-logs.index', role: 'admin' },
        ],
    },
];

export default function AppLayout({ children, title, subtitle }) {
    const { auth = {}, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    
    // AI Business Copilot State
    const [aiOpen, setAiOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState([
        { role: 'bot', text: 'مرحباً بك في ApexFlow! أنا مساعد الأعمال الذكي الخاص بك. يمكنك الاستفسار عن مبيعات هذا الشهر، حالة المنتجات في المخزون، أو الفواتير غير المدفوعة.' }
    ]);
    const [aiLoading, setAiLoading] = useState(false);

    const handleSendAiMessage = (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        const userMsg = aiInput.trim();
        setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setAiInput('');
        setAiLoading(true);

        axios.post('/ai/chat', { message: userMsg })
            .then(res => {
                setAiMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
            })
            .catch(err => {
                console.error(err);
                setAiMessages(prev => [...prev, { role: 'bot', text: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.' }]);
            })
            .finally(() => {
                setAiLoading(false);
            });
    };

    const userPermissions = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || [];

    const hasAccess = (item) => {
        if (!item.permission && !item.role) return true;
        if (item.role && !userRoles.includes(item.role)) return false;
        if (item.permission && !userPermissions.includes(item.permission)) return false;
        return true;
    };

    useEffect(() => {
        axios.get('/notifications')
            .then(res => setNotifications(res.data?.alerts || []))
            .catch(err => console.error('Notifications error:', err));
    }, []);

    // Close sidebar on outside click (mobile)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isActive = (routeName) => {
        try { return route().current(routeName); } catch { return false; }
    };

    const handleBranchSwitch = (e) => {
        const branchId = e.target.value;
        if (!branchId) return;
        router.post('/branches/switch', { branch_id: branchId });
    };

    return (
        <div className="app-shell">
            {/* Command Palette */}
            <CommandPalette />

            {/* Sidebar Overlay (mobile) */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">AF</div>
                    <div className="sidebar-logo-text">
                        <h1>ApexFlow</h1>
                        <span>ERP System</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((section) => {
                        const visibleItems = section.items.filter(hasAccess);
                        if (visibleItems.length === 0) return null;
                        return (
                            <div key={section.section}>
                                <div className="nav-section-label">{section.section}</div>
                                {visibleItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className="nav-item-icon" size={20} />
                                        <span className="nav-item-text">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="nav-item"
                        style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <LogOut size={20} className="nav-item-icon" />
                        <span className="nav-item-text">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content" style={{ marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-left">
                        {/* Mobile hamburger — shown via CSS class on ≤768px */}
                        <button
                            className="btn btn-ghost btn-icon mobile-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                            title="Open navigation"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Desktop collapse */}
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title="Toggle sidebar"
                        >
                            <Menu size={20} />
                        </button>

                        <div>
                            <div className="topbar-title">{title || 'Dashboard'}</div>
                            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
                        </div>
                    </div>

                    <div className="topbar-right">
                        {/* Global Search shortcut hint */}
                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ gap: 6, fontSize: 12, padding: '6px 12px', background: 'rgba(255,255,255,.05)' }}
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
                            title="Search command palette"
                        >
                            <Search size={14} />
                            <span>Ctrl+K</span>
                        </button>

                        {/* Active Branch Switcher dropdown */}
                        {auth?.branches?.length > 1 && (
                            <select
                                className="input-field"
                                style={{ width: 160, padding: '6px 10px', fontSize: 13, height: 34, background: 'rgba(255,255,255,.07)', borderColor: 'rgba(255,255,255,.1)' }}
                                value={auth?.user?.branch_id || ''}
                                onChange={handleBranchSwitch}
                            >
                                {auth.branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Notifications dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={() => setNotifOpen(!notifOpen)}
                                title="Notifications"
                                style={{ position: 'relative' }}
                            >
                                <Bell size={18} />
                                {notifications.length > 0 && (
                                    <span style={{
                                        position: 'absolute', top: 2, right: 2,
                                        background: 'var(--color-danger)', color: '#fff',
                                        fontSize: 9, fontWeight: 700, borderRadius: '50%',
                                        width: 14, height: 14, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    background: 'var(--color-navy-800)',
                                    border: '1px solid rgba(255,255,255,.1)',
                                    borderRadius: 'var(--radius-md)',
                                    width: 300, zIndex: 200,
                                    boxShadow: '0 10px 40px rgba(0,0,0,.5)',
                                    padding: '12px 0 6px',
                                    animation: 'scaleIn .2s ease',
                                }}>
                                    <div style={{ padding: '0 16px 8px', fontSize: 13, fontWeight: 600, color: '#fff', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Notifications</span>
                                        <span style={{ color: 'var(--color-gold-400)' }}>{notifications.length} Alerts</span>
                                    </div>
                                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--color-slate-400)' }}>
                                                All stock levels are healthy!
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 12 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, color: '#fff' }}>
                                                        <span>{n.name}</span>
                                                        <span style={{ color: n.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                                                            {n.stock} left
                                                        </span>
                                                    </div>
                                                    <div style={{ color: 'var(--color-slate-400)', fontSize: 11, marginTop: 2 }}>
                                                        SKU: {n.sku} | Min: {n.min}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost"
                                style={{ gap: 8 }}
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-navy-700), var(--color-gold-600))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                                }}>
                                    {auth?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span style={{ fontSize: 14, color: 'var(--color-slate-200)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {auth?.user?.name}
                                </span>
                                <ChevronDown size={14} />
                            </button>

                            {userMenuOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    background: 'var(--color-navy-800)',
                                    border: '1px solid rgba(255,255,255,.1)',
                                    borderRadius: 'var(--radius-md)',
                                    minWidth: 180, zIndex: 200,
                                    boxShadow: '0 10px 40px rgba(0,0,0,.5)',
                                    overflow: 'hidden',
                                    animation: 'scaleIn .2s ease',
                                }}>
                                    <Link
                                        href={route('profile.edit')}
                                        className="nav-item"
                                        style={{ borderRadius: 0, margin: 0 }}
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <User size={16} />
                                        <span>Profile</span>
                                    </Link>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,.07)' }} />
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="nav-item"
                                        style={{ width: '100%', background: 'none', border: 'none', borderRadius: 0, margin: 0, color: 'var(--color-danger)', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="flash flash-success">
                            <span>✓</span> {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="flash flash-error">
                            <AlertTriangle size={16} /> {flash.error}
                        </div>
                    )}
                    {/* Shift Warning Banner */}
                    {auth?.user && !auth?.active_shift && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 12, padding: '10px 16px', marginBottom: 16, flexWrap: 'wrap',
                            background: 'linear-gradient(90deg, rgba(245,158,11,.1), rgba(245,158,11,.05))',
                            border: '1px solid rgba(245,158,11,.25)', borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: '#fcd34d', fontWeight: 500 }}>
                                    لا توجد وردية كاشير مفتوحة — لن تتمكن من تسجيل فواتير البيع حتى تفتح وردية.
                                </span>
                            </div>
                            <Link
                                href="/shifts"
                                style={{
                                    fontSize: 12, fontWeight: 600, color: '#f59e0b', whiteSpace: 'nowrap',
                                    border: '1px solid rgba(245,158,11,.4)', borderRadius: 'var(--radius-sm)',
                                    padding: '4px 10px', textDecoration: 'none',
                                    background: 'rgba(245,158,11,.08)',
                                }}
                            >
                                افتح وردية الآن ←
                            </Link>
                        </div>
                    )}

                    {children}
                </main>
            </div>

            {/* AI Floating Button */}
            <button 
                onClick={() => setAiOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(217, 119, 6, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                title="AI Business Copilot"
            >
                <Sparkles size={24} />
            </button>

            {/* AI Chat Drawer */}
            {aiOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: 96,
                    right: 24,
                    width: 380,
                    height: 500,
                    background: 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'scaleIn 0.2s ease',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        background: 'linear-gradient(90deg, rgba(217,119,6,0.15), transparent)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(217,119,6,0.18)', color: 'var(--color-gold-400)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>مساعد الأعمال الذكي</h3>
                                <span style={{ fontSize: 10, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                                    متصل بالفرع
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setAiOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-slate-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {aiMessages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                background: m.role === 'user' ? 'var(--color-gold-600)' : 'var(--color-navy-950)',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                fontSize: 13,
                                lineHeight: 1.5,
                                border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                whiteSpace: 'pre-line',
                                textAlign: m.role === 'user' ? 'left' : 'right',
                                direction: m.role === 'user' ? 'ltr' : 'rtl'
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {aiLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--color-navy-950)', padding: '12px 16px', borderRadius: '14px 14px 14px 2px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.05)', direction: 'rtl' }}>
                                <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>جاري التفكير...</span>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendAiMessage} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)' }}>
                        <input 
                            type="text"
                            placeholder="اسأل المساعد عن المبيعات، المخزون..."
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 12px',
                                color: '#fff',
                                fontSize: 13,
                                direction: 'rtl'
                            }}
                        />
                        <button 
                            type="submit"
                            style={{
                                background: 'var(--color-gold-600)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Responsive: show hamburger via CSS class (no inline-style hack) */}
        </div>
    );
}
