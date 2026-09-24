import React, { useState, useEffect } from 'react';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { LifeBuoy, AlertTriangle, CheckCircle, RefreshCw, DollarSign, FileText } from 'lucide-react';

export default function SupportDashboard() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await API.get('/disputes');
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    try {
      await API.put(`/disputes/${selectedDispute._id}/resolve`, {
        resolutionType: refundAmount > 0 ? 'FULL_REFUND' : 'DISMISSED',
        refundAmount: Number(refundAmount),
        notes
      });
      setSelectedDispute(null);
      fetchDisputes();
      alert('Dispute ticket resolved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold mb-2">
            <LifeBuoy className="w-3.5 h-3.5" /> Customer Support & Dispute Desk
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dispute Queue & Refund Processing</h1>
          <p className="text-xs text-slate-500 mt-1">Review ticket claims, communicate with parties, and issue refunds</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Support Ticket Queue ({disputes.length})</h3>

        {disputes.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs rounded-2xl">
            No dispute tickets currently open.
          </div>
        ) : (
          disputes.map((d) => (
            <div key={d._id} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Ticket #{d.ticketId}</span>
                  <StatusBadge status={d.status} />
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 font-semibold">{d.reason}</span>
                </div>
                {d.status === 'OPEN' && (
                  <button
                    onClick={() => {
                      setSelectedDispute(d);
                      setRefundAmount(d.booking?.totalPrice || 50);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Resolve & Issue Refund
                  </button>
                )}
              </div>

              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium mb-1">Claim Description:</span>
                "{d.description}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div>Raised By: <span className="text-slate-900 font-medium">{d.raisedBy?.name} ({d.raisedBy?.role})</span></div>
                <div>Against: <span className="text-slate-900 font-medium">{d.againstUser?.name} ({d.againstUser?.role})</span></div>
              </div>

              {d.resolution?.resolvedAt && (
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-700">
                  <span className="font-bold">Resolution Notes:</span> {d.resolution.notes} (Refund Issued: ${d.resolution.refundAmount})
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <h3 className="text-lg font-bold text-slate-900">Resolve Ticket #{selectedDispute.ticketId}</h3>
            <form onSubmit={handleResolveDispute} className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1">Refund Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Resolution Summary / Notes</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="State resolution rationale..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setSelectedDispute(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Complete Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
