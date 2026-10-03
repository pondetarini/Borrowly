import React from 'react';
import { Clock, CheckCircle2, PlayCircle, RotateCcw, CheckCheck, AlertTriangle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  const config = {
    PENDING: {
      label: 'Pending Approval',
      bg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock
    },
    APPROVED: {
      label: 'Approved & Reserved',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2
    },
    ACTIVE: {
      label: 'Active Borrowing',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: PlayCircle
    },
    RETURN_REQUESTED: {
      label: 'Return Requested',
      bg: 'bg-slate-100 text-slate-600 border-slate-700',
      icon: RotateCcw
    },
    COMPLETED: {
      label: 'Completed & Returned',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCheck
    },
    OVERDUE: {
      label: 'Overdue Return',
      bg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-100 text-slate-600 border-slate-700',
      icon: XCircle
    },
    REJECTED: {
      label: 'Declined',
      bg: 'bg-slate-100 text-slate-600 border-slate-700',
      icon: XCircle
    }
  };

  const current = config[normalized] || {
    label: status,
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: Clock
  };

  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
};

export default StatusBadge;
