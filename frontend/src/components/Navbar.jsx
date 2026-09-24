import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, LayoutDashboard, Search, MapPin, Menu, X, LogOut, Calculator, Sparkles, ChevronDown, User } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const ROLE_META = {
  customer: { label: 'Customer', dashboard: '/customer-dashboard' },
  provider: { label: 'Service Provider', dashboard: '/provider-dashboard' },
  admin: { label: 'Platform Admin', dashboard: '/admin-dashboard' },
  ops_manager: { label: 'Ops Manager', dashboard: '/ops-dashboard' },
  support_agent: { label: 'Support Agent', dashboard: '/support-dashboard' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = user ? ROLE_META[user.role] : null;
  const isCustomerOrProvider = user && ['customer', 'provider'].includes(user.role);

  const links = [
    ...(user?.role === 'customer'
      ? [
          { to: '/services', label: 'Services', icon: Search },
          { to: '/providers', label: 'Find Pros', icon: MapPin },
        ]
      : []),
    { to: '/estimate', label: 'Cost Estimator', icon: Calculator },
    ...(!isCustomerOrProvider ? [{ to: '/showcase', label: 'Project Showcase', icon: Sparkles }] : []),
    ...(meta ? [{ to: meta.dashboard, label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-teal-gradient flex items-center justify-center shadow-sm">
            <Wrench className="w-[18px] h-[18px] text-white" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
            Care<span className="text-brand-600">Connect</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user && <NotificationDropdown />}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-3 py-1 hover:border-brand-300 transition-colors"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0D9488&color=fff&size=100`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden sm:block text-left leading-tight">
                  <span className="block text-xs font-bold text-slate-900">{user.name}</span>
                  <span className="block text-[10px] font-medium text-brand-700">{meta?.label}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 card rounded-2xl py-1.5 animate-pop">
                  <Link
                    to={meta?.dashboard || '/'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-600" /> My Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-teal-600" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !py-2">
                Get started
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg border border-slate-200 bg-white text-slate-700"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-pop">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={linkClass}>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">Get started</Link>
            </div>
          )}
          {user && (
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
