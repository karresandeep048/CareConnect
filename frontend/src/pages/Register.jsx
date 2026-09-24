import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase, Award, X, Plus, ChevronDown, Eye, EyeOff, Search, CheckCircle, AlertCircle, Camera, Upload } from 'lucide-react';

// ── Country dial codes with flag emojis ───────────────────────────────────
const COUNTRIES = [
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'United States'    },
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'India'            },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'United Kingdom'   },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada'           },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia'        },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE'              },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Singapore'        },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany'          },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France'           },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Japan'            },
  { code: 'CN', dial: '+86',  flag: '🇨🇳', name: 'China'            },
  { code: 'BR', dial: '+55',  flag: '🇧🇷', name: 'Brazil'           },
  { code: 'MX', dial: '+52',  flag: '🇲🇽', name: 'Mexico'           },
  { code: 'ZA', dial: '+27',  flag: '🇿🇦', name: 'South Africa'     },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria'          },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya'            },
  { code: 'PK', dial: '+92',  flag: '🇵🇰', name: 'Pakistan'         },
  { code: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh'       },
  { code: 'PH', dial: '+63',  flag: '🇵🇭', name: 'Philippines'      },
  { code: 'ID', dial: '+62',  flag: '🇮🇩', name: 'Indonesia'        },
  { code: 'MY', dial: '+60',  flag: '🇲🇾', name: 'Malaysia'         },
  { code: 'TH', dial: '+66',  flag: '🇹🇭', name: 'Thailand'         },
  { code: 'TR', dial: '+90',  flag: '🇹🇷', name: 'Turkey'           },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia'     },
  { code: 'EG', dial: '+20',  flag: '🇪🇬', name: 'Egypt'            },
  { code: 'IT', dial: '+39',  flag: '🇮🇹', name: 'Italy'            },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', name: 'Spain'            },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Netherlands'      },
  { code: 'CH', dial: '+41',  flag: '🇨🇭', name: 'Switzerland'      },
  { code: 'SE', dial: '+46',  flag: '🇸🇪', name: 'Sweden'           },
  { code: 'NO', dial: '+47',  flag: '🇳🇴', name: 'Norway'           },
  { code: 'AF', dial: '+93',  flag: '🇦🇫', name: 'Afghanistan'      },
  { code: 'AL', dial: '+355', flag: '🇦🇱', name: 'Albania'          },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', name: 'Algeria'          },
  { code: 'AD', dial: '+376', flag: '🇦🇩', name: 'Andorra'          },
  { code: 'NZ', dial: '+64',  flag: '🇳🇿', name: 'New Zealand'      },
  { code: 'AR', dial: '+54',  flag: '🇦🇷', name: 'Argentina'        },
  { code: 'LK', dial: '+94',  flag: '🇱🇰', name: 'Sri Lanka'        },
  { code: 'NP', dial: '+977', flag: '🇳🇵', name: 'Nepal'            },
  { code: 'MM', dial: '+95',  flag: '🇲🇲', name: 'Myanmar'          },
  { code: 'VN', dial: '+84',  flag: '🇻🇳', name: 'Vietnam'          },
  { code: 'KR', dial: '+82',  flag: '🇰🇷', name: 'South Korea'      },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria'          },
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana'            },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar'            },
  { code: 'KW', dial: '+965', flag: '🇰🇼', name: 'Kuwait'           },
  { code: 'BH', dial: '+973', flag: '🇧🇭', name: 'Bahrain'          },
  { code: 'OM', dial: '+968', flag: '🇴🇲', name: 'Oman'             },
  { code: 'JO', dial: '+962', flag: '🇯🇴', name: 'Jordan'           },
  { code: 'LB', dial: '+961', flag: '🇱🇧', name: 'Lebanon'          },
];

// ── Skills by category ────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  { category: 'Appliance Repair',    skills: ['Appliance Repair', 'Refrigeration', 'Electrical Diagnostics'] },
  { category: 'Plumbing',           skills: ['Plumbing', 'Drain Cleaning', 'Pipe Fitting'] },
  { category: 'Electrical Work',    skills: ['Electrical Wiring', 'Circuit Breaker Repair', 'Lighting Installation'] },
  { category: 'HVAC & Climate',     skills: ['HVAC Maintenance', 'AC Repair'] },
  { category: 'Cleaning',           skills: ['Deep Cleaning', 'Sanitization'] },
  { category: 'Handyman & General', skills: ['Furniture Assembly', 'General Repair', 'General Maintenance'] },
];

// ── Validation helpers ────────────────────────────────────────────────────
const isGmail   = (email) => /^[a-zA-Z0-9._%+\-]+@gmail\.com$/i.test(email.trim());
const isPhone10 = (num)   => /^\d{10}$/.test(num.replace(/\D/g, ''));

