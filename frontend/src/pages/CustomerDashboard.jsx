import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AIClassifierWidget from '../components/AIClassifierWidget';
import StatusBadge from '../components/StatusBadge';
import SOSModal from '../components/SOSModal';
import { AlertTriangle, Tag as TagIcon } from 'lucide-react';
import {
  Plus, Clock, FileText, CheckCircle2, DollarSign, Star, AlertCircle, Lock,
  Sparkles, MapPin, Calendar, ArrowRight, Key, UserCheck, Users,
  ShieldCheck, Tag, Wrench, ChevronDown, Check, User, CalendarDays, RotateCcw, Filter
} from 'lucide-react';

const defaultCategories = [
  { _id: 'cat-appliance', name: 'Appliance Repair', icon: 'Tv', description: 'Refrigerators, washers, ovens & appliance diagnostics' },
  { _id: 'cat-plumbing', name: 'Plumbing', icon: 'Droplet', description: 'Leaks, drains, water heaters & pipe repairs' },
  { _id: 'cat-electrical', name: 'Electrical Work', icon: 'Zap', description: 'Circuit breakers, wiring, lighting & outlets' },
  { _id: 'cat-hvac', name: 'HVAC & Climate Control', icon: 'Wind', description: 'AC repair, heating & thermostat systems' },
  { _id: 'cat-cleaning', name: 'Cleaning & Maintenance', icon: 'Sparkles', description: 'Deep home cleaning & sanitization' },
  { _id: 'cat-handyman', name: 'Handyman & General Repair', icon: 'Hammer', description: 'Drywall, mounting, door fixes & assembly' }
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'requests';

  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotesModal, setQuotesModal] = useState(null); // request ID for quote comparison
  const [showSOS, setShowSOS] = useState(searchParams.get('sos') === '1');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null); // { ok, text }
  const [quotesList, setQuotesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(currentTab);

  // Calendar Date Range Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Categories & Providers state
  const [categories, setCategories] = useState(defaultCategories);
  const [allProviders, setAllProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Appliance Repair');
  const [selectedProviderId, setSelectedProviderId] = useState('');

  // Form states for creating service request
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zipCode, setZipCode] = useState('10001');
  const [preferredDate, setPreferredDate] = useState('2026-09-26');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('09:00 - 11:00');
  const [aiClassifiedData, setAiClassifiedData] = useState(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['requests', 'bookings', 'invoices'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const createParam = searchParams.get('create');
    const provParam = searchParams.get('providerId');
    const catParam = searchParams.get('category');
    if (createParam === 'true') {
      setShowCreateModal(true);
    }
    if (provParam) {
      setSelectedProviderId(provParam);
    }
    if (catParam) {
      setSelectedCategory(decodeURIComponent(catParam));
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [reqRes, bookRes, invRes, catRes, provRes] = await Promise.all([
        API.get('/requests'),
        API.get('/bookings'),
        API.get('/invoices'),
        API.get('/categories').catch(() => ({ data: [] })),
        API.get('/providers').catch(() => ({ data: [] }))
      ]);
      setRequests(reqRes.data || []);
      setBookings(bookRes.data || []);
      setInvoices(invRes.data || []);
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
      if (provRes.data && provRes.data.length > 0) {
        setAllProviders(provRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Find active category object
  const activeCategoryObj = categories.find(
    c => c._id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
  ) || categories[0] || { name: selectedCategory };

  const currentCategoryName = activeCategoryObj?.name || selectedCategory;

  // Filter providers dynamically based on the chosen category of work
  const matchingProviders = allProviders.filter(p => {
    if (!currentCategoryName) return true;
    const catLower = currentCategoryName.toLowerCase();
    
    // Check provider's serviceCategories array
    const hasCategoryRef = p.serviceCategories?.some(c => {
      if (typeof c === 'string') return c === activeCategoryObj?._id || c.toLowerCase() === catLower;
      return (c._id && activeCategoryObj?._id && c._id === activeCategoryObj._id) ||
             (c.name && c.name.toLowerCase() === catLower) ||
             (c.slug && activeCategoryObj?.slug && c.slug === activeCategoryObj.slug);
    });

    // Check provider's skills array
    const hasSkillMatch = p.skills?.some(s => {
      const sLower = s.toLowerCase();
      return sLower.includes(catLower) || catLower.includes(sLower) ||
        (catLower.includes('appliance') && (sLower.includes('refrigerat') || sLower.includes('appliance'))) ||
        (catLower.includes('plumb') && (sLower.includes('drain') || sLower.includes('pipe'))) ||
        (catLower.includes('electrical') && (sLower.includes('circuit') || sLower.includes('wiring') || sLower.includes('lighting'))) ||
        (catLower.includes('hvac') && (sLower.includes('ac') || sLower.includes('heat') || sLower.includes('climate'))) ||
        (catLower.includes('handyman') && (sLower.includes('repair') || sLower.includes('furniture') || sLower.includes('general')));
    });

    // Check business name or bio keywords
    const hasTextMatch = (p.businessName && p.businessName.toLowerCase().includes(catLower)) ||
                         (p.bio && p.bio.toLowerCase().includes(catLower));

    return hasCategoryRef || hasSkillMatch || hasTextMatch;
  });

  const handleCategoryChange = (categoryIdentifier) => {
    setSelectedCategory(categoryIdentifier);
    const targetCat = categories.find(c => c._id === categoryIdentifier || c.name === categoryIdentifier);
    const targetName = targetCat ? targetCat.name : categoryIdentifier;

    // Check if previously selected provider is still qualified for new category
    if (selectedProviderId) {
      const prov = allProviders.find(p => (p.user?._id || p.user) === selectedProviderId);
      if (prov) {
        const catLower = targetName.toLowerCase();
        const stillQualified = prov.serviceCategories?.some(c => (c.name || '').toLowerCase() === catLower || c._id === targetCat?._id) ||
                               prov.skills?.some(s => s.toLowerCase().includes(catLower) || catLower.includes(s.toLowerCase()));
        if (!stillQualified) {
          setSelectedProviderId('');
        }
      }
    }
  };

  const selectedProviderProfile = allProviders.find(p => (p.user?._id || p.user) === selectedProviderId);

  // Calendar Date Range filtering helper functions
  const getItemDate = (item, type) => {
    if (type === 'request') {
      return item.preferredDate || (item.createdAt ? item.createdAt.split('T')[0] : '');
    }
    if (type === 'booking') {
      return item.scheduledDate || (item.createdAt ? item.createdAt.split('T')[0] : '');
    }
    if (type === 'invoice') {
      if (item.paidAt) return item.paidAt.split('T')[0];
      if (item.createdAt) return item.createdAt.split('T')[0];
      return '';
    }
    return '';
  };

  const filterByDateRange = (items, type) => {
    if (!startDate && !endDate) return items;
    return items.filter(item => {
      const itemDate = getItemDate(item, type);
      if (!itemDate) return true;
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  const filteredRequests = filterByDateRange(requests, 'request');
  const filteredBookings = filterByDateRange(bookings, 'booking');
  const filteredInvoices = filterByDateRange(invoices, 'invoice');

  const handlePresetDate = (preset) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = formatDate(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const start = new Date(today);
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    } else if (preset === 'month') {
      const y = today.getFullYear();
      const m = today.getMonth();
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await API.post('/requests', {
        title,
        description,
        serviceAddress: { zipCode, city: 'Springfield', state: 'NY', street: '742 Evergreen Terrace' },
        preferredDate,
        preferredTimeSlot,
        categoryId: activeCategoryObj?._id?.startsWith('cat-') ? null : activeCategoryObj?._id,
        categoryName: currentCategoryName,
        targetProvider: selectedProviderId || null,
        urgency: aiClassifiedData?.urgency || 'Medium',
        skillsRequired: aiClassifiedData?.skillsRequired || [currentCategoryName]
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setSelectedProviderId('');
      fetchCustomerData();
      alert(`Service request for "${currentCategoryName}" created successfully!${selectedProviderProfile ? ` Routed directly to ${selectedProviderProfile.user?.name || selectedProviderProfile.businessName}.` : ' Broadcasted to qualified providers.'}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create request');
    }
  };

  const fetchQuotesForRequest = async (requestId) => {
    try {
      const res = await API.get(`/quotes?serviceRequestId=${requestId}`);
      setQuotesList(res.data);
      setQuotesModal(requestId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      const res = await API.post('/bookings', { quoteId, couponCode: couponCode.trim() || undefined });
      setQuotesModal(null);
      setCouponCode('');
      setCouponMsg(null);
      fetchCustomerData();
      alert('Quote accepted! Service slot locked successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept quote');
    }
  };

  const checkCoupon = async (price) => {
    if (!couponCode.trim()) return;
    try {
      const res = await API.post('/coupons/validate', { code: couponCode, amount: price });
      setCouponMsg(res.data.valid
        ? { ok: true, text: `${res.data.code} applied: you save $${res.data.discount} on this quote` }
        : { ok: false, text: res.data.reason });
    } catch (err) {
      setCouponMsg({ ok: false, text: 'Could not validate coupon' });
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      await API.post(`/invoices/${invoiceId}/pay`, { paymentMethod: 'Credit Card / Wallet' });
      fetchCustomerData();
      alert('Invoice paid successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Welcome back, {user?.name || 'Customer'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track service requests, compare provider quotes, and pay invoices</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowSOS(true)}
          className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all"
        >
          <AlertTriangle className="w-4 h-4" /> Emergency SOS
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Create Service Request
        </button>
        </div>
      </div>

      {/* Calendar Date Range Filter Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-700">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                Calendar & Specific Date Range Filter
              </h3>
              <p className="text-[11px] text-slate-500">
                Filter requests, active/completed bookings, and invoices within your selected calendar dates
              </p>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handlePresetDate('all')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                !startDate && !endDate
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => handlePresetDate('today')}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-200 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => handlePresetDate('week')}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-200 transition-all"
            >
              Next 7 Days
            </button>
            <button
              onClick={() => handlePresetDate('month')}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-200 transition-all"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Date Inputs Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-600 font-medium">From Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-600 font-medium">To Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {(startDate || endDate) && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
              >
                <RotateCcw className="w-3 h-3 text-rose-600" /> Reset Date Filter
              </button>
              <span className="text-[11px] text-teal-700 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 font-semibold">
                Range: {startDate || 'Start'} → {endDate || 'End'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => handleTabChange('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'requests' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Requests ({filteredRequests.length}{requests.length !== filteredRequests.length ? ` of ${requests.length}` : ''})
        </button>
        <button
          onClick={() => handleTabChange('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'bookings' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Active & Completed Bookings ({filteredBookings.length}{bookings.length !== filteredBookings.length ? ` of ${bookings.length}` : ''})
        </button>
        <button
          onClick={() => handleTabChange('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'invoices' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Invoices & Payments ({filteredInvoices.length}{invoices.length !== filteredInvoices.length ? ` of ${invoices.length}` : ''})
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs space-y-2">
              <p>
                {requests.length === 0
                  ? 'No service requests created yet. Click "Create Service Request" above to get started!'
                  : `No service requests found for the selected date range (${startDate || 'start'} to ${endDate || 'end'}).`}
              </p>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req._id} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-base">{req.title}</span>
                      <StatusBadge status={req.status} />
                      <StatusBadge status={req.urgency} />
                    </div>
                    <p className="text-xs text-slate-600">{req.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                      <span>Preferred: {req.preferredDate} ({req.preferredTimeSlot})</span>
                      <span>•</span>
                      <span>Zip: {req.serviceAddress?.zipCode}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 border border-teal-500/30">
                        {req.categoryName || 'General'}
                      </span>
                      {req.targetProvider && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                          Direct Provider Targeted
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchQuotesForRequest(req._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-700 font-semibold text-xs border border-teal-500/30 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Compare Quotes ({req.quotesCount || 0})
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs space-y-2">
              <p>
                {bookings.length === 0
                  ? 'No active bookings found. Accept a quote from your requests to lock a provider slot!'
                  : `No active or completed bookings found for the selected date range (${startDate || 'start'} to ${endDate || 'end'}).`}
              </p>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div key={b._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">{b.serviceRequest?.title}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-slate-500">Provider: <span className="text-slate-900 font-semibold">{b.provider?.name}</span> • Total Price: <span className="text-emerald-700 font-bold">${b.totalPrice}</span></p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>Scheduled for: {b.scheduledDate} ({b.timeSlot})</span>
                    {b.verificationCode ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                        <Key className="w-3 h-3" /> Pass: {b.verificationCode}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 font-medium text-[10px] border border-blue-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pass: Pending Provider Acceptance
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/booking/${b._id}`}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md"
                >
                  View Live Job Tracker & Evidence <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs space-y-2">
              <p>
                {invoices.length === 0
                  ? 'No invoices generated yet.'
                  : `No invoices found for the selected date range (${startDate || 'start'} to ${endDate || 'end'}).`}
              </p>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          ) : (
            filteredInvoices.map((inv) => (
              <div key={inv._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">Invoice #{inv.invoiceNumber}</span>
                    <StatusBadge status={inv.paymentStatus} />
                  </div>
                  <p className="text-xs text-slate-500">Labor: ${inv.laborCost} • Platform Fee: ${inv.platformFee} • Tax: ${inv.taxAmount}</p>
                  {inv.discountAmount > 0 && (
                    <p className="text-xs font-semibold text-amber-700 mt-0.5">Coupon {inv.couponCode} applied: -${inv.discountAmount}</p>
                  )}
                  <div className="text-sm font-extrabold text-emerald-700 mt-1">Total Amount: ${inv.totalAmount}</div>
                </div>

                {inv.paymentStatus === 'UNPAID' && (
                  inv.booking && (!inv.booking.codeVerified && !['WORK_COMPLETE', 'COMPLETED'].includes(inv.booking.status)) ? (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200 flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Locked (Awaiting PIN Verification)
                      </button>
                      <span className="text-[11px] text-amber-700 font-semibold">Provider must verify 4-digit PIN upon job completion first</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePayInvoice(inv._id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
                    >
                      <DollarSign className="w-4 h-4" /> Pay Invoice Now
                    </button>
                  )
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Service Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create New Service Request</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-900 text-xs">✕ Close</button>
            </div>

            {/* AI Assistant */}
            <AIClassifierWidget
              onClassificationComplete={(aiRes, text) => {
                setAiClassifiedData(aiRes);
                setTitle(`${aiRes.categoryName} Request`);
                setDescription(text);
                handleCategoryChange(aiRes.categoryName);
              }}
            />

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              {/* Category of Work Selection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-700" />
                    Required Category of Work
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                    Selected: {currentCategoryName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = activeCategoryObj?.name?.toLowerCase() === cat.name?.toLowerCase() ||
                                       activeCategoryObj?._id === cat._id;
                    return (
                      <button
                        key={cat._id || cat.name}
                        type="button"
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-600/20 border-teal-500 text-slate-900 shadow-md shadow-teal-500/10'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold text-xs">{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-700" />}
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{cat.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Provider Selection Based on Category */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Select Provider for {currentCategoryName}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {matchingProviders.length > 0 
                        ? `${matchingProviders.length} verified specialist${matchingProviders.length > 1 ? 's' : ''} available for ${currentCategoryName}`
                        : `No specific provider registered for ${currentCategoryName} yet — open broadcast enabled`}
                    </p>
                  </div>
                  {selectedProviderProfile && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 font-semibold border border-emerald-500/30 self-start sm:self-auto">
                      Direct Request Selected
                    </span>
                  )}
                </div>

                {/* Provider Selector Dropdown */}
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="">
                    🌟 Any Available Qualified Specialist (Open Request / AI Smart Match)
                  </option>
                  {matchingProviders.map((p) => {
                    const providerUserId = p.user?._id || p.user;
                    return (
                      <option key={p._id} value={providerUserId}>
                        {p.user?.name || p.businessName} — {p.businessName} (${p.hourlyRate}/hr • ⭐ {p.ratingAvg ? p.ratingAvg.toFixed(1) : '5.0'})
                      </option>
                    );
                  })}
                </select>

                {/* Selected Provider Card Preview */}
                {selectedProviderProfile ? (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-950/40 via-white to-white border border-teal-500/40 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedProviderProfile.user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                          alt={selectedProviderProfile.user?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {selectedProviderProfile.user?.name}
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                          <div className="text-[11px] text-slate-600">{selectedProviderProfile.businessName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-emerald-700">${selectedProviderProfile.hourlyRate}/hr</div>
                        <div className="text-[10px] text-amber-700 flex items-center gap-0.5 justify-end">
                          <Star className="w-3 h-3 fill-amber-400" /> {selectedProviderProfile.ratingAvg ? selectedProviderProfile.ratingAvg.toFixed(1) : '5.0'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-200 text-[10px]">
                      <span className="text-slate-500">Specializations:</span>
                      {selectedProviderProfile.skills?.slice(0, 4).map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] text-teal-700 bg-teal-500/10 p-2 rounded-lg border border-teal-500/20 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                      <span>
                        <strong>Direct Routing Active:</strong> {selectedProviderProfile.user?.name} will receive priority notification to review your problem and submit a dedicated quote.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>
                      Request will be broadcasted to all verified specialists in <strong>{currentCategoryName}</strong>. You'll receive quotes to compare.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Refrigerator is leaking water"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Detailed Problem Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe details, error signs, or symptoms..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Service Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Preferred Time Slot</label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="09:00 - 11:00">09:00 - 11:00</option>
                    <option value="11:00 - 13:00">11:00 - 13:00</option>
                    <option value="13:00 - 15:00">13:00 - 15:00</option>
                    <option value="15:00 - 17:00">15:00 - 17:00</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compare Quotes Modal */}
      {quotesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 border border-slate-200 shadow-xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-700" /> Compare Received Provider Quotes ({quotesList.length})
              </h3>
              <button onClick={() => setQuotesModal(null)} className="text-slate-500 hover:text-slate-900 text-xs">✕ Close</button>
            </div>

            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-700"><TagIcon className="w-4 h-4" /> Have a coupon?</span>
              <input
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(null); }}
                placeholder="WELCOME10 · CARE20 · FIXIT15"
                className="input !py-2 !text-xs sm:max-w-[15rem]"
              />
              <button
                type="button"
                onClick={() => checkCoupon(Math.min(...quotesList.map((q) => q.price)))}
                className="btn-outline !py-2 !px-4 !text-xs"
              >
                Check
              </button>
              {couponMsg && <span className={couponMsg.ok ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-600'}>{couponMsg.text}</span>}
            </div>

            {quotesList.length === 0 ? (
              <p className="text-slate-500 text-xs py-6 text-center">No quotes submitted by providers for this request yet.</p>
            ) : (
              <div className="space-y-3">
                {quotesList.map((q) => (
                  <div key={q._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{q.provider?.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-semibold">${q.price} Total</span>
                        <StatusBadge status={q.status} />
                      </div>
                      <p className="text-slate-600">{q.notes || 'No notes provided'}</p>
                      <div className="text-[11px] text-slate-500 mt-1">Proposed Slot: {q.proposedDate} ({q.proposedTimeSlot}) • Est. Hours: {q.estimatedHours}h</div>
                    </div>

                    {q.status === 'ACCEPTED' ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-700 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Slot Booked
                      </span>
                    ) : q.status === 'REJECTED' ? (
                      <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold border border-slate-200">
                        Declined
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcceptQuote(q._id)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept & Book Provider Slot
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSOS && (
        <SOSModal
          defaultZip={user?.address?.zipCode || ''}
          onClose={() => setShowSOS(false)}
          onDispatched={() => fetchCustomerData()}
        />
      )}
    </div>
  );
}
