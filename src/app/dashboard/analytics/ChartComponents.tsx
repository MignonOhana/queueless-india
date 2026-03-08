"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PeakHoursChartProps {
  data: { hour: string; customers: number }[];
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
        <XAxis 
          dataKey="hour" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10 }} 
          dy={10} 
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip 
          cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
          contentStyle={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
            borderRadius: '12px', border: 'none', color: '#fff' 
          }} 
        />
        <Bar 
          dataKey="customers" 
          name="Avg Customers"
          fill="#6366f1" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
