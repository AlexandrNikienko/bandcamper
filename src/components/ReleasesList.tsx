import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import '../styles/ReleasesList.css';
import { Button, Drawer, InputNumber, Space, Typography } from 'antd';
import 'antd/dist/reset.css';

const { Text } = Typography;

export const ReleasesList: React.FC = () => {
    const { releases, tracks, summary, bundles } = useData();
    const currencySymbolFor = (currency?: string) => {
        if (!currency) return '€';
        const c = String(currency).trim().toUpperCase();
        switch (c) {
            case 'EUR':
            case '€':
                return '€';
            case 'USD':
            case 'US$':
            case '$':
                return '$';
            case 'GBP':
            case '£':
                return '£';
            case 'JPY':
            case '¥':
                return '¥';
            default:
                return c; // fallback to currency code
        }
    };
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [bundlesExpanded, setBundlesExpanded] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingRelease, setEditingRelease] = useState<string | null>(null);

    type Budget = { tracks: number; art: number; mastering: number; others: number };
    const [budgets, setBudgets] = useState<Record<string, Budget>>({});

    // load budgets from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('releaseBudgets');
            if (raw) setBudgets(JSON.parse(raw));
        } catch (e) {
            // ignore
        }
    }, []);

    const saveBudgets = (next: Record<string, Budget>) => {
        setBudgets(next);
        try { localStorage.setItem('releaseBudgets', JSON.stringify(next)); } catch (e) { }
    };

    const toggle = (title: string) => {
        setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const toggleBundles = () => setBundlesExpanded(v => !v);

    const openBudget = (releaseTitle: string) => {
        setEditingRelease(releaseTitle);
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setEditingRelease(null);
    };

    // Group tracks by release
    const tracksByRelease: Record<string, Array<any>> = {};
    for (const t of tracks) {
        const rel = t.releaseTitle || 'Unknown Release';
        if (!tracksByRelease[rel]) tracksByRelease[rel] = [];
        tracksByRelease[rel].push(t);
    }

    if (!releases || releases.length === 0) {
        return <div className="chart-container"><p className="no-data">No releases available — upload a CSV to see sales.</p></div>;
    }

    return (
        <div className="releases-container">
            <div className="releases-header">
                <h2>Releases</h2>
            </div>

            <div className="releases-grid">
                {/* Render bundle sales if available */}
                {summary?.bundleRevenue > 0 && (
                    <div className={`release-card ${bundlesExpanded ? 'expanded' : ''}`}>
                        <div className="release-header" onClick={toggleBundles}>
                            <div className="release-info">
                                <div className="release-title">Full Discography (bundles)</div>
                            </div>

                            <div className="release-stats">
                                <div className="release-revenue">
                                    <span className="release-sales">{summary.bundleSales || 0} sales</span> · {currencySymbolFor(releases?.[0]?.currency)}{summary.bundleRevenue?.toFixed ? summary.bundleRevenue.toFixed(2) : Number(summary.bundleRevenue || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {bundlesExpanded && (
                            <div className="tracks-section">
                                <div className="tracks-list">
                                    {(bundles || []).slice().map((b: any, idx: number) => (
                                        <div key={`${b.title}-${idx}`} className="track-item">
                                            <div className="track-title">{b.title}</div>
                                            <div className="track-stats">{b.quantity} sales · {currencySymbolFor(releases?.[0]?.currency)}{Number(b.revenue).toFixed(2)}</div>
                                        </div>
                                    ))}

                                    {(!(bundles || []).length) && (
                                        <div className="tracks-empty">No bundle sales recorded.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Render reelaaes sales if available */}
                {releases.slice().sort((a: any, b: any) => b.totalRevenue - a.totalRevenue).map((rel: any) => {
                    const budget = budgets[rel.title] || { tracks: 0, art: 0, mastering: 0, others: 0 };
                    const totalBudget = Number(budget.tracks || 0) + Number(budget.art || 0) + Number(budget.mastering || 0) + Number(budget.others || 0);
                    const profit = Number(rel.totalRevenue || 0) - totalBudget; // positive = profit

                    return (
                        <div key={rel.title} className={`release-card ${expanded[rel.title] ? 'expanded' : ''}`}>
                            <div className="release-header" onClick={() => toggle(rel.title)}>
                                <div className="release-info">
                                    <div className="release-title">{rel.title}</div>
                                    {totalBudget > 0 && <div style={{ color: profit >= 0 ? 'green' : 'red', marginTop: '0.5rem', fontSize: '0.9em' }}>Profit: {profit >= 0 ? '€' + profit.toFixed(2) : '€' + profit.toFixed(2)}</div>}
                                </div>

                                <div className="release-stats">
                                    <div className="release-revenue">
                                        <span className="release-sales">{rel.totalSales} sales</span> · {currencySymbolFor(rel.currency)}{rel.totalRevenue?.toFixed ? rel.totalRevenue.toFixed(2) : Number(rel.totalRevenue).toFixed(2)}
                                    </div>

                                    <Space>
                                        <Button className='add-budget-btn' size="small" onClick={() => openBudget(rel.title)}>{totalBudget > 0 ? 'Edit Budget' : 'Add Budget'}</Button>
                                    </Space>
                                </div>
                            </div>

                            {expanded[rel.title] && (
                                <div className="tracks-section">
                                    <div className="full-release-summary">
                                        <div className="tracks-label">Full release sales</div>

                                        <div className="full-release-stats">
                                            <div className="track-stats">{rel.albumSales} sales · {currencySymbolFor(rel.currency)}{rel.albumRevenue?.toFixed ? rel.albumRevenue.toFixed(2) : Number(rel.albumRevenue).toFixed(2)}</div>
                                        </div>
                                    </div>

                                    {(tracksByRelease[rel.title] || []).length > 0 && (
                                        <div className="tracks-total">
                                            <div className="tracks-label">Tracks sales total</div>

                                            <div className="track-stats">
                                                {(tracksByRelease[rel.title] || []).reduce((sum, t) => sum + t.sales, 0)} sales · {currencySymbolFor(rel.currency)}{((tracksByRelease[rel.title] || []).reduce((sum, t) => sum + Number(t.revenue), 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="tracks-list">
                                        {((tracksByRelease[rel.title] || []).slice().sort((a, b) => b.sales - a.sales)).map((t, idx) => (
                                            <div key={`${t.title}-${idx}`} className="track-item">
                                                <div className="track-title">{t.title}</div>

                                                <div className="track-stats">{t.sales} sales · {currencySymbolFor(rel.currency)}{Number(t.revenue).toFixed(2)}</div>
                                            </div>
                                        ))}

                                        {(!(tracksByRelease[rel.title] || []).length) && (
                                            <div className="tracks-empty">No individual track sales recorded for this release.</div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Budget Total:</Text> {currencySymbolFor(rel.currency)}{totalBudget.toFixed(2)}{' '}
                                        <Text strong style={{ marginLeft: 12 }}>Profit:</Text>
                                        <Text style={{ color: profit >= 0 ? 'green' : 'red', marginLeft: 8 }}>{profit >= 0 ? currencySymbolFor(rel.currency) + profit.toFixed(2) : currencySymbolFor(rel.currency) + profit.toFixed(2)}</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <Drawer title={editingRelease ? `Budget: ${editingRelease}` : 'Budget'} placement="right" onClose={closeDrawer} open={drawerVisible} width={360}>
                {editingRelease && (
                    (() => {
                        const r = releases.find((x: any) => x.title === editingRelease);
                        const net = r ? Number(r.totalRevenue || 0) : 0;
                        const symbol = currencySymbolFor(r?.currency || releases?.[0]?.currency);
                        return (
                            <BudgetForm
                                initial={budgets[editingRelease] || { tracks: 0, art: 0, mastering: 0, others: 0 }}
                                onCancel={closeDrawer}
                                onApply={(nextBud) => {
                                    const next = { ...budgets, [editingRelease]: nextBud };
                                    saveBudgets(next);
                                    closeDrawer();
                                }}
                                netRevenue={net}
                                currencySymbol={symbol}
                            />
                        );
                    })()
                )}
            </Drawer>
        </div>
    );
};

// small budget form component inside this file to keep changes localized
const BudgetForm: React.FC<{ initial: { tracks: number; art: number; mastering: number; others: number }; onApply: (b: any) => void; onCancel: () => void; netRevenue: number; currencySymbol?: string }> = ({ initial, onApply, onCancel, netRevenue, currencySymbol = '€' }) => {
    const [tracks, setTracks] = useState<number>(initial.tracks || 0);
    const [art, setArt] = useState<number>(initial.art || 0);
    const [mastering, setMastering] = useState<number>(initial.mastering || 0);
    const [others, setOthers] = useState<number>(initial.others || 0);

    const total = Number(tracks || 0) + Number(art || 0) + Number(mastering || 0) + Number(others || 0);
    const profit = Number(netRevenue || 0) - total;

    return (
        <div>
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <div style={{ marginBottom: 8 }}>Tracks</div>
                    <InputNumber style={{ width: '100%' }} min={0} value={tracks} formatter={(value: any) => `${currencySymbol} ${value}`} parser={(value: any) => String(value).replace(/[^0-9.\-]/g, '')} onChange={(v: any) => setTracks(Number(v || 0))} />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Art</div>
                    <InputNumber style={{ width: '100%' }} min={0} value={art} formatter={(value: any) => `${currencySymbol} ${value}`} parser={(value: any) => String(value).replace(/[^0-9.\-]/g, '')} onChange={(v: any) => setArt(Number(v || 0))} />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Mastering</div>
                    <InputNumber style={{ width: '100%' }} min={0} value={mastering} formatter={(value: any) => `${currencySymbol} ${value}`} parser={(value: any) => String(value).replace(/[^0-9.\-]/g, '')} onChange={(v: any) => setMastering(Number(v || 0))} />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Others</div>
                    <InputNumber style={{ width: '100%' }} min={0} value={others} formatter={(value: any) => `${currencySymbol} ${value}`} parser={(value: any) => String(value).replace(/[^0-9.\-]/g, '')} onChange={(v: any) => setOthers(Number(v || 0))} />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>TOTAL</div>
                    <InputNumber style={{ width: '100%' }} value={total} readOnly formatter={(value: any) => `${currencySymbol} ${value}`} />
                </div>

                <div>
                    <div style={{ marginBottom: 8 }}>Profit (Net Revenue - Budget)</div>
                    <Text style={{ color: profit >= 0 ? 'green' : 'red' }}>{profit >= 0 ? currencySymbol + profit.toFixed(2) : currencySymbol + profit.toFixed(2)}</Text>
                </div>

                <Space style={{ marginTop: 8 }}>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" onClick={() => onApply({ tracks, art, mastering, others })}>Apply</Button>
                </Space>
            </Space>
        </div>
    );
};
