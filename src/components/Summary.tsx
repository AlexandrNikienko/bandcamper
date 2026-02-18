import React from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, Banknote } from 'lucide-react';
import '../styles/Summary.css';

export const Summary: React.FC = () => {
  const { summary } = useData();

  if (!summary) {
    return <div className="summary-container"><p className="loading">No data yet. Upload a CSV to start.</p></div>;
  }

  return (
    <div className="summary-container">
      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={40} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">{summary.totalSales}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Banknote size={40} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Net Revenue</div>
            <div className="stat-value">€{summary.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* <div className="stat-card">
          <div className="stat-icon">💿</div>
          <div className="stat-content">
            <div className="stat-label">Releases</div>
            <div className="stat-value">{summary.releaseCount}</div>
          </div>
        </div> */}

        {/* <div className="stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-content">
            <div className="stat-label">Tracks</div>
            <div className="stat-value">{summary.trackCount}</div>
          </div>
        </div> */}
      </div>

      {/* <div className="highlights">
        {summary.topRelease && (
          <div className="highlight-card">
            <h3>🏆 Top Release</h3>
            <p className="highlight-title">{summary.topRelease.title}</p>
            <p className="highlight-stat">{summary.topRelease.totalSales} sales · ${summary.topRelease.totalRevenue.toFixed(2)}</p>
          </div>
        )}

        {summary.topTrack && (
          <div className="highlight-card">
            <h3>⭐ Top Track</h3>
            <p className="highlight-title">{summary.topTrack.title}</p>
            <p className="highlight-stat">{summary.topTrack.sales} sales · ${summary.topTrack.revenue.toFixed(2)}</p>
            <p className="highlight-release">from "{summary.topTrack.releaseTitle}"</p>
          </div>
        )}
      </div> */}
    </div>
  );
};
