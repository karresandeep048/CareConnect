import React, { useState } from 'react';
import API from '../services/api';
import { DollarSign, Clock, Calendar, FileText, X, Send } from 'lucide-react';

export default function QuoteModal({ request, onClose, onQuoteSubmitted }) {
  const [price, setPrice] = useState(request.estimatedCostRange?.min || 75);
  const [estimatedHours, setEstimatedHours] = useState(request.estimatedDurationHours || 2);
  const [proposedDate, setProposedDate] = useState(request.preferredDate || new Date().toISOString().split('T')[0]);
  const [proposedTimeSlot, setProposedTimeSlot] = useState(request.preferredTimeSlot || '09:00 - 11:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '08:00 - 10:00',
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/quotes', {
        serviceRequestId: request._id,
        price: Number(price),
        estimatedHours: Number(estimatedHours),
        proposedDate,
        proposedTimeSlot,
        notes
      });
      if (onQuoteSubmitted) onQuoteSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-200 shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Submit Service Quote</h3>
          <p className="text-xs text-slate-500">Request: <span className="text-slate-700 font-medium">"{request.title}"</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Quote Price ($)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min="10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Est. Range: ${request.estimatedCostRange?.min} - ${request.estimatedCostRange?.max}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Est. Duration (Hours)</label>
              <input
                type="number"
                required
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Proposed Service Date</label>
              <input
                type="date"
                required
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Proposed Time Slot</label>
            <select
              value={proposedTimeSlot}
              onChange={(e) => setProposedTimeSlot(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Message / Service Scope Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail warranty, equipment used, or preparation instructions..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              <Send className="w-4 h-4" /> Send Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
