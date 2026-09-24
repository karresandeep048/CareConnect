import React from 'react';
import { Calendar, Play, Camera, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function JobTimeline({ currentStatus }) {
  const steps = [
    { key: 'SCHEDULED', label: 'Slot Locked', icon: Calendar },
    { key: 'IN_PROGRESS', label: 'Service In Progress', icon: Play },
    { key: 'WORK_COMPLETE', label: 'Proof of Work Uploaded', icon: Camera },
    { key: 'COMPLETED', label: 'Job Confirmed & Paid', icon: CheckCircle2 }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'SCHEDULED': return 0;
      case 'IN_PROGRESS': return 1;
      case 'WORK_COMPLETE': return 2;
      case 'COMPLETED': return 3;
      case 'DISPUTED': return 2; // Paused at proof stage
      default: return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> Booking status: Cancelled
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(activeIdx / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? isCurrent
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50 scale-110 ring-4 ring-teal-500/20'
                      : 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-medium mt-2 text-center max-w-[80px] ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
