import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Shield, DollarSign, Activity, CheckCircle, XCircle, Plus,
  FileText, LifeBuoy, Briefcase, User, BarChart3, AlertTriangle, ArrowRight,
  RefreshCw, Lock, TrendingUp, Crown, ChevronRight, Search, Sparkles,
  ShieldCheck, CheckCircle2, CreditCard, Tag, RotateCcw, Layers
} from 'lucide-react';

const fmt = (n) => (n != null ? `$${Number(n).toFixed(2)}` : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '');

const TABS = [
  { id: 'overview',   label: 'Overview',       icon: BarChart3,  color: 'purple' },
  { id: 'customers',  label: 'Customers',       icon: User,       color: 'blue'   },
  { id: 'providers',  label: 'Providers',       icon: Briefcase,  color: 'emerald'},
  { id: 'bookings',   label: 'Live Dispatch',   icon: Activity,   color: 'amber'  },
  { id: 'requests',   label: 'All Requests',    icon: FileText,   color: 'teal'   },
  { id: 'invoices',   label: 'Financials',      icon: DollarSign, color: 'green'  },
  { id: 'disputes',   label: 'Support Tickets', icon: LifeBuoy,   color: 'rose'   },
  { id: 'categories', label: 'Categories',      icon: Tag,        color: 'violet' },
  { id: 'audits',     label: 'Audit Logs',      icon: Layers,     color: 'slate'  },
];

