import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import '../styles/ReleasesList.css';

export const ReleasesList: React.FC = () => {
  const { releases, tracks } = useData();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
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
        <h2>📚 Releases</h2>
      </div>

      <div className="releases-grid">
        {releases.slice().sort((a, b) => b.totalRevenue - a.totalRevenue).map(rel => (
          <div key={rel.title} className="release-card" onClick={() => toggle(rel.title)}>
            <div className="release-header">
              <div className="release-info">
                <div className="release-title">{rel.title}</div>
              </div>
              
              <div className="release-stats">
                <div className="release-revenue">
                    <span className="release-sales">{rel.totalSales} sales</span> · €{rel.totalRevenue?.toFixed ? rel.totalRevenue.toFixed(2) : Number(rel.totalRevenue).toFixed(2)}
                </div>

                {/* <button className="toggle-tracks-btn">{expanded[rel.title] ? 'Hide tracks' : 'Show tracks'}</button> */}
              </div>
            </div>

            {expanded[rel.title] && (
              <div className="tracks-section">
                <div className="full-release-summary">
                  <div className="tracks-label">Full release sales</div>

                  <div className="full-release-stats">
                    <div className="track-stats">{rel.albumSales} sales · €{rel.albumRevenue?.toFixed ? rel.albumRevenue.toFixed(2) : Number(rel.albumRevenue).toFixed(2)}</div>
                  </div>
                </div>

                <div className="tracks-label">Tracks</div>

                <div className="tracks-list">
                  {((tracksByRelease[rel.title] || []).slice().sort((a, b) => b.sales - a.sales)).map((t, idx) => (
                    <div key={`€{t.title}-€{idx}`} className="track-item">
                      <div className="track-title">{t.title}</div>

                      <div className="track-stats">{t.sales} sales · €{Number(t.revenue).toFixed(2)}</div>
                    </div>
                  ))}

                  {(!(tracksByRelease[rel.title] || []).length) && (
                    <div className="tracks-empty">No individual track sales recorded for this release.</div>
                  )}
                </div>

                {(tracksByRelease[rel.title] || []).length > 0 && (
                  <div className="tracks-total">
                    <div className="tracks-label">Tracks total</div>

                    <div className="track-stats">
                      {(tracksByRelease[rel.title] || []).reduce((sum, t) => sum + t.sales, 0)} sales · €{((tracksByRelease[rel.title] || []).reduce((sum, t) => sum + Number(t.revenue), 0)).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
