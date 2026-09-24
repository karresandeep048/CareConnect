import React, { useState } from 'react';
import API from '../services/api';
import { AlertTriangle, X, Star, CheckCircle2, Loader2 } from 'lucide-react';

export default function SOSModal({ defaultZip = '', onClose, onDispatched }) {
  const [description, setDescription] = useState('');
  const [zipCode, setZipCode] = useState(defaultZip);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await API.post('/requests/sos', { description, serviceAddress: { zipCode } });
      setResult(res.data);
      onDispatched && onDispatched(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not dispatch SOS. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card rounded-3xl w-full max-w-lg overflow-hidden animate-pop">
        <div className="bg-gradient-to-r from-rose-600 to-orange-500 text-white px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></span>
            <div>
              <h3 className="text-lg font-extrabold">Emergency SOS</h3>
              <p className="text-xs text-white/85">Priority dispatch to the 3 best-matched verified pros</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-white/15"><X className="w-5 h-5" /></button>
        </div>

        {!result ? (
          <form onSubmit={submit} className="p-6 space-y-4">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">What is happening?</span>
              <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Pipe burst under the kitchen sink, water flooding the floor" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Service zip code</span>
              <input required value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="10001" className="input mt-1" />
            </label>
            <p className="text-xs text-slate-500">A 25% priority premium applies to emergency jobs. For gas leaks, fire or electric shock call your local emergency number first.</p>
            <button disabled={busy} className="btn-danger w-full !py-3">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching…</> : 'Send SOS now'}
            </button>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold"><CheckCircle2 className="w-5 h-5" /> SOS dispatched to {result.dispatched.length} pros</div>
            <p className="text-sm text-slate-600">
              Classified as <b>{result.request.categoryName}</b> · estimated ${result.request.estimatedCostRange.min}-${result.request.estimatedCostRange.max} (incl. {result.surchargePercent}% priority premium). Quotes will appear in your requests shortly.
            </p>
            <div className="space-y-2">
              {result.dispatched.map((p) => (
                <div key={p.providerId} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{p.businessName || p.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-400" />{Number(p.rating).toFixed(1)} · ${p.hourlyRate}/hr</div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">{p.matchScore}% match</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
