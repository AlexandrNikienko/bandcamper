import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import '../styles/ReleasesList.css';
import { Button, Drawer } from 'antd';
import 'antd/dist/reset.css';
import { costsService } from '../services/costsService';
import { CostsForm } from './CostsForm';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { currencySymbolFor, formatMoney, EMPTY_COSTS, calcReleaseProfit } from '../utils/utils';
import { Costs } from '../types/sales';

export const ReleasesList: React.FC<{ user: any }> = ({ user }) => {
    const { releases, tracks, summary, bundles } = useData();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [bundlesExpanded, setBundlesExpanded] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingRelease, setEditingRelease] = useState<string | null>(null);
    const [showCosts, setShowCosts] = useState<boolean>(false);
    
    const [costs, setCosts] = useState<Record<string, Costs>>({});
    const [costsLoading, setCostsLoading] = useState(false);

    const editingReleaseData = useMemo(
        () => releases.find((r: any) => r.title === editingRelease),
        [releases, editingRelease]
    );
    const editingReleaseBandcampIncome = editingReleaseData ? Number(editingReleaseData.totalRevenue || 0) : 0;
    const editingReleaseCurrencySymbol = currencySymbolFor(editingReleaseData?.currency || releases?.[0]?.currency);

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
    const tracksByRelease = useMemo(() => {
        const map: Record<string, Array<any>> = {};
        for (const t of tracks) {
            const rel = t.releaseTitle || 'Unknown Release';
            if (!map[rel]) map[rel] = [];
            map[rel].push(t);
        }
        return map;
    }, [tracks]);

    // // compute the maximum sales among releases (exclude bundles) for chart scaling
    const maxRevenue = useMemo(() =>
        releases.reduce((m: number, r: any) => Math.max(m, Number(r.totalRevenue || 0)), 0)
    , [releases]);

    const sortedReleases = useMemo(
        () => releases.slice().sort((a: any, b: any) => b.totalRevenue - a.totalRevenue),
        [releases]
    );

    if (!releases || releases.length === 0) {
        return <div className="chart-container"><p className="no-data">No releases available — upload a CSV to see sales.</p></div>;
    }

    return (
        <div className="releases-container">
            <div className="releases-header">
                <h2>Releases</h2>

                <label>
                    Costs <input disabled={!user} type="checkbox" checked={showCosts} onChange={() => setShowCosts(!showCosts)} />
                    {!user && (
                        <Tooltip title="Sign in to set a release costs, which is saving to your account.">
                            <QuestionCircleOutlined style={{ marginLeft: 6, opacity: 0.5 }} />
                        </Tooltip>
                    )}
                    {costsLoading && <span> (loading...)</span>}
                </label>
            </div>

            <div className="releases-grid">
                {summary?.bundleRevenue > 0 && (
                    <div className={`release-card ${bundlesExpanded ? 'expanded' : ''}`}>
                        <div className="release-header" onClick={toggleBundles}>
                            <div className="release-row">
                                <div className="release-title">Full Discography (bundles)</div>

                                <div className="release-chart bundle">
                                    {formatMoney(Number(summary.bundleRevenue || 0), currencySymbolFor(releases?.[0]?.currency))}
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
                                            <div className="track-stats">{b.quantity} sales · {formatMoney(Number(b.revenue), currencySymbolFor(releases?.[0]?.currency))}</div>
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

                {sortedReleases.map((rel: any) => {
                    const releaseCosts = costs[rel.title] ?? EMPTY_COSTS;
                    const { totalReleaseCosts, profit } = calcReleaseProfit(Number(rel.totalRevenue || 0), releaseCosts);

                    return (
                        <div key={rel.title} className={`release-card ${expanded[rel.title] ? 'expanded' : ''}`}>
                            <div className="release-header" onClick={() => toggle(rel.title)}>
                                <div className="release-row">
                                    <div className="release-title">{rel.title}</div>

                                    <div className="release-chart">
                                        <div className="release-chart-value"
                                            style={{ width: `${maxRevenue > 0 ? (Number(rel.totalRevenue || 0) / maxRevenue) * 100 : 0}%`}}
                                        >
                                            {formatMoney(Number(rel.totalRevenue || 0), currencySymbolFor(rel.currency))}
                                        </div>
                                    </div>

                                    <div className="release-sales">{rel.totalSales} sales</div>
                                </div>
                                

                                {showCosts && (<>
                                    {(totalReleaseCosts > 0 || releaseCosts.physicalProfit !== 0) && 
                                    <div className="release-info" style={{ color: profit >= 0 ? 'green' : 'red'}}>
                                        Income: {formatMoney(profit, currencySymbolFor(rel.currency))}
                                    </div>}

                                    <div className="release-stats">
                                        <Button className='add-budget-btn' size="small" onClick={(e) => { e.stopPropagation(); openBudget(rel.title); }}>
                                            {totalReleaseCosts > 0 ? 'Edit Costs' : 'Add Costs'}
                                        </Button>
                                    </div>
                                </>)}
                            </div>

                            {expanded[rel.title] && (
                                <div className="tracks-section">
                                    <div className="full-release-summary">
                                        <div className="tracks-label">Full release sales</div>

                                        <div className="full-release-stats">
                                            <div className="track-stats">
                                                {rel.albumSales} sales · {formatMoney(Number(rel.albumRevenue || 0), currencySymbolFor(rel.currency))}
                                            </div>
                                        </div>
                                    </div>

                                    {(tracksByRelease[rel.title] || []).length > 0 && (
                                        <div className="tracks-total">
                                            <div className="tracks-label">Tracks sales total</div>

                                            <div className="track-stats">
                                                {(tracksByRelease[rel.title] || []).reduce((sum, t) => sum + t.sales, 0)} sales · {formatMoney(((tracksByRelease[rel.title] || []).reduce((sum, t) => sum + Number(t.revenue), 0)), currencySymbolFor(rel.currency))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="tracks-list">
                                        {((tracksByRelease[rel.title] || []).slice().sort((a, b) => b.sales - a.sales)).map((t, idx) => (
                                            <div key={`${t.title}-${idx}`} className="track-item">
                                                <div className="track-title">{t.title}</div>

                                                <div className="track-stats">{t.sales} sales · {formatMoney(Number(t.revenue), currencySymbolFor(rel.currency))}</div>
                                            </div>
                                        ))}

                                        {(!(tracksByRelease[rel.title] || []).length) && (
                                            <div className="tracks-empty">No individual track sales recorded for this release.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <Drawer title={`Costs: ${editingRelease}`} placement="right" onClose={closeDrawer} open={drawerVisible} width={360}>
                {editingRelease && (
                    <CostsForm
                        initial={costs[editingRelease] ?? EMPTY_COSTS}
                        onCancel={closeDrawer}
                        onApply={async (nextCosts) => {
                            await saveCostsForRelease(editingRelease, nextCosts);
                            closeDrawer();
                        }}
                        netRevenue={editingReleaseBandcampIncome}
                        currencySymbol={editingReleaseCurrencySymbol}
                    />
                )}
            </Drawer>
        </div>
    );
};
