import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, Package, Users, FileText, CornerDownLeft } from 'lucide-react';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Watch for Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(o => !o);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch search results on query change
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const delayDebounce = setTimeout(() => {
            axios.get('/global-search', { params: { q: query } })
                .then(res => {
                    setResults(res.data);
                    setSelectedIndex(0);
                })
                .catch(() => setResults([]))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    // Handle Keyboard navigation inside results list
    const handleKeyDown = (e) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            navigate(results[selectedIndex]);
        }
    };

    const navigate = (item) => {
        setIsOpen(false);
        setQuery('');
        router.visit(item.url);
    };

    // Auto-focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-backdrop"
            style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
            <div
                className="modal"
                style={{
                    maxWidth: 600,
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    overflow: 'hidden',
                }}
            >
                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,.07)',
                    gap: 12,
                }}>
                    <Search size={20} style={{ color: 'var(--color-slate-400)' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            color: '#fff',
                            fontSize: 16,
                            placeholderColor: 'var(--color-slate-500)',
                        }}
                        placeholder="Search products, customers, invoices (Press Esc to close)..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {loading && <div className="spinner" style={{ width: 18, height: 18 }} />}
                </div>

                {/* Results List */}
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                    {query.trim().length < 2 ? (
                        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--color-slate-500)', fontSize: 14 }}>
                            Type at least 2 characters to search across the ERP...
                        </div>
                    ) : results.length === 0 && !loading ? (
                        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--color-slate-500)', fontSize: 14 }}>
                            No matches found for <strong style={{ color: 'var(--color-gold-400)' }}>"{query}"</strong>
                        </div>
                    ) : (
                        <div style={{ padding: 8 }}>
                            {results.map((item, idx) => {
                                const Icon = item.type === 'Product' ? Package : item.type === 'Customer' ? Users : FileText;
                                const isSelected = idx === selectedIndex;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            background: isSelected ? 'rgba(255,255,255,.06)' : 'transparent',
                                            color: isSelected ? '#fff' : 'var(--color-slate-300)',
                                            transition: 'background 100ms ease',
                                        }}
                                        onClick={() => navigate(item)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: isSelected ? 'var(--color-gold-600)' : 'var(--color-navy-700)',
                                                display: 'flex', alignItems: 'center', justify: 'center',
                                                color: isSelected ? '#fff' : 'var(--color-slate-400)',
                                            }}>
                                                <Icon size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                                                <div style={{ fontSize: 12, color: isSelected ? 'var(--color-slate-300)' : 'var(--color-slate-500)' }}>{item.subtitle}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="badge badge-slate" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                                                {item.type}
                                            </span>
                                            {isSelected && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--color-slate-500)' }}>
                                                    <span>Select</span>
                                                    <CornerDownLeft size={11} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div style={{
                    padding: '10px 20px',
                    background: 'var(--color-navy-950)',
                    borderTop: '1px solid rgba(255,255,255,.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'var(--color-slate-500)',
                }}>
                    <div>Use ↑↓ to navigate • Enter to select</div>
                    <div>Ctrl+K to toggle anywhere</div>
                </div>
            </div>
        </div>
    );
}
