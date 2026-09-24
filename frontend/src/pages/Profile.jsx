import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Shield, Calendar, Camera,
  Briefcase, Award, Star, Clock, CheckCircle2, ChevronRight,
  DollarSign, Wrench, BadgeCheck, LayoutDashboard, FileText,
  CreditCard, Settings, ShieldCheck
} from 'lucide-react';

const ROLE_LABELS = {
  customer: 'Customer',
  provider: 'Service Provider',
  admin: 'Platform Admin',
  ops_manager: 'Ops Manager',
  support_agent: 'Support Agent'
};

const ROLE_COLORS = {
  customer: 'from-blue-600 to-teal-600',
  provider: 'from-emerald-600 to-teal-600',
  admin: 'from-violet-600 to-indigo-600',
  ops_manager: 'from-amber-600 to-orange-600',
  support_agent: 'from-rose-600 to-pink-600'
};

const ROLE_DASHBOARD = {
  customer: '/customer-dashboard',
  provider: '/provider-dashboard',
  admin: '/admin-dashboard',
  ops_manager: '/ops-dashboard',
  support_agent: '/support-dashboard'
};

export default function Profile() {
  const { user, providerProfile } = useAuth();
  const navigate = useNavigate();
  const [fullProfile, setFullProfile] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/auth/profile');
      setFullProfile(res.data.user);
      if (res.data.providerProfile) {
        setProviderData(res.data.providerProfile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Profile photo size must be less than 5MB');
        return;
      }
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        // Instantly update UI and localStorage
        setFullProfile(prev => ({ ...prev, avatar: dataUrl }));
        const currentUser = JSON.parse(localStorage.getItem('careconnect_user') || '{}');
        localStorage.setItem('careconnect_user', JSON.stringify({ ...currentUser, avatar: dataUrl }));

        try {
          if (user.role === 'provider') {
            try {
              await API.put('/providers/profile', { avatar: dataUrl });
            } catch (pErr) {
              await API.put('/auth/profile', { avatar: dataUrl });
            }
          } else {
            await API.put('/auth/profile', { avatar: dataUrl });
          }
        } catch (err) {
          console.warn('Backend avatar sync fallback applied locally');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  const profile = fullProfile || user;
  const provider = providerData || providerProfile;
  const roleColor = ROLE_COLORS[user.role] || 'from-slate-600 to-slate-800';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Profile Hero Card */}
      <div className={`relative bg-gradient-to-br ${roleColor} rounded-3xl p-6 pb-8 shadow-xl overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=0D9488&color=fff&size=150`}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl object-cover border-3 border-white/30 shadow-lg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-white text-slate-800 shadow-md hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
              title="Upload / Change profile photo"
            >
              <Camera className="w-3.5 h-3.5 text-teal-700" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-white tracking-tight truncate">
              {profile.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-sm">
                {ROLE_LABELS[user.role]}
              </span>
              {profile.status === 'active' && (
                <span className="flex items-center gap-1 text-emerald-200 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            {provider && (
              <p className="text-white/70 text-xs mt-1 truncate">{provider.businessName}</p>
            )}
          </div>
          <button
            onClick={() => navigate(ROLE_DASHBOARD[user.role] || '/')}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all backdrop-blur-sm flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate(ROLE_DASHBOARD[user.role] || '/')}
          className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Dashboard</span>
            <span className="text-[10px] text-slate-500">View your main hub</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
        </button>

        {user.role === 'customer' && (
          <button
            onClick={() => navigate('/customer-dashboard?tab=bookings')}
            className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Bookings</span>
              <span className="text-[10px] text-slate-500">Active & completed</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
          </button>
        )}

        {user.role === 'customer' && (
          <button
            onClick={() => navigate('/customer-dashboard?tab=invoices')}
            className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <CreditCard className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Payments</span>
              <span className="text-[10px] text-slate-500">Invoices & billing</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
          </button>
        )}

        {user.role === 'customer' && (
          <button
            onClick={() => navigate('/customer-dashboard?tab=requests')}
            className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Requests</span>
              <span className="text-[10px] text-slate-500">Service requests</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
          </button>
        )}

        {user.role === 'provider' && (
          <button
            onClick={() => navigate('/provider-dashboard')}
            className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <Wrench className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Jobs</span>
              <span className="text-[10px] text-slate-500">Active assignments</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
          </button>
        )}

        {user.role === 'provider' && (
          <button
            onClick={() => navigate('/provider-dashboard')}
            className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <DollarSign className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Earnings</span>
              <span className="text-[10px] text-slate-500">Revenue & payouts</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
          </button>
        )}

        {user.role === 'provider' && (
          <button
            onClick={() => navigate('/providers')}
            className="glass-panel p-4 rounded-2xl border border-slate-200 glass-panel-hover flex items-start gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
              <Star className="w-5 h-5 text-violet-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Reviews</span>
              <span className="text-[10px] text-slate-500">Ratings & feedback</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto self-center" />
          </button>
        )}
      </div>

      {/* Personal Details */}
      <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Personal Details
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          <DetailRow icon={User} label="Full Name" value={profile.name} />
          <DetailRow icon={Mail} label="E-Mail" value={profile.email} />
          <DetailRow icon={Phone} label="Mobile" value={profile.phone || 'Not provided'} muted={!profile.phone} />
          <DetailRow
            icon={MapPin}
            label="Address"
            value={
              profile.address
                ? [profile.address.street, profile.address.city, profile.address.state, profile.address.zipCode]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'
                : 'Not provided'
            }
            muted={!profile.address?.street}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Account Information
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          <DetailRow
            icon={BadgeCheck}
            label="Role"
            value={ROLE_LABELS[user.role]}
            badge
            badgeColor={
              user.role === 'provider' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                : user.role === 'admin' ? 'bg-violet-500/15 text-violet-700 border-violet-500/30'
                : 'bg-blue-500/15 text-blue-700 border-blue-500/30'
            }
          />
          <DetailRow
            icon={Shield}
            label="Account Status"
            value={profile.status === 'active' ? 'Active' : profile.status === 'suspended' ? 'Suspended' : 'Pending Approval'}
            badge
            badgeColor={
              profile.status === 'active' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
            }
          />
          <DetailRow
            icon={Calendar}
            label="Member Since"
            value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
          />
        </div>
      </div>

      {/* Provider-specific: Business & Skills */}
      {user.role === 'provider' && provider && (
        <>
          <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Business Details
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow icon={Briefcase} label="Business Name" value={provider.businessName} />
              <DetailRow icon={DollarSign} label="Hourly Rate" value={`$${provider.hourlyRate}/hr`} highlight />
              <DetailRow icon={Clock} label="Experience" value={`${provider.experienceYears || 3} years`} />
              <DetailRow
                icon={ShieldCheck}
                label="Verification"
                value={
                  provider.verificationStatus === 'verified' ? 'Verified'
                    : provider.verificationStatus === 'pending' ? 'Pending Review'
                    : provider.verificationStatus
                }
                badge
                badgeColor={
                  provider.verificationStatus === 'verified'
                    ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                }
              />
              <DetailRow
                icon={Star}
                label="Rating"
                value={`${provider.ratingAvg?.toFixed(1) || '5.0'} ★  (${provider.reviewCount || 0} reviews)`}
                highlight
              />
              <DetailRow
                icon={CheckCircle2}
                label="Completed Jobs"
                value={`${provider.completedJobsCount || 0} jobs`}
              />
            </div>
          </div>

          {/* Skills & Certifications */}
          {provider.skills && provider.skills.length > 0 && (
            <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Skills & Certifications
                </h2>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/25 transition-all hover:bg-emerald-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Areas */}
          {provider.serviceAreas && provider.serviceAreas.length > 0 && (
            <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Service Areas
                </h2>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {provider.serviceAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 text-xs font-bold border border-blue-500/25"
                    >
                      📍 {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Availability */}
          {provider.availability && provider.availability.length > 0 && (
            <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-600" />
                  Weekly Availability
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {provider.availability.map((slot, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs ${
                        slot.isAvailable !== false
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="font-bold">{slot.dayOfWeek}</span>
                      <span className="font-medium">
                        {slot.isAvailable !== false
                          ? `${slot.startTime} – ${slot.endTime}`
                          : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Reusable detail row component ─── */
function DetailRow({ icon: Icon, label, value, muted, badge, badgeColor, highlight }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
        {badge ? (
          <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
            {value}
          </span>
        ) : (
          <span className={`block text-sm font-bold mt-0.5 truncate ${
            muted ? 'text-slate-400 italic' : highlight ? 'text-teal-700' : 'text-slate-900'
          }`}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
