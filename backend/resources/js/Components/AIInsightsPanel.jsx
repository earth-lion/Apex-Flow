import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    TrendingUp, TrendingDown, AlertTriangle, Package,
    Users, DollarSign, BarChart2, Star, Info,
    RefreshCw, CheckCircle, XCircle, Zap, ChevronRight
} from 'lucide-react';
import { router } from '@inertiajs/react';

/* ── Icon & colour mapping ─────────────────────────────────── */
const TYPE_CONFIG = {
    success: { color: '#10b981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.25)', icon: TrendingUp },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,.10)', border: 'rgba(245,158,11,.25)', icon: AlertTriangle },
    danger:  { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.25)',  icon: XCircle },
    info:    { color: '#3b82f6', bg: 'rgba(59,130,246,.10)', border: 'rgba(59,130,246,.20)', icon: Info },
};

const CATEGORY_ICON = {
    Revenue:   DollarSign,
    Inventory: Package,
    Products:  Star,
    Finance:   BarChart2,
    Customers: Users,
    Analytics: Zap,
};

const PRIORITY_BADGE = {
    critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,.15)' },
    high:     { label: 'High',     color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
    medium:   { label: 'Medium',   color: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
    low:      { label: 'Info',     color: '#94a3b8', bg: 'rgba(148,163,184,.10)' },
};

/* ── Health Score Ring ─────────────────────────────────────── */
function HealthRing({ score }) {
    const radius   = 46;
    const stroke   = 7;
    const circ     = 2 * Math.PI * radius;
    const progress = ((100 - score) / 100) * circ;

    const color =
        score >= 80 ? '#10b981' :
        score >= 55 ? '#f59e0b' : '#ef4444';

    const label =
        score >= 80 ? 'Excellent' :
        score >= 55 ? 'Fair' : 'Needs Attention';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* SVG ring */}
            <div style={{ position: 'relative', width: 112, height: 112, flexShrink: 0 }}>
                <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx="56" cy="56" r={radius} fill="none"
                        stroke="rgba(255,255,255,.07)" strokeWidth={stroke} />
                    {/* Progress */}
                    <circle cx="56" cy="56" r={radius} fill="none"
                        stroke={color} strokeWidth={stroke}
                        strokeDasharray={circ}
                        strokeDashoffset={progress}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease, stroke .5s ease' }}
                    />
                </svg>
                {/* Centre label */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: 10, color: 'var(--color-slate-400)', marginTop: 2 }}>/ 100</span>
                </div>
            </div>

            {/* Text */}
            <div>
                <div style={{ fontSize: 11, color: 'var(--color-slate-400)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
                    Business Health
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-slate-400)', lineHeight: 1.5 }}>
                    {score >= 80 && 'All systems running well.'}
                    {score >= 55 && score < 80 && 'Some areas need attention.'}
                    {score < 55 && 'Immediate action required.'}
                </div>
            </div>
        </div>
    );
}

