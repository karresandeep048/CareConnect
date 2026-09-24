import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import AIClassifierWidget from '../components/AIClassifierWidget';
import {
  Tv, Droplet, Zap, Wind, Sparkles, Hammer, ArrowRight, ShieldCheck, Search, Users,
  CalendarCheck, Camera, BarChart3, Tag, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Appliance Repair', icon: Tv, tone: 'bg-blue-50 text-blue-700', desc: 'Fridge, washer, oven & dishwasher' },
  { name: 'Plumbing', icon: Droplet, tone: 'bg-cyan-50 text-cyan-700', desc: 'Leaks, drains & pipe fitting' },
  { name: 'Electrical', icon: Zap, tone: 'bg-amber-50 text-amber-700', desc: 'Wiring, outlets & breakers' },
  { name: 'HVAC', icon: Wind, tone: 'bg-sky-50 text-sky-700', desc: 'AC, heating & thermostats' },
  { name: 'Cleaning', icon: Sparkles, tone: 'bg-emerald-50 text-emerald-700', desc: 'Deep clean & maintenance' },
  { name: 'Handyman', icon: Hammer, tone: 'bg-orange-50 text-orange-700', desc: 'Repairs & installations' },
];

const STEPS = [
  { icon: Sparkles, title: 'Describe the problem', text: 'Type it in plain English. Our AI detects the category, urgency, skills, duration and cost range.' },
  { icon: Users, title: 'Compare matched pros', text: 'A multi-factor engine scores providers on skills, area, rating, verification and price.' },
  { icon: CalendarCheck, title: 'Book a locked slot', text: 'Accept a quote and the scheduling engine guarantees no double-booking.' },
  { icon: Camera, title: 'Track, approve, pay', text: 'Verify the job with a code, review before/after photos, then pay - discounts applied.' },
];

const FEATURES = [
  { icon: AlertTriangle, title: 'Emergency SOS dispatch', text: 'One tap alerts the 3 best-matched verified pros near you.', tone: 'text-rose-600 bg-rose-50' },
  { icon: Tag, title: 'Coupons & rewards', text: 'Server-validated promo codes with caps, minimums and expiry.', tone: 'text-amber-600 bg-amber-50' },
  { icon: ShieldCheck, title: 'Verified professionals', text: 'Admin verification queue, documents and audit trail.', tone: 'text-emerald-600 bg-emerald-50' },
  { icon: BarChart3, title: 'Operations analytics', text: 'Live dashboards, SLA tracking and dispute workflows.', tone: 'text-violet-600 bg-violet-50' },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/public/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/providers?skill=${encodeURIComponent(query.trim())}` : '/providers');
  };

  const statItems = [
    { label: 'Verified pros', value: stats ? stats.verifiedProviders : '—' },
    { label: 'Jobs completed', value: stats ? stats.completedJobs : '—' },
    { label: 'Average rating', value: stats ? `${stats.averageRating} ★` : '—' },
    { label: 'Happy customers', value: stats ? stats.customers : '—' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-14 pb-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow"><Sparkles className="w-3.5 h-3.5" /> AI-powered home services</span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-slate-900">
              Fix anything at home, <span className="text-gradient">booked in minutes.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Describe the problem, get an instant AI estimate, compare matched verified pros and track the job from
              quote to payment - all in one place.
            </p>

            <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “plumbing”, “AC repair”, “wiring”…" className="input !pl-11 !py-3.5 shadow-card" />
              </div>
              <button className="btn-primary !py-3.5">Find pros <ArrowRight className="w-4 h-4" /></button>
            </form>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {['Verified professionals', 'Transparent quotes', 'Proof-of-work photos'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-600" />{t}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/estimate" className="btn-outline">Free cost estimator</Link>
              <Link to="/showcase" className="btn-outline">See how it works</Link>
            </div>
          </div>

          <div className="animate-pop">
            <AIClassifierWidget />
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 -mt-6 relative z-10">
        <div className="card rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {statItems.map((s) => (
            <div key={s.label} className="py-5 px-4 text-center">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-brand-700">{s.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Services</span>
            <h2 className="section-title mt-2">Every home need, one platform</h2>
          </div>
          <Link to="/services" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            All categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ name, icon: Icon, tone, desc }) => (
            <Link key={name} to={`/providers?skill=${encodeURIComponent(name)}`} className="card glass-panel-hover rounded-2xl p-4">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title mt-2">From problem to paid, in four steps</h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card rounded-2xl p-5 relative">
              <span className="absolute top-4 right-4 font-display text-4xl font-extrabold text-slate-100">{i + 1}</span>
              <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><Icon className="w-5 h-5" /></span>
              <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, text, tone }) => (
            <div key={title} className="card rounded-2xl p-5">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></span>
              <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-20">
        <div className="rounded-3xl bg-teal-gradient p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">Evaluating the project? Try every role in one click.</h2>
            <p className="mt-2 text-white/85 text-sm sm:text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Customer, Provider, Admin, Ops Manager and Support Agent - no signup needed.</p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors shrink-0">
            Open demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
