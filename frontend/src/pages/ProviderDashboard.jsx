import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import QuoteModal from '../components/QuoteModal';
import EvidenceUploader from '../components/EvidenceUploader';
import { Briefcase, Calendar, DollarSign, Clock, CheckCircle, FileText, Send, Camera, ArrowRight, ShieldCheck, Sparkles, UserCheck, Tag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ProviderDashboard() {
  const { user, providerProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'feed';

  const [requestsFeed, setRequestsFeed] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState(null);
  const [selectedBookingForEvidence, setSelectedBookingForEvidence] = useState(null);
  const [activeTab, setActiveTab] = useState(currentTab);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['feed', 'jobs', 'quotes'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const [reqRes, bookRes, qRes] = await Promise.all([
        API.get('/requests'),
        API.get('/bookings'),
        API.get('/quotes')
      ]);
      setRequestsFeed(reqRes.data);
      setMyBookings(bookRes.data);
      setMyQuotes(qRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus, evidenceData = {}) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        ...evidenceData
      });
      setSelectedBookingForEvidence(null);
      fetchProviderData();
      alert(`Job status updated to: ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status');
    }
  };

  const totalEarnings = myBookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'WORK_COMPLETE')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
            alt="Provider"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              {providerProfile?.businessName || user?.name}
              {providerProfile?.verificationStatus === 'verified' && (
                <ShieldCheck className="w-5 h-5 text-emerald-700 fill-emerald-400/20" />
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Service Provider Workspace • Rate: <span className="text-emerald-700 font-bold">${providerProfile?.hourlyRate || 65}/hr</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 block">Total Earnings</span>
            <span className="text-base font-extrabold text-emerald-700">${totalEarnings}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 block">Completed Jobs</span>
            <span className="text-base font-extrabold text-blue-700">{providerProfile?.completedJobsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => handleTabChange('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'feed' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Open Requests Feed ({requestsFeed.length})
        </button>
        <button
          onClick={() => handleTabChange('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'jobs' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Jobs Pipeline ({myBookings.length})
        </button>
        <button
          onClick={() => handleTabChange('quotes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'quotes' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Submitted Quotes ({myQuotes.length})
        </button>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {requestsFeed.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs">
              No open service requests in your area right now. Check back soon!
            </div>
          ) : (
            requestsFeed.map((req) => (
              <div key={req._id} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3">
                {req.targetProvider && (
                  (req.targetProvider._id === user?._id) || (req.targetProvider === user?._id)
                ) && (
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-700 text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Direct Specialist Request: {req.customer?.name} specifically selected you for this {req.categoryName} job!</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-base">{req.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-700 text-[10px] font-semibold border border-teal-500/30">
                        {req.categoryName}
                      </span>
                      <StatusBadge status={req.urgency} />
                    </div>
                    <p className="text-xs text-slate-600">{req.description}</p>
                    <div className="text-[11px] text-slate-500 mt-1">Customer: {req.customer?.name} • Zip Code: {req.serviceAddress?.zipCode}</div>
                  </div>

                  <button
                    onClick={() => setSelectedRequestForQuote(req)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Submit Price Quote
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Jobs Pipeline Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 text-xs">
              No active bookings assigned yet.
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b._id} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-base">{b.serviceRequest?.title}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-slate-600">Customer: <span className="text-slate-900 font-semibold">{b.customer?.name}</span> ({b.customer?.phone || 'No phone'})</p>
                    <div className="text-[11px] text-slate-500 mt-1">Slot: {b.scheduledDate} ({b.timeSlot}) • Price: ${b.totalPrice}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {b.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b._id, 'IN_PROGRESS')}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                      >
                        Accept Job & Start Service
                      </button>
                    )}

                    {b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => setSelectedBookingForEvidence(b)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" /> Upload Proof of Work Evidence
                      </button>
                    )}

                    <Link
                      to={`/booking/${b._id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1"
                    >
                      Job Tracker <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Evidence Panel inline if selecting this booking */}
                {selectedBookingForEvidence?._id === b._id && (
                  <div className="pt-3 border-t border-slate-200">
                    <EvidenceUploader
                      existingBefore={b.workEvidence?.beforePhotos}
                      existingAfter={b.workEvidence?.afterPhotos}
                      existingNotes={b.workEvidence?.completionNotes}
                      onEvidenceSave={(evidence) => handleUpdateBookingStatus(b._id, 'WORK_COMPLETE', evidence)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {myQuotes.map((q) => (
            <div key={q._id} className="glass-panel p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block mb-1">{q.serviceRequest?.title}</span>
                <p className="text-slate-500">Quote: ${q.price} • Proposed: {q.proposedDate} ({q.proposedTimeSlot})</p>
              </div>
              <StatusBadge status={q.status} />
            </div>
          ))}
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedRequestForQuote && (
        <QuoteModal
          request={selectedRequestForQuote}
          onClose={() => setSelectedRequestForQuote(null)}
          onQuoteSubmitted={() => {
            fetchProviderData();
            alert('Quote submitted successfully!');
          }}
        />
      )}
    </div>
  );
}
