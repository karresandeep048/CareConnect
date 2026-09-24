import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from './Login';
import {
  User, Briefcase, Shield, Activity, LifeBuoy, Sparkles, ArrowRight, Copy, Check, Layers, Server, Database, Cpu,
  Lock, GitBranch, FlaskConical, Container, Gauge, AlertTriangle, Tag, Bot,
} from 'lucide-react';

const ROLES = [
  { role: 'customer', label: 'Customer', icon: User, tone: 'bg-brand-50 text-brand-700', points: ['AI request classification', 'Emergency SOS dispatch', 'Quote comparison & coupons', 'Live job tracker & invoices', 'Reviews and disputes'] },
  { role: 'provider', label: 'Service Provider', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-700', points: ['Open-requests feed', 'Transparent quote submission', 'Availability & service areas', 'Proof-of-work photo upload', 'Earnings & invoices'] },
  { role: 'admin', label: 'Platform Admin', icon: Shield, tone: 'bg-violet-50 text-violet-700', points: ['Provider verification queue', 'Category management', 'Platform analytics', 'System audit logs'] },
  { role: 'ops_manager', label: 'Ops Manager', icon: Activity, tone: 'bg-amber-50 text-amber-700', points: ['Global dispatch board', 'Quality monitoring', 'SLA breach tracking'] },
  { role: 'support_agent', label: 'Support Agent', icon: LifeBuoy, tone: 'bg-rose-50 text-rose-700', points: ['Dispute ticket queue', 'Evidence review', 'Refund processing'] },
];

const WALKTHROUGH = [
  { role: 'customer', title: 'Customer: describe a problem', text: 'Use the AI classifier or the red SOS button. Watch category, urgency and cost range appear instantly.' },
  { role: 'provider', title: 'Provider: quote the job', text: 'Open the requests feed, submit a transparent quote with a proposed time slot.' },
  { role: 'customer', title: 'Customer: accept with a coupon', text: 'Compare quotes, apply WELCOME10, and book. The slot is locked and the invoice reflects the discount.' },
  { role: 'ops_manager', title: 'Ops: monitor the platform', text: 'See the dispatch board and SLA tracking across every booking.' },
  { role: 'admin', title: 'Admin: analytics & verification', text: 'Review charts, the provider verification queue and audit logs.' },
  { role: 'support_agent', title: 'Support: resolve disputes', text: 'Work the ticket queue and process refunds.' },
];

const WEIGHTS = [
  { label: 'Skill overlap', pct: 35, color: 'bg-brand-600' },
  { label: 'Service area (zip / city)', pct: 25, color: 'bg-blue-600' },
  { label: 'Verification + rating', pct: 25, color: 'bg-violet-600' },
  { label: 'Price alignment', pct: 15, color: 'bg-amber-500' },
];

const STACK = ['React 18', 'Vite', 'Tailwind CSS', 'Chart.js', 'Node.js', 'Express', 'MongoDB / Mongoose', 'JWT + bcrypt', 'Docker Compose', 'GitHub Actions CI', 'node:test'];

const RESUME_BULLETS = [
  'Built CareConnect, a full-stack MERN home-services marketplace with 5 role-based dashboards (RBAC via JWT), 40+ REST endpoints and 12 Mongoose models.',
  'Designed an AI request classifier and a weighted provider-matching engine (skills 35%, service area 25%, rating/verification 25%, price 15%) that ranks providers in real time.',
  'Implemented a conflict-free scheduling engine, proof-of-work job tracking with verification codes, invoicing, dispute resolution and audit logging.',
  'Added an emergency SOS dispatch flow, a server-validated coupon engine, and CareBot - a rule-based conversational assistant with intent detection.',
  'Hardened the API with rate limiting, request logging and unit tests, and containerised the stack with Docker Compose plus a GitHub Actions CI pipeline.',
];

export default function Showcase() {
  const { quickDemoLogin, user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState(false);

  const demo = async (role) => {
    setBusy(role);
    const res = await quickDemoLogin(role);
    setBusy('');
    if (res.success) navigate(ROLE_HOME[role]);
  };

  const copyBullets = async () => {
    try {
      await navigator.clipboard.writeText(RESUME_BULLETS.map((b) => `• ${b}`).join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard unavailable */
    }
  };

  const layers = [
    { icon: Layers, title: 'React SPA', text: 'Role-aware routing, Context auth, Chart.js dashboards, CareBot widget', tone: 'bg-brand-50 text-brand-700' },
    { icon: Server, title: 'Express REST API', text: 'JWT auth · RBAC middleware · rate limiting · request logging · error handler', tone: 'bg-blue-50 text-blue-700' },
    { icon: Cpu, title: 'Domain services', text: 'AI classifier · provider matching · availability engine · coupon engine · CareBot intents · notifications', tone: 'bg-violet-50 text-violet-700' },
    { icon: Database, title: 'MongoDB', text: 'Users, providers, requests, quotes, bookings, invoices, reviews, disputes, coupons, audit logs', tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div>
      <section className="bg-hero">
        <div className="max-w-5xl mx-auto px-4 pt-14 pb-12 text-center">
          <span className="eyebrow"><Sparkles className="w-3.5 h-3.5" /> Project showcase</span>
          <h1 className="section-title mt-3">CareConnect, explained in 5 minutes</h1>
          <p className="text-slate-600 mt-4 max-w-3xl mx-auto">
            Finding a trustworthy home-service professional is slow, opaque and risky. CareConnect uses AI to understand the
            problem, matches the best verified pros, locks a conflict-free slot, and keeps everyone accountable with
            proof-of-work tracking, invoices and dispute handling.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[['5', 'User roles'], ['40+', 'REST endpoints'], ['12', 'Data models'], ['7', 'Automated tests']].map(([v, l]) => (
              <div key={l} className="card rounded-2xl py-4">
                <div className="font-display text-2xl font-extrabold text-brand-700">{v}</div>
                <div className="text-xs text-slate-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Walkthrough */}
      <section className="max-w-5xl mx-auto px-4 mt-12">
        <h2 className="section-title !text-2xl sm:!text-3xl">Judge's walkthrough</h2>
        <p className="text-slate-500 text-sm mt-1">Follow these steps - each button signs you in as that role instantly.</p>
        <ol className="mt-5 space-y-3">
          {WALKTHROUGH.map((s, i) => (
            <li key={s.title} className="card rounded-2xl p-4 flex items-center gap-4">
              <span className="w-9 h-9 shrink-0 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">{s.title}</div>
                <div className="text-sm text-slate-500">{s.text}</div>
              </div>
              <button onClick={() => demo(s.role)} disabled={!!busy} className="btn-outline !py-2 !px-4 !text-xs shrink-0">
                {busy === s.role ? 'Signing in…' : <>Open <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </li>
          ))}
        </ol>
        {user && <p className="text-xs text-slate-400 mt-2">Currently signed in as {user.name}. Opening another role switches the session.</p>}
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-4 mt-14">
        <h2 className="section-title !text-2xl sm:!text-3xl">Five roles, one platform</h2>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ROLES.map(({ label, icon: Icon, tone, points }) => (
            <div key={label} className="card rounded-2xl p-4">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></span>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">{label}</h3>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">{points.map((p) => <li key={p}>• {p}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* New in this version */}
      <section className="max-w-6xl mx-auto px-4 mt-14">
        <h2 className="section-title !text-2xl sm:!text-3xl">Standout features</h2>
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, title: 'Emergency SOS', text: 'Classifies the emergency, adds a priority premium and notifies the top 3 verified matches.', tone: 'bg-rose-50 text-rose-600' },
            { icon: Tag, title: 'Coupon engine', text: 'Percent discounts with caps, minimum order, expiry and usage limits - validated server-side.', tone: 'bg-amber-50 text-amber-600' },
            { icon: Bot, title: 'CareBot assistant', text: 'Intent detection for pricing, booking status, coupons and refunds with provider suggestions.', tone: 'bg-brand-50 text-brand-700' },
          ].map(({ icon: Icon, title, text, tone }) => (
            <div key={title} className="card rounded-2xl p-5">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></span>
              <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-5xl mx-auto px-4 mt-14">
        <h2 className="section-title !text-2xl sm:!text-3xl">Architecture</h2>
        <div className="mt-5 grid gap-3">
          {layers.map(({ icon: Icon, title, text, tone }, i) => (
            <React.Fragment key={title}>
              <div className="card rounded-2xl p-4 flex items-center gap-4">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}><Icon className="w-5 h-5" /></span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{title}</div>
                  <div className="text-sm text-slate-500">{text}</div>
                </div>
              </div>
              {i < layers.length - 1 && <div className="text-center text-slate-300 text-lg leading-none -my-1">↓</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Matching algorithm */}
      <section className="max-w-5xl mx-auto px-4 mt-14">
        <h2 className="section-title !text-2xl sm:!text-3xl">Provider matching algorithm</h2>
        <p className="text-sm text-slate-500 mt-1">Each provider gets a 0-99 match score for a request.</p>
        <div className="card rounded-2xl p-5 mt-4 space-y-3">
          {WEIGHTS.map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm"><span className="font-semibold text-slate-700">{label}</span><span className="font-bold text-slate-900">{pct}%</span></div>
              <div className="h-2.5 rounded-full bg-slate-100 mt-1"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct * 2.5}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering */}
      <section className="max-w-5xl mx-auto px-4 mt-14">
        <h2 className="section-title !text-2xl sm:!text-3xl">Engineering quality</h2>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Lock, t: 'Security', d: 'JWT, bcrypt hashing, RBAC middleware, suspended-account checks' },
            { icon: Gauge, t: 'Resilience', d: 'Rate limiting, central error handler, request logging' },
            { icon: FlaskConical, t: 'Testing', d: 'Unit tests for classifier, matching, coupons and intents' },
            { icon: Container, t: 'DevOps', d: 'Docker Compose and a GitHub Actions CI pipeline' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="card rounded-2xl p-4">
              <Icon className="w-5 h-5 text-brand-600" />
              <h3 className="mt-2 font-bold text-sm text-slate-900">{t}</h3>
              <p className="text-xs text-slate-500 mt-1">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STACK.map((s) => <span key={s} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{s}</span>)}
        </div>
      </section>

      {/* Resume */}
      <section className="max-w-5xl mx-auto px-4 mt-14">
        <div className="card rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><GitBranch className="w-5 h-5 text-brand-600" /> Resume-ready bullets</h2>
              <p className="text-xs text-slate-500">Paste these under the project on your resume.</p>
            </div>
            <button onClick={copyBullets} className="btn-outline !py-2 !px-4 !text-xs">
              {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {RESUME_BULLETS.map((b) => <li key={b} className="flex gap-2"><span className="text-brand-600">•</span>{b}</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}
