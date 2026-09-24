import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Search, MapPin, ShieldCheck, Star, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ProviderDirectory() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState(searchParams.get('skill') || '');
  const [zipFilter, setZipFilter] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let query = [];
      if (skillFilter) query.push(`skill=${skillFilter}`);
      if (zipFilter) query.push(`zipCode=${zipFilter}`);
      const queryString = query.length > 0 ? `?${query.join('&')}` : '';

      const res = await API.get(`/providers${queryString}`);
      if (res.data) {
        setProviders(res.data);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error(err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
            Verified Contractor Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">Find Background-Checked Service Pros</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Directly request quotes from licensed service providers in your area</p>
        </div>
      </div>

      {/* Search Filters */}
      <form onSubmit={handleSearch} className="glass-panel p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by skill (e.g. Appliance Repair, Plumbing, Electrical, HVAC)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="w-44 relative">
          <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zip Code (e.g. 10001)..."
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-teal-600/25 hover:scale-105"
        >
          Search Pros
        </button>
      </form>

      {/* Providers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : providers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Service Providers Registered Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no registered service providers. As providers create real accounts on CareConnect, they will appear here automatically.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-500/25 transition-all mt-2"
          >
            Register as a Provider
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div key={p._id} className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm glass-panel-hover flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={p.businessName || p.user?.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {p.user?.name || p.businessName}
                        {p.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-4 h-4 text-emerald-700 fill-emerald-400/20" />
                        )}
                      </h3>
                      <span className="text-xs text-emerald-700 font-semibold">{p.businessName || 'Pro Service Provider'}</span>
                    </div>
                  </div>
                  <StatusBadge status={p.verificationStatus || 'pending'} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.bio || 'Professional certified service provider.'}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Hourly Rate</span>
                    <span className="font-extrabold text-teal-700">${p.hourlyRate || 50}/hr</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Rating Score</span>
                    <span className="font-extrabold text-amber-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-700" /> {p.ratingAvg ? p.ratingAvg.toFixed(1) : 'New'} ({p.reviewCount || 0})
                    </span>
                  </div>
                </div>

                {p.skills && p.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Skills & Certifications:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.skills.map((sk, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] border border-emerald-500/25 font-bold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" /> {p.serviceAreas?.slice(0, 2).join(', ') || 'Local area'}
                </span>
                {(!user || user.role === 'customer') && (
                  <Link
                    to={`/customer-dashboard?create=true&providerId=${p.user?._id || p.user || p._id}&category=${encodeURIComponent(p.serviceCategories?.[0]?.name || p.skills?.[0] || '')}`}
                    className="px-5 py-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/25 transition-all hover:scale-105"
                  >
                    Invite / Book
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
