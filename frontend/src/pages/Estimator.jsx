import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Calculator, Sparkles, Clock, DollarSign, Star, Tag, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

const SAMPLES = [
  'Kitchen sink is leaking and the drain is clogged',
  'AC is blowing hot air and making a loud noise',
  'Wall outlet is sparking and the breaker keeps tripping',
  'Refrigerator stopped cooling and water is on the floor',
];

export default function Estimator() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [offers, setOffers] = useState([]);
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    API.get('/coupons').then((r) => setOffers(r.data)).catch(() => {});
  }, []);

  const run = async (description = text) => {
    if (!description.trim()) return;
    setBusy(true);
    setError('');
    setCoupon(null);
    try {
      const res = await API.post('/assistant/estimate', { description });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate an estimate right now.');
    } finally {
      setBusy(false);
    }
  };

  const midpoint = result ? Math.round((result.estimate.estimatedCostRange.min + result.estimate.estimatedCostRange.max) / 2) : 0;

  const applyCoupon = async (value = code) => {
    if (!value.trim() || !result) return;
    try {
      const res = await API.post('/coupons/validate', { code: value, amount: midpoint });
      setCoupon(res.data);
    } catch (err) {
      setCoupon({ valid: false, reason: 'Could not validate coupon' });
    }
  };

  const est = result?.estimate;

  return (
    <div className="bg-hero min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow"><Calculator className="w-3.5 h-3.5" /> Free · no signup</span>
          <h1 className="section-title mt-3">Instant AI cost estimator</h1>
          <p className="text-slate-600 mt-3">Describe the problem in plain English. We classify it, estimate cost and time, and show the best-matched verified pros.</p>
        </div>

        <div className="card rounded-3xl p-5 sm:p-6 mt-8">
          <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. My kitchen sink is leaking and water is pooling under the cabinet…" className="input" />
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button key={s} onClick={() => { setText(s); run(s); }} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700">{s}</button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => run()} disabled={busy || !text.trim()} className="btn-primary">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Sparkles className="w-4 h-4" /> Get estimate</>}
            </button>
            {error && <span className="text-sm text-rose-600">{error}</span>}
          </div>
        </div>

        {est && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5 animate-pop">
            <div className="card rounded-3xl p-6 lg:col-span-3 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Detected</span>
                <span className="text-lg font-extrabold text-slate-900">{est.categoryName}</span>
                <StatusBadge status={est.urgency} />
                <span className="ml-auto rounded-full badge-ai px-2.5 py-1 text-xs font-bold">{Math.round(est.confidenceScore * 100)}% confidence</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><DollarSign className="w-3.5 h-3.5" /> Estimated cost</div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-slate-900">${est.estimatedCostRange.min} - ${est.estimatedCostRange.max}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Clock className="w-3.5 h-3.5" /> Est. duration</div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-slate-900">~{est.estimatedDurationHours}h</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">Skills required</div>
                <div className="flex flex-wrap gap-1.5">
                  {est.skillsRequired.map((s) => <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{s}</span>)}
                  {est.extractedKeyTerms.map((s) => <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">#{s}</span>)}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700"><Tag className="w-4 h-4" /> Apply a coupon (on ~${midpoint})</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {offers.map((o) => (
                    <button key={o.code} onClick={() => { setCode(o.code); applyCoupon(o.code); }} className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100" title={o.description}>{o.code}</button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" className="input !py-2 !text-xs max-w-[12rem]" />
                  <button onClick={() => applyCoupon()} className="btn-outline !py-2 !px-4 !text-xs">Apply</button>
                </div>
                {coupon && (
                  <p className={`mt-2 text-sm font-semibold ${coupon.valid ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {coupon.valid ? <><CheckCircle2 className="inline w-4 h-4 mr-1" />You save ${coupon.discount} → about ${coupon.finalAmount}</> : coupon.reason}
                  </p>
                )}
              </div>
            </div>

            <div className="card rounded-3xl p-6 lg:col-span-2">
              <h2 className="text-base font-extrabold text-slate-900">Best-matched pros</h2>
              <p className="text-xs text-slate-500">Ranked by skills, area, rating, verification &amp; price.</p>
              <div className="mt-4 space-y-3">
                {result.providers.length === 0 && <p className="text-sm text-slate-500">No verified providers found yet.</p>}
                {result.providers.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{p.businessName || p.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-400" />{Number(p.rating).toFixed(1)} · ${p.hourlyRate}/hr</div>
                      </div>
                      <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">{p.matchScore}%</span>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                      {p.matchReasons.slice(0, 3).map((r) => <li key={r}>• {r}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <Link to={user ? (user.role === 'customer' ? '/customer-dashboard?tab=requests' : '/') : '/register'} className="btn-primary w-full mt-5">
                {user ? 'Create a request' : 'Sign up to book'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
