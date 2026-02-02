import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Charts.css';
import { useData } from '../context/DataContext';
import { TrendingUp } from 'lucide-react';

export const TopReleases: React.FC = () => {
  const { releases } = useData();
  const [sortBy, setSortBy] = useState<'sales' | 'revenue'>('sales');

  const chartData = useMemo(() => {
    return releases
      .slice()
      .sort((a, b) => (sortBy === 'sales' ? b.totalSales - a.totalSales : b.totalRevenue - a.totalRevenue))
      .slice(0, 15)
      .map(r => ({ name: r.title.length > 20 ? r.title.substring(0, 20) + '...' : r.title, fullName: r.title, sales: r.totalSales, revenue: Math.round(r.totalRevenue * 100) / 100 }));
  }, [releases, sortBy]);

  if (!releases || releases.length === 0) {
    return <div className="chart-container"><p className="no-data">No releases data available</p></div>;
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2><TrendingUp size={20} /> Top Releases</h2>
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
          <Bar dataKey={sortBy} fill={sortBy === 'sales' ? '#8884d8' : '#82ca9d'} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
