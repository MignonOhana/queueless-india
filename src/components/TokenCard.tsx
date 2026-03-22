'use client';

import QRCode from 'react-qr-code';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TokenCard({ token, business }: { token: any; business: any }) {
  const [now] = useState(() => Date.now());
  const tokenUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/track/${token.id}`;
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
                  ? new Date(now + token.estimatedWaitMins * 60000).toLocaleTimeString('en-IN', {
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

      {/* WhatsApp Actions */}
      {business?.whatsapp_enabled && business?.phone && (
        <div className="mt-4">
          <a
            href={`https://wa.me/${business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hi, my token number is ${token.tokenNumber}. Please let me know when it's my turn.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.39-4.412 9.883-9.886 9.883m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Message Business
          </a>
        </div>
      )}

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
