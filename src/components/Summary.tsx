import React from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, Banknote } from 'lucide-react';
import '../styles/Summary.css';
import { currencySymbolFor, formatMoney } from '../utils/utils';

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
            <div className="stat-label">Total Digital Sales</div>
            <div className="stat-value">{summary.totalSales}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Banknote size={40} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Bandcamp Income</div>
            <div className="stat-value">{formatMoney(summary.totalRevenue, currencySymbolFor(summary.currency))}</div> {/* TODO */}
          </div>
        </div>
      </div>

      <div className="highlights">
        {summary.topRelease && (
          <div className="highlight-card">
            <h3>🏆 Top Release</h3>
            <p className="highlight-title">{summary.topRelease.title}</p>
            <p className="highlight-stat">{summary.topRelease.totalSales} sales · {formatMoney(summary.topRelease.totalRevenue, currencySymbolFor(summary.currency))}</p>
          </div>
        )}

        {summary.topTrack && (
          <div className="highlight-card">
            <h3>⭐ Top Track</h3>
            <p className="highlight-title">{summary.topTrack.title}</p>
            <p className="highlight-stat">{summary.topTrack.sales} sales · {formatMoney(summary.topTrack.revenue, currencySymbolFor(summary.currency))}</p>
            <p className="highlight-release">from "{summary.topTrack.releaseTitle}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
