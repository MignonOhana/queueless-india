'use client';

import QRCode from 'react-qr-code';

export function TokenCard({ token, business }: { token: any; business: any }) {
  const tokenUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/track/${token.id}`;
  const isServing = token.status === 'SERVING';
  const isWaiting = token.status === 'WAITING';

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg transition-all ${
        isServing
          ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-500'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{business?.name || 'Business'}</p>
          <p className="text-xs text-slate-400">{business?.location || ''}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isServing
              ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
              : isWaiting
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          {isServing ? '🔔 Your Turn!' : token.status}
        </span>
      </div>

      {/* Token Number - Big and Bold */}
      <div className="text-center my-6">
        <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tight">
          {token.tokenNumber}
        </p>
        <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Token Number</p>
      </div>

      {/* Wait Info */}
      {isWaiting && (
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 mb-4 border border-blue-100 dark:border-blue-500/20">
          <div className="flex justify-between">
            <div className="text-center flex-1">
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                {token.estimatedWaitMins || '—'}
              </p>
              <p className="text-[10px] text-blue-500 dark:text-blue-400/70 uppercase font-bold tracking-wider">
                Est. Wait (mins)
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                {token.estimatedWaitMins
                  ? new Date(Date.now() + token.estimatedWaitMins * 60000).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata',
                    })
                  : '—'}
              </p>
              <p className="text-[10px] text-blue-500 dark:text-blue-400/70 uppercase font-bold tracking-wider">
                Expected At (IST)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Serving animation */}
      {isServing && (
        <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 mb-4 text-center border border-green-200 dark:border-green-500/20">
          <p className="text-lg font-black text-green-700 dark:text-green-400">
            Please proceed to the counter
          </p>
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center mt-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <QRCode value={tokenUrl} size={100} bgColor="#ffffff" fgColor="#000000" />
          <p className="text-[10px] text-center text-slate-400 mt-2 uppercase font-bold tracking-wider">
            Show at counter
          </p>
        </div>
      </div>

      {/* Token metadata */}
      <div className="mt-4 text-[10px] text-slate-400 text-center space-y-0.5">
        <p>
          Issued:{' '}
          {token.createdAt
            ? new Date(token.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            : 'Just now'}
        </p>
        <p>#{token.id?.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>
  );
}
