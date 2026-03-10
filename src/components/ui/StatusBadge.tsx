'use client';

interface StatusBadgeProps {
  status: 'WAITING' | 'SERVING' | 'SERVED' | 'SKIP' | 'CANCELLED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'WAITING':
        return { label: 'Waiting', className: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' };
      case 'SERVING':
        return { label: 'Now Serving', className: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 animate-pulse' };
      case 'SERVED':
        return { label: 'Served', className: 'bg-[#00F5A0]/10 text-[#00F5A0] border-[#00F5A0]/20' };
      case 'SKIP':
      case 'CANCELLED':
        return { label: status === 'SKIP' ? 'No Show' : 'Cancelled', className: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      default:
        return { label: status, className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.className}`}>
      {config.label}
    </span>
  );
}
