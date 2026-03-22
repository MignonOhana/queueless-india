"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend
} from "recharts";
import { useEffect, useState } from "react";

// In a real app, this data would be derived from the Firestore `servedAt` timestamps
// For the UI demonstration, we generate realistic looking hourly traffic data.
const generateMockTrafficData = () => {
  const data = [];
  const startHour = 8; // 8 AM
  for (let i = 0; i < 10; i++) {
    const hour = startHour + i;
    const timeStr = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    data.push({
      time: timeStr,
      customers: Math.floor(Math.random() * 40) + 10,
      waitMins: Math.floor(Math.random() * 20) + 5,
      efficiencyScore: Math.floor(Math.random() * 30) + 70 // 70 to 100% staff efficiency
    });
  }
  return data;
};

export default function QueueChart() {
  const [data, setData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(generateMockTrafficData());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col justify-between">
         <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
         </div>
         <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl mt-6"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Customer Traffic</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Total visitors per hour</p>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderRadius: '16px',
                border: 'none',
                color: '#fff',
                fontFamily: 'sans-serif',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
              }} 
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            <Area 
              type="monotone" 
              dataKey="customers" 
              name="Flow (Tokens)"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCustomers)" 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            
            <Line 
              type="monotone" 
              dataKey="efficiencyScore"
              name="Staff Efficiency (%)" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="waitMins"
              name="Avg Wait (Mins)" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
