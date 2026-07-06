import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Play, Power, Calendar, DollarSign, AlertCircle, FileText, User } from 'lucide-react';

export default function ShiftsIndex({ shifts = {}, activeShift = null }) {
    const [openModalOpen, setOpenModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);

    // Open Shift Form
    const openForm = useForm({
        opening_balance: '0.00',
        notes: '',
    });

    // Close Shift Form
    const closeForm = useForm({
        actual_closing_balance: '',
        notes: '',
    });

    const handleOpenShift = (e) => {
        e.preventDefault();
        openForm.post(route('shifts.open'), {
            onSuccess: () => {
                setOpenModalOpen(false);
                openForm.reset();
            }
        });
    };

    const handleCloseShift = (e) => {
        e.preventDefault();
        closeForm.post(route('shifts.close'), {
            onSuccess: () => {
                setCloseModalOpen(false);
                closeForm.reset();
            }
        });
    };

    const formatCurrency = (val) => `$${parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const getDiffBadgeClass = (diff) => {
        const d = parseFloat(diff);
        if (isNaN(d) || d === 0) return 'badge-success';
        return d < 0 ? 'badge-danger' : 'badge-warning';
    };

    const getDiffText = (diff) => {
        const d = parseFloat(diff);
        if (isNaN(d) || d === 0) return 'متطابق (OK)';
        return d < 0 ? `عجز (${formatCurrency(Math.abs(d))})` : `زيادة (${formatCurrency(d)})`;
    };

    return (
        <AppLayout title="Cashier Shifts" subtitle="Open, close and audit daily cashier registers">
            <Head title="Cashier Shifts" />

            {/* Top Shift Controller Card */}
            <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(255, 255, 255, 0.08)', background: 'linear-gradient(135deg, var(--color-navy-900), var(--color-navy-950))' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="card-title">Register Control Panel</div>
                        <div className="card-subtitle">Manage your session cash draw</div>
                    </div>
                    {activeShift ? (
                        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                            الوردية مفتوحة حالياً
                        </span>
                    ) : (
                        <span className="badge badge-danger" style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                            الوردية مغلقة
                        </span>
                    )}
                </div>
                <div className="card-body">
                    {activeShift ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                            <div>
                                <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>Cashier User</span>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <User size={16} className="text-gold" />
                                    {activeShift.user?.name || auth?.user?.name}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>Opened At</span>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={16} className="text-gold" />
                                    {new Date(activeShift.opened_at).toLocaleString('ar-EG')}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>Opening Balance</span>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>
                                    {formatCurrency(activeShift.opening_balance)}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: 12, color: 'var(--color-slate-400)' }}>Expected Balance (Cash)</span>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-gold-400)', marginTop: 4 }}>
                                    {formatCurrency(activeShift.expected_closing_balance)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setCloseModalOpen(true)}
                                    className="btn btn-danger"
                                    style={{ gap: 8, display: 'flex', alignItems: 'center', fontWeight: 600 }}
                                >
                                    <Power size={16} />
                                    إغلاق الوردية الحالية
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Power size={32} className="text-muted" />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>لا توجد وردية نشطة حالياً</h3>
                            <p style={{ color: 'var(--color-slate-400)', fontSize: 13, maxWidth: 400, marginBottom: 20 }}>
                                يجب عليك فتح وردية جديدة وإدخال الرصيد الافتتاحي للنقدية في الدرج لتتمكن من تسجيل فواتير البيع.
                            </p>
                            <button
                                onClick={() => setOpenModalOpen(true)}
                                className="btn btn-primary"
                                style={{ gap: 8, display: 'flex', alignItems: 'center', fontWeight: 600 }}
                            >
                                <Play size={16} />
                                فتح وردية جديدة
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Shifts History Table */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Shifts Log & Audit</div>
                    <div className="card-subtitle">Audited record of all cashier registers in this branch</div>
                </div>
                <div className="card-body" style={{ padding: '12px 0 0' }}>
                    {shifts.data && shifts.data.length > 0 ? (
                        <>
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Cashier</th>
                                            <th>Opened At</th>
                                            <th>Closed At</th>
                                            <th>Opening Balance</th>
                                            <th>Expected Cash</th>
                                            <th>Actual Cash</th>
                                            <th>Difference</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shifts.data.map((shift) => (
                                            <tr key={shift.id}>
                                                <td style={{ fontWeight: 600 }}>{shift.user?.name}</td>
                                                <td>{new Date(shift.opened_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                <td>{shift.closed_at ? new Date(shift.closed_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                                                <td>{formatCurrency(shift.opening_balance)}</td>
                                                <td>{formatCurrency(shift.expected_closing_balance)}</td>
                                                <td>{shift.actual_closing_balance ? formatCurrency(shift.actual_closing_balance) : '-'}</td>
                                                <td>
                                                    {shift.closed_at ? (
                                                        <span className={`badge ${getDiffBadgeClass(shift.difference)}`}>
                                                            {getDiffText(shift.difference)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge ${shift.status === 'open' ? 'badge-success' : 'badge-secondary'}`}>
                                                        {shift.status === 'open' ? 'نشطة' : 'مغلقة'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 12, color: 'var(--color-slate-400)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={shift.notes}>
                                                    {shift.notes || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <p>لا توجد ورديات مسجلة سابقاً.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Open Shift Modal */}
            {openModalOpen && (
                <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div className="card" style={{ width: 450, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="card-header" style={{ padding: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 className="card-title">فتح وردية كاشير جديدة</h3>
                            <button onClick={() => setOpenModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleOpenShift} style={{ marginTop: 16 }}>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--color-slate-300)' }}>الرصيد الافتتاحي (النقدية في الدرج)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-slate-400)' }} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: 32 }}
                                        value={openForm.data.opening_balance}
                                        onChange={e => openForm.setData('opening_balance', e.target.value)}
                                    />
                                </div>
                                {openForm.errors.opening_balance && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{openForm.errors.opening_balance}</div>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--color-slate-300)' }}>ملاحظات</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={openForm.data.notes}
                                    onChange={e => openForm.setData('notes', e.target.value)}
                                    placeholder="مثال: استلام العهدة الصباحية..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setOpenModalOpen(false)} className="btn btn-secondary">إلغاء</button>
                                <button type="submit" disabled={openForm.processing} className="btn btn-primary">تأكيد وفتح الوردية</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Close Shift Modal */}
            {closeModalOpen && (
                <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div className="card" style={{ width: 450, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="card-header" style={{ padding: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 className="card-title">إغلاق وردية الكاشير</h3>
                            <button onClick={() => setCloseModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleCloseShift} style={{ marginTop: 16 }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 16, border: '1px dashed rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-slate-400)' }}>
                                    <span>الرصيد الافتتاحي:</span>
                                    <span>{formatCurrency(activeShift?.opening_balance)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 8 }}>
                                    <span>الرصيد المتوقع بالدرج:</span>
                                    <span style={{ color: 'var(--color-gold-400)' }}>{formatCurrency(activeShift?.expected_closing_balance)}</span>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--color-slate-300)' }}>الرصيد الفعلي (الموجود نقداً بالدرج)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-slate-400)' }} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: 32 }}
                                        value={closeForm.data.actual_closing_balance}
                                        onChange={e => closeForm.setData('actual_closing_balance', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                {closeForm.errors.actual_closing_balance && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{closeForm.errors.actual_closing_balance}</div>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--color-slate-300)' }}>ملاحظات الإغلاق</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={closeForm.data.notes}
                                    onChange={e => closeForm.setData('notes', e.target.value)}
                                    placeholder="اكتب أي ملاحظات أو أسباب وجود عجز/زيادة..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setCloseModalOpen(false)} className="btn btn-secondary">إلغاء</button>
                                <button type="submit" disabled={closeForm.processing} className="btn btn-danger">تأكيد الإغلاق وتسليم الوردية</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
