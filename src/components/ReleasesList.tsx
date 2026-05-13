import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import '../styles/ReleasesList.css';
import { Button, Drawer, Typography } from 'antd';
import 'antd/dist/reset.css';
import { costsService } from '../services/costsService';
import { useAuth } from '../AuthProvider';
import { CostsForm } from './CostsForm';

const { Text } = Typography;

export const ReleasesList: React.FC = () => {
    const { releases, tracks, summary, bundles } = useData();
    const { user } = useAuth();
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
    const [showCosts, setshowCosts] = useState<boolean>(false);

    type Costs = { tracks: number; art: number; mastering: number; physical: number; others: number; physicalProfit: number };
    const [costs, setCosts] = useState<Record<string, Costs>>({});
    const [costsLoading, setCostsLoading] = useState(false);

    // load costs from Firestore
    useEffect(() => {
        if (user) {
            setCostsLoading(true);
            costsService.loadAllCosts()
                .then((loadedCosts) => {
                    setCosts(loadedCosts as Record<string, Costs>);
                })
                .catch((error) => {
                    console.error("Failed to load costs:", error);
                })
                .finally(() => {
                    setCostsLoading(false);
                });
        }
    }, [user]);

    const saveCostsForRelease = async (releaseTitle: string, releaseCosts: Costs) => {
        const next = { ...costs, [releaseTitle]: releaseCosts };
        setCosts(next);
        if (user) {
            try {
                await costsService.saveCosts(releaseTitle, releaseCosts);
            } catch (error) {
                console.error("Failed to save costs:", error);
            }
        }
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

    // compute the maximum sales among releases (exclude bundles) for chart scaling
    const maxRevenue = releases && releases.length ? releases.reduce((m: number, r: any) => Math.max(m, Number(r.totalRevenue || 0)), 0) : 0;

    if (!releases || releases.length === 0) {
        return <div className="chart-container"><p className="no-data">No releases available — upload a CSV to see sales.</p></div>;
    }

    return (
        <div className="releases-container">
            <div className="releases-header">
                <h2>Releases</h2>
                <label>Costs <input type="checkbox" checked={showCosts} onChange={() => setshowCosts(!showCosts)} />{costsLoading && <span> (loading...)</span>}</label>
            </div>

            <div className="releases-grid">
                {/* Render bundle sales if available */}
                {summary?.bundleRevenue > 0 && (
                    <div className={`release-card ${bundlesExpanded ? 'expanded' : ''}`}>
                        <div className="release-header" onClick={toggleBundles}>
                            <div className="release-row">
                                <div className="release-title">Full Discography (bundles)</div>

                                <div className="release-chart bundle">
                                    {currencySymbolFor(releases?.[0]?.currency)}{summary.bundleRevenue?.toFixed ? summary.bundleRevenue.toFixed(2) : Number(summary.bundleRevenue || 0).toFixed(2)}
                                </div>

                                <div className="release-sales">{summary.bundleSales || 0} sales</div>
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
                    const releaseCosts = costs[rel.title] || { tracks: 0, art: 0, mastering: 0, others: 0, physical: 0, physicalProfit: 0 };
                    const totalReleaseCosts = Number(releaseCosts.tracks || 0) + Number(releaseCosts.art || 0) + Number(releaseCosts.mastering || 0) + Number(releaseCosts.others || 0) + Number(releaseCosts.physical || 0);
                    const profit = Number(rel.totalRevenue || 0) - totalReleaseCosts + Number(releaseCosts.physicalProfit || 0);

                    return (
                        <div key={rel.title} className={`release-card ${expanded[rel.title] ? 'expanded' : ''}`}>
                            <div className="release-header" onClick={() => toggle(rel.title)}>
                                <div className="release-row">
                                    <div className="release-title">{rel.title}</div>

                                    <div className="release-chart">
                                        <div
                                            className="release-chart-value"
                                            style={{
                                                width: `${maxRevenue > 0 ? (Number(rel.totalRevenue || 0) / maxRevenue) * 100 : 0}%`,
                                            }}
                                        >
                                            {currencySymbolFor(rel.currency)}{rel.totalRevenue?.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="release-sales">{rel.totalSales} sales</div>
                                </div>
                                

                                {showCosts && (<>
                                    {(totalReleaseCosts > 0 || releaseCosts.physicalProfit !== 0) && <div className="release-info" style={{ color: profit >= 0 ? 'green' : 'red'}}>Income: {'€' + profit.toFixed(2)}</div>}

                                    <div className="release-stats">
                                        <Button className='add-budget-btn' size="small" onClick={(e) => { e.stopPropagation(); openBudget(rel.title); }}>{totalReleaseCosts > 0 ? 'Edit Costs' : 'Add Costs'}</Button>
                                    </div>
                                </>)}
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
                                        <Text strong>Total Costs:</Text> {currencySymbolFor(rel.currency)}{totalReleaseCosts.toFixed(2)}{' '}
                                        <Text strong style={{ marginLeft: 12 }}>Income:</Text>
                                        <Text style={{ color: profit >= 0 ? 'green' : 'red', marginLeft: 8 }}>{profit >= 0 ? currencySymbolFor(rel.currency) + profit.toFixed(2) : currencySymbolFor(rel.currency) + profit.toFixed(2)}</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <Drawer title={editingRelease ? `Costs: ${editingRelease}` : 'Costs'} placement="right" onClose={closeDrawer} open={drawerVisible} width={360}>
                {editingRelease && (
                    (() => {
                        const r = releases.find((x: any) => x.title === editingRelease);
                        const net = r ? Number(r.totalRevenue || 0) : 0;
                        const symbol = currencySymbolFor(r?.currency || releases?.[0]?.currency);
                        return (
                            <CostsForm
                                initial={costs[editingRelease] || { tracks: 0, art: 0, mastering: 0, physical: 0, others: 0, physicalProfit: 0 }}
                                onCancel={closeDrawer}
                                onApply={async (nextCosts) => {
                                    await saveCostsForRelease(editingRelease, nextCosts);
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
