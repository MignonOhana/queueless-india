'use client';

interface StatusBadgeProps {
  status: 'WAITING' | 'SERVING' | 'SERVED' | 'SKIP' | 'CANCELLED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'WAITING':
        return { label: 'Waiting', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'SERVING':
        return { label: 'Now Serving', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' };
      case 'SERVED':
        return { label: 'Served', className: 'bg-primary/10 text-primary border-primary/20' };
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