/* ── Single Insight Card ───────────────────────────────────── */
function InsightCard({ insight, index }) {
    const cfg   = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
    const CIcon = CATEGORY_ICON[insight.category] || Info;
    const pb    = PRIORITY_BADGE[insight.priority] || PRIORITY_BADGE.low;

    return (
        <div
            style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                animation: `slideUp .35s ease ${index * 0.06}s both`,
            }}
        >
            {/* Category icon */}
            <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `rgba(${cfg.color === '#10b981' ? '16,185,129' :
                    cfg.color === '#f59e0b' ? '245,158,11' :
                    cfg.color === '#ef4444' ? '239,68,68' : '59,130,246'}, .18)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cfg.color, flexShrink: 0,
            }}>
                <CIcon size={18} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{insight.title}</span>
                    <span style={{
                        fontSize: 10, fontWeight: 600, borderRadius: 99,
                        padding: '2px 8px', color: pb.color, background: pb.bg,
                        textTransform: 'uppercase', letterSpacing: '.4px',
                    }}>{pb.label}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-slate-400)', lineHeight: 1.55, margin: 0 }}>
                    {insight.description}
                </p>
            </div>

            {/* Metric + Action */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>
                    {insight.metric}
                </span>
                {insight.action && insight.action_url && (
                    <button
                        onClick={() => router.visit(insight.action_url)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: cfg.color,
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            padding: '4px 8px', borderRadius: 6,
                            transition: 'background .15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `rgba(${
                            cfg.color === '#10b981' ? '16,185,129' :
                            cfg.color === '#f59e0b' ? '245,158,11' :
                            cfg.color === '#ef4444' ? '239,68,68' : '59,130,246'}, .12)`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {insight.action} <ChevronRight size={11} />
                    </button>
                )}
            </div>
        </div>
    );
}

/* ── Main Panel ────────────────────────────────────────────── */
export default function AIInsightsPanel() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [ts, setTs]           = useState('');

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        axios.get('/ai/insights')
            .then(res => {
                setData(res.data);
                setTs(res.data.generated_at || '');
            })
            .catch(() => setError('Could not load AI insights. Retry later.'))
            .finally(() => setLoading(false));
    }, []);

    // Load on mount, then refresh every 5 minutes
    useEffect(() => {
        load();
        const id = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, [load]);

    return (
        <div className="card" style={{ marginBottom: 24 }}>
            {/* Header */}
            <div className="card-header" style={{ paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={17} color="#fff" />
                    </div>
                    <div>
                        <div className="card-title" style={{ fontSize: 15 }}>AI Business Insights</div>
                        {ts && (
                            <div className="card-subtitle">Last analysed at {ts}</div>
                        )}
                    </div>
                </div>

                <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={load}
                    disabled={loading}
                    title="Refresh insights"
                    style={{ opacity: loading ? .5 : 1 }}
                >
                    <RefreshCw size={15} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} />
                </button>
            </div>

            <div className="card-body" style={{ paddingTop: 4 }}>

                {/* Loading skeleton */}
                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                height: 72, borderRadius: 12,
                                background: 'rgba(255,255,255,.04)',
                                animation: 'pulse 1.5s ease infinite',
                            }} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div style={{
                        padding: '20px', textAlign: 'center',
                        color: 'var(--color-slate-400)', fontSize: 13,
                    }}>
                        <AlertTriangle size={24} style={{ margin: '0 auto 8px', color: 'var(--color-warning)' }} />
                        <p>{error}</p>
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={load}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Data */}
                {!loading && data && (
                    <div>
                        {/* Health Score + Summary */}
                        <div style={{
                            background: 'rgba(255,255,255,.03)',
                            border: '1px solid rgba(255,255,255,.07)',
                            borderRadius: 12,
                            padding: '18px 20px',
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 16,
                            flexWrap: 'wrap',
                        }}>
                            <HealthRing score={data.health_score} />
                            {data.summary && (
                                <div style={{
                                    flex: 1, minWidth: 160,
                                    borderLeft: '1px solid rgba(255,255,255,.07)',
                                    paddingLeft: 20,
                                }}>
                                    <div style={{ fontSize: 11, color: 'var(--color-slate-400)', fontWeight: 600,
                                        textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>
                                        Summary
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--color-slate-200)', lineHeight: 1.6, margin: 0 }}>
                                        {data.summary}
                                    </p>
                                    <div style={{
                                        marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
                                    }}>
                                        {['critical', 'high', 'medium'].map(p => {
                                            const count = data.insights.filter(i => i.priority === p).length;
                                            if (!count) return null;
                                            const pb = PRIORITY_BADGE[p];
                                            return (
                                                <span key={p} style={{
                                                    fontSize: 11, fontWeight: 600, borderRadius: 99,
                                                    padding: '3px 10px', color: pb.color, background: pb.bg,
                                                }}>
                                                    {count} {pb.label}
                                                </span>
                                            );
                                        })}
                                        {data.insights.length === 0 && (
                                            <span style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCircle size={13} /> All metrics look great!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Insight Cards */}
                        {data.insights.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {data.insights.map((ins, i) => (
                                    <InsightCard key={i} insight={ins} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#10b981' }}>
                                <CheckCircle size={32} style={{ margin: '0 auto 10px' }} />
                                <div style={{ fontWeight: 600, fontSize: 14 }}>Everything looks healthy!</div>
                                <div style={{ fontSize: 12, color: 'var(--color-slate-400)', marginTop: 4 }}>
                                    No alerts or recommendations at this time.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: .4; }
                    50%       { opacity: .8; }
                }
            `}</style>
        </div>
    );
}
