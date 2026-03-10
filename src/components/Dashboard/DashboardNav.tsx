'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, BarChart3, Settings, Monitor, Users, QrCode } from 'lucide-react';

interface DashboardNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tvUrl: string;
}

export default function DashboardNav({ activeTab, setActiveTab, tvUrl }: DashboardNavProps) {
  const tabs = [
    { id: 'Overview', icon: Users, label: 'Queue' },
    { id: 'QR', icon: QrCode, label: 'Materials' },
    { id: 'Analytics', icon: BarChart3, label: 'Stats' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 lg:hidden">
      <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="relative flex flex-col items-center gap-1 p-3 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#00F5A0]/10 border border-[#00F5A0]/20 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={20} className={isActive ? 'text-[#00F5A0]' : 'text-zinc-500'} />
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-[#00F5A0]' : 'text-zinc-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        
        <a
          href={tvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 p-3 min-w-[64px] text-zinc-500"
        >
          <Monitor size={20} />
          <span className="text-[10px] font-black uppercase tracking-tighter">TV Mode</span>
        </a>
      </div>
    </div>
  );
}