const C = {
  purple:  { bg: 'bg-purple-600',  light: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-500/30' },
  blue:    { bg: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-500/30'   },
  emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500/30'},
  amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-500/30'  },
  teal:    { bg: 'bg-teal-600',    light: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-500/30'   },
  green:   { bg: 'bg-green-600',   light: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-500/30'  },
  rose:    { bg: 'bg-rose-600',    light: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-500/30'   },
  violet:  { bg: 'bg-violet-600',  light: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-500/30' },
  slate:   { bg: 'bg-slate-700',   light: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-300'     },
};

function ConfirmDialog({ msg, onYes, onNo }) {
  return (
    <div className="fixed inset-0 z-[99] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-sm font-semibold text-slate-900">{msg}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onNo} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">Cancel</button>
          <button onClick={onYes} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Wrench');

  const [resolveModal, setResolveModal] = useState(null);
  const [refundAmt, setRefundAmt] = useState(0);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [anaRes, provRes, catRes, bookRes, reqRes, invRes, dispRes] = await Promise.all([
        API.get('/analytics/dashboard'),
        API.get('/providers'),
        API.get('/categories'),
        API.get('/bookings'),
        API.get('/requests'),
        API.get('/invoices'),
        API.get('/disputes'),
      ]);
      setAnalytics(anaRes.data);
      setProviders(provRes.data || []);
      setCategories(catRes.data || []);
      setAllBookings(bookRes.data || []);
      setAllRequests(reqRes.data || []);
      setAllInvoices(invRes.data || []);
      setDisputes(dispRes.data || []);
      const cusMap = {};
      [...(bookRes.data || []), ...(reqRes.data || [])].forEach(item => {
        const c = item.customer;
        if (c && c._id && !cusMap[c._id]) cusMap[c._id] = c;
      });
      setCustomers(Object.values(cusMap));
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const verifyProvider = async (id, status) => {
    try { await API.put(`/providers/${id}/verify`, { status }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/categories', { name: catName, description: catDesc, icon: catIcon, subcategories: [{ name: `${catName} Diagnostics`, basePriceEstimate: 80 }] });
      setShowCatModal(false); setCatName(''); setCatDesc(''); fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/disputes/${resolveModal._id}/resolve`, {
        resolutionType: Number(refundAmt) > 0 ? 'FULL_REFUND' : 'DISMISSED',
        refundAmount: Number(refundAmt), notes: resolutionNotes
      });
      setResolveModal(null); setRefundAmt(0); setResolutionNotes(''); fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed to resolve'); }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try { await API.put(`/bookings/${bookingId}/status`, { status }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
  };

  const handlePayInvoice = async (invoiceId) => {
    try { await API.post(`/invoices/${invoiceId}/pay`, { paymentMethod: 'Admin Override' }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Payment failed'); }
  };

  const handleUpdateRequestStatus = async (reqId, status) => {
    try { await API.put(`/requests/${reqId}/status`, { status }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const metrics = analytics?.metrics || {};
  const auditLogs = analytics?.auditLogs || [];

  const filtered = (arr, keys) => {
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter(item => keys.some(k => {
      const val = k.split('.').reduce((o, p) => o?.[p], item);
      return val && String(val).toLowerCase().includes(q);
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto animate-pulse">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading Master Control Panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {confirm && <ConfirmDialog msg={confirm.msg} onYes={() => { confirm.onYes(); setConfirm(null); }} onNo={() => setConfirm(null)} />}

      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30"
        style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #2d1b69 40%, #1a3a5c 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)' }} />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">Super Admin</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-semibold">Live</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Master Control Panel</h1>
              <p className="text-purple-200 text-xs mt-0.5">Full platform authority · All roles unified · {user?.name || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Revenue', value: fmt(metrics.totalPlatformRevenue), color: 'text-emerald-300' },
              { label: 'Bookings', value: allBookings.length, color: 'text-blue-300' },
              { label: 'Open Disputes', value: disputes.filter(d => d.status === 'OPEN').length, color: 'text-rose-300' },
            ].map(kpi => (
              <div key={kpi.label} className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/10">
                <div className={`text-lg font-extrabold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] text-white/60">{kpi.label}</div>
              </div>
            ))}
            <button onClick={fetchAll} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Volume', value: fmt(metrics.totalPlatformVolume), sub: `${fmt(metrics.totalPlatformRevenue)} commission`, icon: TrendingUp, color: 'emerald' },
          { label: 'Customers', value: metrics.totalCustomers || 0, sub: 'Registered users', icon: User, color: 'blue' },
          { label: 'Providers', value: `${metrics.totalProviders || 0}`, sub: `${metrics.pendingProviders || 0} pending`, icon: Briefcase, color: 'teal' },
          { label: 'Requests', value: metrics.totalRequests || 0, sub: `${metrics.completedBookings || 0} completed`, icon: FileText, color: 'violet' },
          { label: 'Active Jobs', value: metrics.activeBookings || 0, sub: 'In progress / scheduled', icon: Activity, color: 'amber' },
          { label: 'Open Disputes', value: metrics.openDisputes || 0, sub: 'Needs resolution', icon: LifeBuoy, color: 'rose' },
        ].map(card => {
          const c = C[card.color]; const Icon = card.icon;
          return (
            <div key={card.label} className={`glass-panel p-4 rounded-2xl border ${c.border} space-y-2`}>
              <div className={`w-8 h-8 rounded-xl ${c.light} flex items-center justify-center`}><Icon className={`w-4 h-4 ${c.text}`} /></div>
              <div className={`text-xl font-extrabold ${c.text}`}>{card.value}</div>
              <div><div className="text-[11px] font-semibold text-slate-700">{card.label}</div><div className="text-[10px] text-slate-400">{card.sub}</div></div>
            </div>
          );
        })}
      </div>

      {/* TAB NAV */}
      <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-200 pb-3">
        {TABS.map(tab => {
          const c = C[tab.color]; const Icon = tab.icon; const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? `${c.bg} text-white shadow-md` : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              <Icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      {activeTab !== 'overview' && activeTab !== 'audits' && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${TABS.find(t => t.id === activeTab)?.label}…`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-purple-400 text-slate-900" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><XCircle className="w-4 h-4" /></button>}
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-700" /> Requests by Service Category</h3>
            {(analytics?.requestsByCategory || []).map(cat => {
              const pct = Math.round((cat.count / (metrics.totalRequests || 1)) * 100);
              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="font-medium text-slate-700">{cat._id}</span><span className="text-slate-500">{cat.count} ({pct}%)</span></div>
                  <div className="w-full h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
            {[
              { label: 'Verify Pending Providers', count: metrics.pendingProviders || 0, color: 'emerald', tab: 'providers', icon: ShieldCheck },
              { label: 'Resolve Open Disputes', count: disputes.filter(d => d.status === 'OPEN').length, color: 'rose', tab: 'disputes', icon: LifeBuoy },
              { label: 'Unpaid Invoices', count: allInvoices.filter(i => i.paymentStatus === 'UNPAID').length, color: 'amber', tab: 'invoices', icon: CreditCard },
              { label: 'Open Requests', count: allRequests.filter(r => r.status === 'OPEN').length, color: 'blue', tab: 'requests', icon: FileText },
            ].map(action => {
              const c = C[action.color]; const Icon = action.icon;
              return (
                <button key={action.tab} onClick={() => setActiveTab(action.tab)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border ${c.border} ${c.light} hover:opacity-90 transition-all`}>
                  <div className="flex items-center gap-3"><Icon className={`w-4 h-4 ${c.text}`} /><span className={`text-xs font-semibold ${c.text}`}>{action.label}</span></div>
                  <div className="flex items-center gap-2"><span className={`text-lg font-extrabold ${c.text}`}>{action.count}</span><ChevronRight className={`w-4 h-4 ${c.text}`} /></div>
                </button>
              );
            })}
            <button onClick={() => setShowCatModal(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-violet-500/30 bg-violet-50 hover:bg-violet-100 transition-all">
              <Plus className="w-4 h-4 text-violet-700" /><span className="text-xs font-semibold text-violet-700">Add Service Category</span>
            </button>
          </div>
          <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-slate-700" /> Recent System Events</h3>
              <button onClick={() => setActiveTab('audits')} className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {auditLogs.slice(0, 6).map(log => (
                <div key={log._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <div><span className="font-bold text-purple-700">[{log.action}]</span><span className="text-slate-600 ml-2">{log.performedBy?.name || 'System'}</span></div>
                  <span className="text-slate-400">{fmtDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMERS ── */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">All Registered Customers ({customers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered(customers, ['name','email','phone']).map(c => {
              const cReqs = allRequests.filter(r => r.customer?._id === c._id);
              const cBooks = allBookings.filter(b => b.customer?._id === c._id);
              const cInvs = allInvoices.filter(i => i.customer?._id === c._id);
              return (
                <div key={c._id} className="glass-panel p-5 rounded-2xl border border-blue-500/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} alt={c.name} className="w-11 h-11 rounded-2xl object-cover border-2 border-blue-400/30" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                      {c.phone && <div className="text-[11px] text-slate-400">{c.phone}</div>}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">Customer</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {[['Requests', cReqs.length, 'teal'],['Bookings', cBooks.length, 'blue'],['Invoices', cInvs.length, 'emerald']].map(([l,v,col]) => (
                      <div key={l} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <div className={`font-bold text-${col}-700`}>{v}</div><div className="text-slate-400">{l}</div>
                      </div>
                    ))}
                  </div>
                  {cReqs.slice(0, 2).map(req => (
                    <div key={req._id} className="p-2.5 bg-teal-50 rounded-xl border border-teal-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium truncate max-w-[180px]">{req.title}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <StatusBadge status={req.status} />
                        <select defaultValue="" onChange={e => { if (e.target.value) { handleUpdateRequestStatus(req._id, e.target.value); e.target.value = ''; } }}
                          className="text-[10px] border border-slate-200 rounded-lg px-1 py-0.5 bg-white focus:outline-none">
                          <option value="" disabled>Change…</option>
                          {['OPEN','QUOTED','BOOKED','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PROVIDERS ── */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-slate-900 text-sm">All Service Providers ({providers.length})</h3>
            <div className="flex gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">✓ {providers.filter(p => p.verificationStatus === 'verified').length} Verified</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">⏳ {providers.filter(p => p.verificationStatus === 'pending').length} Pending</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-semibold">✗ {providers.filter(p => p.verificationStatus === 'rejected').length} Rejected</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered(providers, ['businessName','user.name','user.email']).map(p => {
              const pBooks = allBookings.filter(b => b.provider?._id === (p.user?._id || p.user));
              return (
                <div key={p._id} className={`glass-panel p-5 rounded-2xl border space-y-3 ${p.verificationStatus === 'pending' ? 'border-amber-500/30 bg-amber-50/30' : p.verificationStatus === 'verified' ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={p.user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'} alt={p.businessName} className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-400/30" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">{p.businessName}{p.verificationStatus === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}</div>
                        <div className="text-[11px] text-slate-500">{p.user?.email}</div>
                      </div>
                    </div>
                    <StatusBadge status={p.verificationStatus} />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{p.bio}</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center"><div className="font-bold text-emerald-700">${p.hourlyRate}/hr</div><div className="text-slate-400">Rate</div></div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center"><div className="font-bold text-amber-700">⭐ {p.ratingAvg?.toFixed(1) || '5.0'}</div><div className="text-slate-400">Rating</div></div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center"><div className="font-bold text-blue-700">{pBooks.length}</div><div className="text-slate-400">Jobs</div></div>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">{p.skills?.slice(0,5).map((sk,i) => <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">{sk}</span>)}</div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    {p.verificationStatus !== 'verified' && <button onClick={() => setConfirm({ msg: `Approve & verify "${p.businessName}"?`, onYes: () => verifyProvider(p._id, 'verified') })} className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Approve & Verify</button>}
                    {p.verificationStatus === 'verified' && <span className="flex-1 text-center text-[11px] text-emerald-700 font-semibold py-1.5">✓ Currently Verified</span>}
                    {p.verificationStatus !== 'rejected' && <button onClick={() => setConfirm({ msg: `Reject "${p.businessName}"?`, onYes: () => verifyProvider(p._id, 'rejected') })} className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-500/30 text-rose-600 text-[11px] font-bold flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Reject</button>}
                    {p.verificationStatus === 'rejected' && <button onClick={() => verifyProvider(p._id, 'pending')} className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-500/30 text-amber-700 text-[11px] font-bold flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Reinstate</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIVE DISPATCH (BOOKINGS) ── */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Platform-Wide Booking Dispatch ({allBookings.length})</h3>
            <div className="flex gap-2 text-[11px] flex-wrap">
              {['IN_PROGRESS','SCHEDULED','COMPLETED','DISPUTED'].map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">{s.replace('_',' ')}: {allBookings.filter(b => b.status === s).length}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filtered(allBookings, ['customer.name','provider.name','serviceRequest.title','status']).map(b => (
              <div key={b._id} className={`glass-panel p-5 rounded-2xl border space-y-3 ${b.status === 'IN_PROGRESS' ? 'border-amber-500/30' : b.status === 'DISPUTED' ? 'border-rose-500/30' : b.status === 'COMPLETED' ? 'border-emerald-500/20' : 'border-slate-200'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-900">{b.serviceRequest?.title || 'Service Booking'}</span><StatusBadge status={b.status} /></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span>👤 Customer: <strong className="text-slate-900">{b.customer?.name}</strong></span>
                      <span>🔧 Provider: <strong className="text-emerald-700">{b.provider?.name}</strong></span>
                      <span>📅 {b.scheduledDate} ({b.timeSlot})</span>
                      <span>💰 <strong className="text-slate-900">${b.totalPrice}</strong></span>
                    </div>
                    {b.verificationCode && <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-bold"><Lock className="w-2.5 h-2.5" /> Pass: {b.verificationCode}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select defaultValue="" onChange={e => { if (!e.target.value) return; const s = e.target.value; setConfirm({ msg: `Update booking to "${s}"?`, onYes: () => handleUpdateBookingStatus(b._id, s) }); e.target.value = ''; }}
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-purple-400">
                      <option value="" disabled>Admin: Change Status…</option>
                      {['SCHEDULED','IN_PROGRESS','WORK_COMPLETE','COMPLETED','DISPUTED','CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                    <Link to={`/booking/${b._id}`} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1">View Evidence <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                </div>
                {(b.workEvidence?.beforePhotos?.length > 0 || b.workEvidence?.afterPhotos?.length > 0) && (
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-600">Work Evidence:</p>
                    <div className="flex gap-2 flex-wrap">
                      {[...(b.workEvidence.beforePhotos||[]),...(b.workEvidence.afterPhotos||[])].map((url,i) => <img key={i} src={url} alt="evidence" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />)}
                    </div>
                    {b.workEvidence.completionNotes && <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">{b.workEvidence.completionNotes}</p>}
                  </div>
                )}
                {b.notes?.length > 0 && (
                  <div className="border-t border-slate-200 pt-2 space-y-1">
                    {b.notes.map((n,i) => <div key={i} className={`p-2 rounded-lg text-[11px] ${n.senderRole === 'customer' ? 'bg-blue-50 text-blue-900' : 'bg-emerald-50 text-emerald-900'}`}><span className="font-semibold capitalize">{n.senderRole}:</span> {n.text}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ALL REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">All Service Requests ({allRequests.length})</h3>
          <div className="space-y-3">
            {filtered(allRequests, ['title','description','customer.name','categoryName','status']).map(req => (
              <div key={req._id} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{req.title}</span>
                      <StatusBadge status={req.status} /><StatusBadge status={req.urgency} />
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-700 text-[10px] font-semibold">{req.categoryName}</span>
                    </div>
                    <p className="text-xs text-slate-600">{req.description}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 mt-1.5">
                      <span>👤 {req.customer?.name}</span>
                      <span>📅 {req.preferredDate} ({req.preferredTimeSlot})</span>
                      <span>📍 {req.serviceAddress?.zipCode}</span>
                      {req.estimatedCostRange && <span>💰 Est: ${req.estimatedCostRange.min}–${req.estimatedCostRange.max}</span>}
                    </div>
                  </div>
                  <select defaultValue="" onChange={e => { if (!e.target.value) return; handleUpdateRequestStatus(req._id, e.target.value); e.target.value = ''; }}
                    className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-purple-400 flex-shrink-0">
                    <option value="" disabled>Admin: Change Status…</option>
                    {['OPEN','QUOTED','BOOKED','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {req.aiMetadata?.classifiedCategory && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span className="text-purple-700">AI: <strong>{req.aiMetadata.classifiedCategory}</strong> ({Math.round((req.aiMetadata.confidenceScore||0)*100)}% confidence){req.aiMetadata.extractedKeyTerms?.length > 0 && ` · Terms: ${req.aiMetadata.extractedKeyTerms.join(', ')}`}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FINANCIALS ── */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Volume', value: fmt(allInvoices.reduce((s,i) => s+i.totalAmount, 0)), color: 'emerald' },
              { label: 'Platform Fees', value: fmt(allInvoices.reduce((s,i) => s+i.platformFee, 0)), color: 'violet' },
              { label: 'PAID Invoices', value: allInvoices.filter(i => i.paymentStatus === 'PAID').length, color: 'teal' },
              { label: 'UNPAID Invoices', value: allInvoices.filter(i => i.paymentStatus === 'UNPAID').length, color: 'rose' },
            ].map(s => {
              const c = C[s.color];
              return <div key={s.label} className={`glass-panel p-4 rounded-2xl border ${c.border}`}><div className={`text-xl font-extrabold ${c.text}`}>{s.value}</div><div className="text-xs text-slate-500 mt-0.5">{s.label}</div></div>;
            })}
          </div>
          <h3 className="font-bold text-slate-900 text-sm">All Invoices ({allInvoices.length})</h3>
          <div className="space-y-3">
            {filtered(allInvoices, ['invoiceNumber','customer.name','paymentStatus']).map(inv => (
              <div key={inv._id} className={`glass-panel p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${inv.paymentStatus === 'UNPAID' ? 'border-rose-500/20 bg-rose-50/20' : inv.paymentStatus === 'PAID' ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-900 text-sm">Invoice #{inv.invoiceNumber}</span><StatusBadge status={inv.paymentStatus} /></div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>👤 {inv.customer?.name || '—'} · 🔧 {inv.provider?.name || '—'}</div>
                    <div>Labor: ${inv.laborCost} · Platform Fee: ${inv.platformFee} · Tax: ${inv.taxAmount}</div>
                    {inv.discountAmount > 0 && <div className="text-amber-700">Coupon {inv.couponCode}: -${inv.discountAmount}</div>}
                  </div>
                  <div className="text-base font-extrabold text-emerald-700 mt-1.5">Total: {fmt(inv.totalAmount)}</div>
                  {inv.paidAt && <div className="text-[11px] text-slate-400">Paid: {fmtDate(inv.paidAt)}</div>}
                </div>
                {inv.paymentStatus === 'UNPAID' && (
                  <button onClick={() => setConfirm({ msg: `Mark Invoice #${inv.invoiceNumber} as PAID?`, onYes: () => handlePayInvoice(inv._id) })}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <CreditCard className="w-3.5 h-3.5" /> Mark Paid
                  </button>
                )}
                {inv.paymentStatus === 'PAID' && (
                  <span className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISPUTES ── */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Support Ticket Queue ({disputes.length})</h3>
            <div className="flex gap-2 text-[11px]">
              {['OPEN','UNDER_REVIEW','RESOLVED'].map(s => (
                <span key={s} className={`px-2.5 py-1 rounded-full border font-semibold ${s === 'OPEN' ? 'bg-rose-50 border-rose-200 text-rose-600' : s === 'RESOLVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  {s.replace('_',' ')}: {disputes.filter(d => d.status === s).length}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {filtered(disputes, ['ticketId','raisedBy.name','againstUser.name','reason','description','status']).map(d => (
              <div key={d._id} className={`glass-panel p-5 rounded-2xl border space-y-3 ${d.status === 'OPEN' ? 'border-rose-500/30 bg-rose-50/20' : d.status === 'RESOLVED' ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">Ticket #{d.ticketId}</span>
                      <StatusBadge status={d.status} />
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-700 text-[10px] font-semibold">{d.reason}</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">"{d.description}"</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-500">
                      <div>Raised by: <strong className="text-slate-900">{d.raisedBy?.name} ({d.raisedBy?.role})</strong></div>
                      <div>Against: <strong className="text-slate-900">{d.againstUser?.name} ({d.againstUser?.role})</strong></div>
                    </div>
                  </div>
                  {(d.status === 'OPEN' || d.status === 'UNDER_REVIEW') && (
                    <button onClick={() => { setResolveModal(d); setRefundAmt(d.booking?.totalPrice || 50); setResolutionNotes(''); }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex-shrink-0 flex items-center gap-1.5 shadow-md">
                      <CheckCircle className="w-4 h-4" /> Resolve
                    </button>
                  )}
                </div>
                {d.resolution?.resolvedAt && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-500/20 text-[11px] space-y-1">
                    <p className="font-bold text-emerald-700">✓ Resolved by Admin</p>
                    <p className="text-emerald-700">{d.resolution.notes}</p>
                    <p className="text-emerald-600">Refund: {fmt(d.resolution.refundAmount)} · {fmtDate(d.resolution.resolvedAt)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORIES ── */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Service Categories ({categories.length})</h3>
            <button onClick={() => setShowCatModal(true)} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"><Plus className="w-4 h-4" /> Add Category</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(categories, ['name','description']).map(cat => {
              const catReqs = allRequests.filter(r => r.categoryName === cat.name || r.category === cat._id);
              return (
                <div key={cat._id} className="glass-panel p-5 rounded-2xl border border-violet-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><Tag className="w-5 h-5 text-violet-700" /></div>
                    <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">{catReqs.length} requests</span>
                  </div>
                  <div><h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4><p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p></div>
                  <div className="flex flex-wrap gap-1">{cat.subcategories?.map((sub,i) => <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-600">{sub.name}</span>)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AUDIT LOGS ── */}
      {activeTab === 'audits' && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">System Audit Trail ({auditLogs.length} events)</h3>
          {auditLogs.map((log, i) => (
            <div key={log._id || i} className="glass-panel p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><Layers className="w-3.5 h-3.5 text-purple-700" /></div>
                <div>
                  <span className="font-bold text-purple-700">[{log.action}]</span>
                  <span className="text-slate-600 ml-2">by {log.performedBy?.name || 'System'}</span>
                  {log.performedBy?.role && <span className="text-slate-400 ml-1">({log.performedBy.role})</span>}
                  {log.targetResource && <span className="text-slate-400 ml-2">→ {log.targetResource}</span>}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 flex-shrink-0">{fmtDate(log.createdAt)} {fmtTime(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* RESOLVE DISPUTE MODAL */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><LifeBuoy className="w-5 h-5 text-emerald-700" /></div>
              <div><h3 className="font-bold text-slate-900">Resolve Ticket #{resolveModal.ticketId}</h3><p className="text-[11px] text-slate-500">{resolveModal.reason}</p></div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">"{resolveModal.description}"</p>
            <form onSubmit={handleResolveDispute} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Refund Amount ($)</label>
                <input type="number" min="0" value={refundAmt} onChange={e => setRefundAmt(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Resolution Notes *</label>
                <textarea rows={3} required value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} placeholder="Explain the resolution decision…" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-400" />
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                <button type="button" onClick={() => setResolveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Resolve & Close Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><Tag className="w-5 h-5 text-violet-700" /></div>
              <h3 className="font-bold text-slate-900">Create Service Category</h3>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Category Name *</label>
                <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Solar & Energy Storage" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Description *</label>
                <textarea rows={2} required value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="Brief description…" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-400" />
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
