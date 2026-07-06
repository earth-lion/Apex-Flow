import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
    { icon: TrendingUp, label: 'Real-time Analytics', desc: 'Live KPIs & interactive charts' },
    { icon: ShieldCheck, label: 'Audit Trail', desc: 'Every action fully tracked' },
    { icon: Zap, label: 'Redis-cached', desc: 'Sub-millisecond dashboard loads' },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    dur: 4 + Math.random() * 8,
    delay: Math.random() * 6,
    opacity: 0.08 + Math.random() * 0.18,
}));

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState('');

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Sign In — ApexFlow ERP" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body, #app { height: 100%; font-family: 'Inter', system-ui, sans-serif; }

                .af-login-page {
                    display: flex;
                    min-height: 100vh;
                    background: #020617;
                    overflow: hidden;
                }

                /* ── LEFT PANEL ── */
                .af-login-left {
                    flex: 1;
                    position: relative;
                    background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 32px;
                    overflow: hidden;
                }

                .af-login-left::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(217,119,6,.14) 0%, transparent 70%),
                                radial-gradient(ellipse 50% 40% at 20% 80%, rgba(59,130,246,.08) 0%, transparent 60%);
                    pointer-events: none;
                }

                /* Decorative grid */
                .af-login-left::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                }

                .af-particle {
                    position: absolute;
                    border-radius: 50%;
                    background: #d97706;
                    animation: floatUp linear infinite;
                    pointer-events: none;
                    z-index: 1;
                }

                @keyframes floatUp {
                    0%   { transform: translateY(100vh) scale(0); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
                }

                .af-left-brand {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    margin-bottom: 40px;
                }

                .af-brand-logo {
                    width: 60px;
                    height: 60px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #1e3a5f, #d97706);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -2px;
                    margin: 0 auto 12px;
                    box-shadow: 0 0 0 1px rgba(217,119,6,.3), 0 20px 50px rgba(0,0,0,.4);
                }

                .af-brand-name {
                    font-size: 26px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -1px;
                }

                .af-brand-tag {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: #f59e0b;
                    margin-top: 4px;
                }

                .af-left-headline {
                    position: relative;
                    z-index: 2;
                    margin-bottom: 30px;
                    text-align: center;
                }

                .af-left-headline h2 {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.3;
                    margin-bottom: 8px;
                }

                .af-left-headline p {
                    font-size: 14px;
                    color: #94a3b8;
                    line-height: 1.6;
                    max-width: 380px;
                    margin: 0 auto;
                }

                .af-features {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    max-width: 380px;
                }

                .af-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255,255,255,.04);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 10px;
                    padding: 10px 14px;
                    transition: background 200ms ease;
                }

                .af-feature-item:hover { background: rgba(255,255,255,.07); }

                .af-feature-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(217,119,6,.18);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fbbf24;
                    flex-shrink: 0;
                }

                .af-feature-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .af-feature-desc {
                    font-size: 11px;
                    color: #64748b;
                    margin-top: 2px;
                }

                /* ── RIGHT PANEL ── */
                .af-login-right {
                    width: 480px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 30px;
                    background: #0f172a;
                    border-left: 1px solid rgba(255,255,255,.06);
                    position: relative;
                }

                .af-login-right::before {
                    content: '';
                    position: absolute;
                    top: 0; right: 0;
                    width: 100%; height: 300px;
                    background: radial-gradient(ellipse at top right, rgba(217,119,6,.07) 0%, transparent 70%);
                    pointer-events: none;
                }

                .af-form-box {
                    width: 100%;
                    max-width: 380px;
                    position: relative;
                    z-index: 1;
                }

                .af-form-header {
                    margin-bottom: 24px;
                }

                .af-form-header h1 {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -.5px;
                    margin-bottom: 6px;
                }

                .af-form-header p {
                    font-size: 13px;
                    color: #64748b;
                }

                .af-form-header span {
                    color: #fbbf24;
                }

                .af-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .af-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .af-input-wrap {
                    position: relative;
                }

                .af-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #475569;
                    transition: color 200ms ease;
                    pointer-events: none;
                }

                .af-input-wrap:has(.af-input:focus) .af-input-icon {
                    color: #d97706;
                }

                .af-input {
                    width: 100%;
                    background: rgba(255,255,255,.04);
                    border: 1px solid rgba(255,255,255,.09);
                    border-radius: 8px;
                    padding: 10px 12px 10px 42px;
                    color: #fff;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
                }

                .af-input::placeholder { color: #475569; }

                .af-input:focus {
                    border-color: #d97706;
                    box-shadow: 0 0 0 2px rgba(217,119,6,.2);
                    background: rgba(255,255,255,.06);
                }

                .af-input.af-input-error {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 2px rgba(239,68,68,.2);
                }

                .af-pass-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 6px;
                    transition: color 200ms ease;
                }

                .af-pass-toggle:hover { color: #94a3b8; }

                .af-error-msg {
                    font-size: 11px;
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .af-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .af-checkbox-wrap {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .af-checkbox {
                    width: 14px;
                    height: 14px;
                    border: 1.5px solid rgba(255,255,255,.2);
                    border-radius: 3px;
                    background: rgba(255,255,255,.05);
                    appearance: none;
                    cursor: pointer;
                    position: relative;
                    flex-shrink: 0;
                }

                .af-checkbox:checked {
                    background: #d97706;
                    border-color: #d97706;
                }

                .af-checkbox:checked::after {
                    content: '';
                    position: absolute;
                    left: 3px;
                    top: 0px;
                    width: 6px;
                    height: 4px;
                    border-left: 2px solid #fff;
                    border-bottom: 2px solid #fff;
                    transform: rotate(-45deg);
                }

                .af-checkbox-label {
                    font-size: 12px;
                    color: #94a3b8;
                    cursor: pointer;
                }

                .af-forgot {
                    font-size: 12px;
                    color: #fbbf24;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 200ms ease;
                }

                .af-forgot:hover { color: #f59e0b; }

                .af-submit-btn {
                    width: 100%;
                    padding: 11px;
                    background: linear-gradient(135deg, #d97706, #f59e0b);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    letter-spacing: .2px;
                    transition: opacity 200ms ease, box-shadow 200ms ease, transform 150ms ease;
                    box-shadow: 0 4px 20px rgba(217,119,6,.35);
                    font-family: inherit;
                }

                .af-submit-btn:hover:not(:disabled) {
                    box-shadow: 0 6px 30px rgba(217,119,6,.5);
                    transform: translateY(-1px);
                }

                .af-submit-btn:active:not(:disabled) { transform: translateY(0); }

                .af-submit-btn:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                }

                .af-submit-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin .7s linear infinite;
                    flex-shrink: 0;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .af-status-msg {
                    background: rgba(16,185,129,.12);
                    border: 1px solid rgba(16,185,129,.25);
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 13px;
                    color: #10b981;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .af-hint {
                    margin-top: 16px;
                    padding: 10px 14px;
                    background: rgba(255,255,255,.03);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 8px;
                    font-size: 11px;
                    color: #475569;
                    line-height: 1.5;
                }

                .af-hint strong { color: #fbbf24; }

                /* ── RESPONSIVE ── */
                @media (max-width: 900px) {
                    .af-login-left { display: none; }
                    .af-login-right {
                        width: 100%;
                        min-height: 100vh;
                    }
                }

                @media (max-width: 480px) {
                    .af-login-right { padding: 32px 24px; }
                    .af-form-header h1 { font-size: 22px; }
                }
            `}</style>

            <div className="af-login-page">
                {/* ── Left decorative panel ── */}
                <div className="af-login-left">
                    {/* Floating particles */}
                    {PARTICLES.map(p => (
                        <div
                            key={p.id}
                            className="af-particle"
                            style={{
                                left: `${p.left}%`,
                                width: p.size,
                                height: p.size,
                                opacity: p.opacity,
                                animationDuration: `${p.dur}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    ))}

                    <div className="af-left-brand">
                        <div className="af-brand-logo">AF</div>
                        <div className="af-brand-name">ApexFlow</div>
                        <div className="af-brand-tag">Enterprise ERP System</div>
                    </div>

                    <div className="af-left-headline">
                        <h2>Command Your Business<br />From One Place</h2>
                        <p>
                            Multi-branch inventory management with real-time analytics,
                            automated low-stock alerts, and full audit trail.
                        </p>
                    </div>

                    <div className="af-features">
                        {FEATURES.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="af-feature-item">
                                <div className="af-feature-icon">
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <div className="af-feature-label">{label}</div>
                                    <div className="af-feature-desc">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right login form ── */}
                <div className="af-login-right">
                    <div className="af-form-box">
                        <div className="af-form-header">
                            <h1>Welcome Back 👋</h1>
                            <p>Sign in to your <span>ApexFlow</span> workspace</p>
                        </div>

                        {status && (
                            <div className="af-status-msg">
                                ✓ {status}
                            </div>
                        )}

                        <form onSubmit={submit} autoComplete="on">
                            {/* Email */}
                            <div className="af-input-group">
                                <label className="af-label" htmlFor="email">
                                    Email address
                                </label>
                                <div className="af-input-wrap">
                                    <Mail size={16} className="af-input-icon" />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        autoFocus
                                        className={`af-input${errors.email ? ' af-input-error' : ''}`}
                                        placeholder="admin@apexflow.io"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                </div>
                                {errors.email && (
                                    <span className="af-error-msg">⚠ {errors.email}</span>
                                )}
                            </div>

                            {/* Password */}
                            <div className="af-input-group">
                                <label className="af-label" htmlFor="password">
                                    Password
                                </label>
                                <div className="af-input-wrap">
                                    <Lock size={16} className="af-input-icon" />
                                    <input
                                        id="password"
                                        type={showPass ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        className={`af-input${errors.password ? ' af-input-error' : ''}`}
                                        placeholder="Enter your password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        style={{ paddingRight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        className="af-pass-toggle"
                                        onClick={() => setShowPass(s => !s)}
                                        tabIndex={-1}
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="af-error-msg">⚠ {errors.password}</span>
                                )}
                            </div>

                            {/* Remember + Forgot */}
                            <div className="af-row">
                                <label className="af-checkbox-wrap">
                                    <input
                                        type="checkbox"
                                        className="af-checkbox"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                    />
                                    <span className="af-checkbox-label">Remember me</span>
                                </label>
                                {canResetPassword && (
                                    <a href={route('password.request')} className="af-forgot">
                                        Forgot password?
                                    </a>
                                )}
                            </div>

                            {/* Submit */}
                            <button type="submit" className="af-submit-btn" disabled={processing}>
                                {processing ? (
                                    <>
                                        <span className="af-submit-spinner" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In to ApexFlow'
                                )}
                            </button>
                        </form>

                        {/* Demo hint */}
                        <div className="af-hint">
                            🔑 <strong>Demo credentials:</strong> admin@apexflow.io / password
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
