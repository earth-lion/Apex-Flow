import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import {
    ShieldCheck, User, Clock, ChevronDown, ChevronUp,
    FileEdit, Trash2, Plus, AlertTriangle, Bot, Search, Filter
} from 'lucide-react';
import { useState } from 'react';

const EVENT_CONFIG = {
    created:   { color: '#10b981', bg: 'rgba(16,185,129,.12)', icon: Plus,      label: 'Created' },
    updated:   { color: '#3b82f6', bg: 'rgba(59,130,246,.12)', icon: FileEdit,  label: 'Updated' },
    deleted:   { color: '#ef4444', bg: 'rgba(239,68,68,.12)',  icon: Trash2,    label: 'Deleted' },
    automated_daily_financial_report: {
        color: '#f59e0b', bg: 'rgba(245,158,11,.12)', icon: Bot, label: 'Daily Report'
    },
};

function getConfig(desc) {
    const key = Object.keys(EVENT_CONFIG).find(k => desc?.includes(k));
    return EVENT_CONFIG[key] || { color: '#94a3b8', bg: 'rgba(148,163,184,.1)', icon: ShieldCheck, label: desc };
}

function DiffViewer({ oldProps, newProps }) {
    if (!oldProps && !newProps) return null;
    const allKeys = [...new Set([...Object.keys(oldProps || {}), ...Object.keys(newProps || {})])];
    return (
        <div style={{
            marginTop: 10,
            background: 'var(--color-navy-950)',
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            fontSize: 12,
            fontFamily: 'monospace',
        }}>
            <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 11, color: 'var(--color-slate-400)', display: 'flex', gap: 16 }}>
                <span style={{ color: '#ef4444' }}>━ OLD</span>
                <span style={{ color: '#10b981' }}>━ NEW</span>
            </div>
            {allKeys.map(key => {
                const oldVal = oldProps?.[key];
                const newVal = newProps?.[key];
                const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                        <div style={{ padding: '6px 12px', color: 'var(--color-slate-400)', background: 'rgba(0,0,0,.2)', fontWeight: 600, fontSize: 11 }}>{key}</div>
                        <div style={{ padding: '6px 12px', color: changed ? '#ef4444' : 'var(--color-slate-400)', background: changed ? 'rgba(239,68,68,.05)' : 'transparent' }}>
                            {oldVal !== undefined ? String(oldVal) : <span style={{ opacity: .4 }}>—</span>}
                        </div>
                        <div style={{ padding: '6px 12px', color: changed ? '#10b981' : 'var(--color-slate-400)', background: changed ? 'rgba(16,185,129,.05)' : 'transparent' }}>
                            {newVal !== undefined ? String(newVal) : <span style={{ opacity: .4 }}>—</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function TimelineItem({ log, isLast }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = getConfig(log.description);
    const Icon = cfg.icon;
    const oldProps = log.properties?.old || null;
    const newProps = log.properties?.attributes || log.properties || null;
    const hasChanges = (oldProps || newProps) && Object.keys(newProps || {}).length > 0;
    const subjectType = log.subject_type?.split('\\').pop() || 'Record';

    return (
        <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Vertical line */}
            {!isLast && (
                <div style={{
                    position: 'absolute', left: 19, top: 40, bottom: -8,
                    width: 2, background: 'rgba(255,255,255,.05)',
                }} />
            )}

            {/* Icon bubble */}
            <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: cfg.bg, border: `1px solid ${cfg.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cfg.color, zIndex: 1,
            }}>
                <Icon size={16} />
            </div>

            {/* Content */}
            <div style={{
                flex: 1, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 16,
                transition: 'border-color .2s',
            }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        {/* Event badge + description */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                                background: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: '.05em'
                            }}>{cfg.label}</span>
                            <span style={{ fontWeight: 600, fontSize: 14, color: '#fff', textTransform: 'capitalize' }}>
                                {log.description?.replace(/_/g, ' ')}
                            </span>
                        </div>

                        {/* Subject */}
                        <div style={{ fontSize: 12, color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'var(--color-slate-500)' }}>on</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-slate-300)' }}>{subjectType}</span>
                            {log.subject_id && <span style={{ color: 'var(--color-slate-500)' }}>#{log.subject_id}</span>}
                        </div>
                    </div>

                    {/* Right meta */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: 'var(--color-navy-700)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 700, color: '#fff',
                            }}>
                                {log.causer?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                                {log.causer?.name || 'System'}
                            </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-slate-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            <Clock size={10} />
                            {new Date(log.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                    </div>
                </div>

                {/* Expandable diff */}
                {hasChanges && (
                    <div style={{ marginTop: 10 }}>
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            style={{
                                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
                                borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer',
                                color: 'var(--color-slate-300)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {expanded ? 'Hide Changes' : 'View Changes'}
                        </button>
                        {expanded && <DiffViewer oldProps={oldProps} newProps={newProps} />}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ActivityLogIndex({ activities }) {
    const [search, setSearch] = useState('');
    const pagData = activities?.data || [];
    const meta = activities || {};

    const filtered = search.trim()
        ? pagData.filter(l =>
            l.description?.toLowerCase().includes(search.toLowerCase()) ||
            l.causer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            l.subject_type?.toLowerCase().includes(search.toLowerCase())
          )
        : pagData;

    const grouped = filtered.reduce((acc, log) => {
        const day = new Date(log.created_at).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[day]) acc[day] = [];
        acc[day].push(log);
        return acc;
    }, {});

    return (
        <AppLayout title="Audit Trail" subtitle="Visual system-wide activity timeline and audit records">
            <Head title="Audit Trail" />

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Events', value: meta.total ?? pagData.length, color: '#3b82f6' },
                    { label: 'Created', value: pagData.filter(l => l.description?.includes('created')).length, color: '#10b981' },
                    { label: 'Updated', value: pagData.filter(l => l.description?.includes('updated')).length, color: '#3b82f6' },
                    { label: 'Deleted', value: pagData.filter(l => l.description?.includes('deleted')).length, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '16px 20px', border: `1px solid ${s.color}25` }}>
                        <div style={{ fontSize: 12, color: 'var(--color-slate-400)', marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: 20, padding: '14px 16px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-slate-400)' }} />
                    <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: 36, maxWidth: 400 }}
                        placeholder="Search by action, user, or model..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Timeline */}
            {Object.keys(grouped).length > 0 ? (
                Object.entries(grouped).map(([day, logs]) => (
                    <div key={day} style={{ marginBottom: 32 }}>
                        {/* Day separator */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
                        }}>
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: 'var(--color-slate-400)',
                                textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap',
                            }}>{day}</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                            <span style={{ fontSize: 11, color: 'var(--color-slate-500)', whiteSpace: 'nowrap' }}>
                                {logs.length} event{logs.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {logs.map((log, i) => (
                            <TimelineItem key={log.id} log={log} isLast={i === logs.length - 1} />
                        ))}
                    </div>
                ))
            ) : (
                <div className="card">
                    <div className="empty-state" style={{ padding: '60px 0' }}>
                        <div className="empty-state-icon">🛡️</div>
                        <h3>No activity logs found</h3>
                        <p>System events and model changes will appear here as a visual timeline.</p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="pagination" style={{ marginTop: 24 }}>
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`page-btn ${meta.current_page === page ? 'active' : ''}`}
                            onClick={() => router.get('/activity-logs', { page }, { preserveState: true })}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
