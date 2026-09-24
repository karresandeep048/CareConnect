import React from 'react';

export default function StatusBadge({ status, type = 'request' }) {
  const getBadgeStyle = () => {
    switch (status) {
      // Request / Booking Statuses
      case 'OPEN':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'QUOTED':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
      case 'BOOKED':
      case 'SCHEDULED':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'IN_PROGRESS':
        return 'bg-teal-500/10 text-teal-700 border-teal-500/30 animate-pulse';
      case 'WORK_COMPLETE':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      case 'COMPLETED':
      case 'PAID':
      case 'verified':
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40';
      case 'CANCELLED':
      case 'REJECTED':
      case 'UNPAID':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/30';
      case 'DISPUTED':
      case 'UNDER_REVIEW':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/50';
      case 'High':
      case 'Emergency':
        return 'bg-rose-500/20 text-rose-600 border-rose-500/40 font-bold';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
      case 'Low':
        return 'bg-slate-500/20 text-slate-600 border-slate-500/30';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle()}`}>
      {status ? status.replace('_', ' ') : 'N/A'}
    </span>
  );
}
