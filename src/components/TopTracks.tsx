import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Charts.css';
import { useData } from '../context/DataContext';

export const TopTracks: React.FC = () => {
  const { tracks } = useData();
  const [sortBy, setSortBy] = useState<'sales' | 'revenue'>('sales');

  const chartData = useMemo(() => {
    return tracks
      .slice()
      .sort((a, b) => (sortBy === 'sales' ? b.sales - a.sales : b.revenue - a.revenue))
      .slice(0, 15)
      .map(t => ({ name: t.title.length > 20 ? t.title.substring(0, 20) + '...' : t.title, fullName: t.title, sales: t.sales, revenue: Math.round(t.revenue * 100) / 100, release: t.releaseTitle }));
  }, [tracks, sortBy]);

  if (!tracks || tracks.length === 0) {
    return <div className="chart-container"><p className="no-data">No tracks data available</p></div>;
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>🎵 Top Tracks</h2>
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'sales' | 'revenue')}>
            <option value="sales">Sales Count</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 300, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={290} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => Math.round(value as number)} />
          <Bar dataKey={sortBy} fill={sortBy === 'sales' ? '#ffc658' : '#ff7c7c'} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
