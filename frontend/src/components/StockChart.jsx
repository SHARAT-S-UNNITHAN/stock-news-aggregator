import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ ticker }) {
  // This would need real stock price data from an API
  const mockData = [
    { date: '2024-01-01', price: 150 },
    { date: '2024-01-02', price: 152 },
    { date: '2024-01-03', price: 148 },
    { date: '2024-01-04', price: 153 },
    { date: '2024-01-05', price: 155 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{ticker} Price Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;