// ── Country Phone Picker ──────────────────────────────────────────────────
function PhonePicker({ dialCode, onDialChange, phone, onPhoneChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selected = COUNTRIES.find(c => c.dial === dialCode) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Format as user types — only allow digits, max 10
  const handlePhoneInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    onPhoneChange(raw);
  };

  // Display formatted number
  const display = () => {
    const d = phone.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-slate-600 font-medium text-xs mb-1">
        Phone Number <span className="text-rose-500">*</span>
      </label>
      <div className={`flex items-stretch rounded-xl border bg-white overflow-hidden transition-all ${
        error ? 'border-rose-400' : 'border-slate-200 focus-within:border-teal-500'
      }`}>
        {/* Country picker trigger */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-xs font-semibold text-slate-700">{selected.dial}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Number input */}
        <input
          type="tel"
          inputMode="numeric"
          value={display()}
          onChange={handlePhoneInput}
          placeholder="(201) 555-0123"
          className="flex-1 px-3 py-2.5 text-slate-900 text-xs focus:outline-none bg-transparent"
        />
      </div>

      {error && <p className="mt-1 text-[10px] text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {!error && phone.length > 0 && isPhone10(phone) && <p className="mt-1 text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Valid phone number</p>}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((c, i) => (
              <button
                key={`${c.code}-${i}`}
                type="button"
                onClick={() => { onDialChange(c.dial); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-teal-50 transition-colors text-xs ${c.dial === dialCode ? 'bg-teal-50 font-semibold text-teal-700' : 'text-slate-700'}`}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-slate-400 font-mono">{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="px-3 py-4 text-center text-xs text-slate-400">No countries found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Password field with eye toggle ─────────────────────────────────────────
function PasswordInput({ value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-slate-600 font-medium text-xs mb-1">
        Password <span className="text-rose-500">*</span>
        <span className="ml-1 text-[10px] text-slate-400">(min. 6 characters)</span>
      </label>
      <div className={`relative flex items-center rounded-xl border bg-white transition-all ${
        error ? 'border-rose-400' : 'border-slate-200 focus-within:border-teal-500'
      }`}>
        <input
          type={show ? 'text' : 'password'}
          required
          minLength={6}
          value={value}
          onChange={onChange}
          placeholder="••••••"
          className="flex-1 bg-transparent px-3 py-2.5 text-slate-900 text-xs focus:outline-none pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength bar */}
      {value.length > 0 && (
        <div className="mt-1.5 space-y-1">
          <div className="flex gap-1">
            {[6, 8, 12].map((threshold, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${value.length >= threshold ? ['bg-rose-400','bg-amber-400','bg-emerald-500'][i] : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className={`text-[10px] ${value.length < 6 ? 'text-rose-600' : value.length < 8 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {value.length < 6 ? `${6 - value.length} more character${6 - value.length > 1 ? 's' : ''} needed` : value.length < 8 ? 'Fair' : value.length < 12 ? 'Good' : 'Strong ✓'}
          </p>
        </div>
      )}
      {error && <p className="mt-1 text-[10px] text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Main Register Component ────────────────────────────────────────────────
export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'customer',
    phone: '', dialCode: '+1', businessName: '', hourlyRate: 55, zipCode: '10001', skills: [], avatar: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const fileInputRef = useRef(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        set('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Live field validation
  const validateField = (key, val) => {
    const errs = { ...fieldErrors };
    if (key === 'name') {
      if (!val.trim()) errs.name = 'Full name is required.';
      else if (val.trim().length < 3) errs.name = 'Name must be at least 3 characters.';
      else delete errs.name;
    }
    if (key === 'email') {
      if (!val.trim()) errs.email = 'Email is required.';
      else if (!isGmail(val)) errs.email = 'Only @gmail.com addresses are accepted.';
      else delete errs.email;
    }
    if (key === 'password') {
      if (!val) errs.password = 'Password is required.';
      else if (val.length < 6) errs.password = `Password must be at least 6 characters.`;
      else delete errs.password;
    }
    if (key === 'phone') {
      if (!val) errs.phone = 'Phone number is required.';
      else if (!isPhone10(val)) errs.phone = 'Enter exactly 10 digits.';
      else delete errs.phone;
    }
    setFieldErrors(errs);
  };

  const handleField = (key, val) => { set(key, val); validateField(key, val); };

  const toggleSkill = (skill) => {
    setFormData(p => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill]
    }));
  };

  const addCustomSkill = () => {
    const t = customSkill.trim();
    if (t && !formData.skills.includes(t)) { set('skills', [...formData.skills, t]); setCustomSkill(''); }
  };

  const removeSkill = (skill) => set('skills', formData.skills.filter(s => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Full form validation before submit
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) errs.name = 'Name must be at least 3 characters.';
    if (!isGmail(formData.email)) errs.email = 'Only @gmail.com addresses are accepted.';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!formData.phone) errs.phone = 'Phone number is required.';
    else if (!isPhone10(formData.phone)) errs.phone = 'Enter exactly 10 digits.';
    if (formData.role === 'provider' && formData.skills.length === 0) {
      setError('Please select at least one skill or certification.');
      return;
    }
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    const submitData = {
      ...formData,
      phone: formData.phone ? `${formData.dialCode} ${formData.phone}` : '',
    };

    const res = await register(submitData);
    if (res.success) {
      navigate(formData.role === 'provider' ? '/provider-dashboard' : '/customer-dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 px-4">
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join CareConnect Home Services Platform</p>
        </div>

        {/* Server error */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Role toggle */}
          <div>
            <label className="block text-slate-600 font-medium mb-1 text-xs">I want to register as:</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'customer', label: 'Customer', icon: User, active: 'bg-teal-600 text-white border-teal-500 shadow-lg shadow-teal-500/30' },
                { role: 'provider', label: 'Service Provider', icon: Briefcase, active: 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' },
              ].map(({ role, label, icon: Icon, active }) => (
                <button key={role} type="button" onClick={() => set('role', role)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${formData.role === role ? active : 'bg-white text-slate-500 border-slate-200'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center">
            <label className="block text-slate-700 font-bold mb-2 text-xs">Profile Picture / Avatar</label>
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-teal-500 overflow-hidden bg-white flex items-center justify-center shadow-md">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-lg transition-transform hover:scale-110"
                title="Upload profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> {formData.avatar ? 'Change Photo' : 'Upload Profile Photo'}
              </button>
              {formData.avatar && (
                <button
                  type="button"
                  onClick={() => set('avatar', '')}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP image format</p>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className={`relative rounded-xl border bg-white transition-all ${fieldErrors.name ? 'border-rose-400' : 'border-slate-200 focus-within:border-teal-500'}`}>
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleField('name', e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-transparent pl-8 pr-3 py-2.5 text-slate-900 text-xs focus:outline-none"
                  autoComplete="name"
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-[10px] text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Email Address <span className="text-rose-500">*</span>
                <span className="ml-1 text-[10px] text-slate-400">(@gmail.com)</span>
              </label>
              <div className={`relative rounded-xl border bg-white transition-all ${fieldErrors.email ? 'border-rose-400' : 'border-slate-200 focus-within:border-teal-500'}`}>
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleField('email', e.target.value)}
                  placeholder="jane@gmail.com"
                  className="w-full bg-transparent pl-8 pr-3 py-2.5 text-slate-900 text-xs focus:outline-none"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-[10px] text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
              {!fieldErrors.email && formData.email && isGmail(formData.email) && <p className="mt-1 text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Valid Gmail address</p>}
            </div>
          </div>

          {/* Password + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PasswordInput
              value={formData.password}
              onChange={e => handleField('password', e.target.value)}
              error={fieldErrors.password}
            />

            <PhonePicker
              dialCode={formData.dialCode}
              onDialChange={v => set('dialCode', v)}
              phone={formData.phone}
              onPhoneChange={v => handleField('phone', v)}
              error={fieldErrors.phone}
            />
          </div>

          {/* Provider extras */}
          {formData.role === 'provider' && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-4">
              <span className="font-bold text-emerald-700 block text-xs">Service Provider Setup</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">Business Name <span className="text-rose-500">*</span></label>
                  <input type="text" required value={formData.businessName}
                    onChange={e => set('businessName', e.target.value)}
                    placeholder="Doe Appliance Pro"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">Hourly Rate ($) <span className="text-rose-500">*</span></label>
                  <input type="number" required min="20" value={formData.hourlyRate}
                    onChange={e => set('hourlyRate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {/* Skills picker */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-700 font-bold mb-2 text-xs">
                  <Award className="w-4 h-4 text-emerald-600" /> Skills & Certifications <span className="text-rose-500">*</span>
                </label>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {formData.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 text-[11px] font-bold border border-emerald-500/30">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-0.5 text-emerald-600 hover:text-rose-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5 mb-3">
                  {SKILL_CATEGORIES.map(cat => (
                    <div key={cat.category} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <button type="button" onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors">
                        <span className="font-semibold text-slate-700 text-[11px]">{cat.category}</span>
                        <div className="flex items-center gap-1.5">
                          {cat.skills.filter(s => formData.skills.includes(s)).length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[9px] font-bold">
                              {cat.skills.filter(s => formData.skills.includes(s)).length}
                            </span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedCategory === cat.category ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {expandedCategory === cat.category && (
                        <div className="px-3 pb-2.5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                          {cat.skills.map(skill => {
                            const sel = formData.skills.includes(skill);
                            return (
                              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${sel ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'}`}>
                                {sel ? '✓ ' : '+ '}{skill}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={customSkill} onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                    placeholder="Add a custom skill..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-400" />
                  <button type="button" onClick={addCustomSkill} disabled={!customSkill.trim()}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-[11px] flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Account…</>
            ) : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
