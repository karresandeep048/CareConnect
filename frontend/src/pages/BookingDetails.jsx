import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobTimeline from '../components/JobTimeline';
import StatusBadge from '../components/StatusBadge';
import EvidenceUploader from '../components/EvidenceUploader';
import { Calendar, Clock, MapPin, User, CheckCircle2, DollarSign, Camera, MessageSquare, AlertTriangle, ArrowLeft, Plus, Play, ShieldCheck, Key } from 'lucide-react';

export default function BookingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, extraData = {}) => {
    try {
      await API.put(`/bookings/${id}/status`, {
        status: newStatus,
        ...extraData
      });
      setShowUploader(false);
      fetchBookingDetails();
      alert(`Booking status updated to: ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await API.put(`/bookings/${id}/status`, { noteText: newNote });
      setNewNote('');
      fetchBookingDetails();
    } catch (err) {
      alert('Failed to add note');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading Booking Details...</div>;
  }

  if (!booking) {
    return <div className="text-center py-20 text-slate-500 text-xs">Booking not found.</div>;
  }

  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';

  const hasPhotos = (booking.workEvidence?.beforePhotos?.length > 0) || (booking.workEvidence?.afterPhotos?.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900">{booking.serviceRequest?.title}</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-slate-500">Booking ID: {booking._id}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Agreed Price</span>
            <span className="text-2xl font-extrabold text-emerald-700">${booking.totalPrice}</span>
          </div>
        </div>

        {/* Customer Verification PIN Card (Strictly Role-Enforced) */}
        {user?.role === 'provider' ? (
          /* SERVICE PROVIDER VIEW: Code is strictly masked as ••••. Provider must ask customer for PIN */
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-amber-700 text-sm">Customer PIN Verification</h4>
                  {booking.codeVerified ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-semibold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Code Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-semibold text-[10px] border border-amber-500/30">
                      PIN Verification Required
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Ask the customer for their secret 4-digit PIN upon completing the service. Enter it in the work completion form below to verify and complete the job.
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-amber-500/50 font-mono text-xl font-black text-amber-700 tracking-widest self-end sm:self-center shadow-inner">
              {booking.codeVerified ? 'VERIFIED' : '••••'}
            </div>
          </div>
        ) : (
          /* CUSTOMER VIEW: Customer sees their own secret PIN */
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-amber-700 text-sm">Customer Service Verification PIN</h4>
                  {booking.codeVerified ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-semibold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Code Verified
                    </span>
                  ) : booking.verificationCode ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-semibold text-[10px] border border-amber-500/30">
                      Active PIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 font-semibold text-[10px] border border-blue-500/30">
                      Pending Provider Acceptance
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {booking.verificationCode
                    ? 'Provider has accepted your booking! Share this secret 4-digit PIN with the technician upon service completion so they can verify work.'
                    : 'Your 4-digit service PIN will be generated and shown here once the service provider accepts and starts your job.'}
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-amber-500/50 font-mono text-xl font-black text-amber-700 tracking-widest self-end sm:self-center shadow-inner">
              {booking.verificationCode || 'PENDING'}
            </div>
          </div>
        )}

        {/* Visual Lifecycle Timeline Bar */}
        <JobTimeline currentStatus={booking.status} />
      </div>

      {/* Stage Action Banner */}
      {booking.status === 'SCHEDULED' && (
        <div className="p-5 bg-blue-950/40 rounded-3xl border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-700 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Stage 1: Slot Locked (Scheduled)
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Service Scheduled for {booking.scheduledDate} ({booking.timeSlot})</h3>
            <p className="text-slate-500 mt-0.5">
              {isProvider
                ? 'Click "Accept Job & Start Service" to confirm booking and generate the customer verification pass.'
                : 'Technician will confirm and start the service on the scheduled appointment date.'}
            </p>
          </div>

          {isProvider && (
            <button
              onClick={() => handleUpdateStatus('IN_PROGRESS')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center gap-2 shrink-0 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" /> Accept Job & Start Service
            </button>
          )}
        </div>
      )}

      {booking.status === 'IN_PROGRESS' && (
        <div className="p-5 bg-teal-950/40 rounded-3xl border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-700 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Stage 2: Service In Progress
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Technician is Actively Performing Service</h3>
            <p className="text-slate-500 mt-0.5">Upload before/after photos and technician notes below to submit work proof.</p>
          </div>
        </div>
      )}

      {booking.status === 'WORK_COMPLETE' && (
        <div className="p-5 bg-emerald-950/40 rounded-3xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Stage 3: Proof of Work Uploaded
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Technician Submitted Work Evidence</h3>
            <p className="text-slate-500 mt-0.5">Customer signoff required to confirm completion and release payment.</p>
          </div>

          <button
            onClick={() => handleUpdateStatus('COMPLETED')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0 transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-4 h-4" /> Digital Signoff & Confirm Payment
          </button>
        </div>
      )}

      {booking.status === 'COMPLETED' && (
        <div className="p-5 bg-emerald-950/30 rounded-3xl border border-emerald-500/40 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Stage 4: Job Confirmed & Paid</h3>
            <p className="text-slate-600">Customer digital signoff complete and payment has been processed.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence & Communication Logs */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Proof of Work Evidence Section */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-700" /> Proof of Work Evidence & Photos
              </h3>
              
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/40 text-teal-700 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> {showUploader ? 'Close Uploader' : 'Add / Upload Photos'}
              </button>
            </div>

            {/* Embedded Uploader (Active in IN_PROGRESS stage or when toggled) */}
            {(showUploader || booking.status === 'IN_PROGRESS') && (
              <div className="pt-2 pb-4">
                <EvidenceUploader
                  existingBefore={booking.workEvidence?.beforePhotos}
                  existingAfter={booking.workEvidence?.afterPhotos}
                  existingNotes={booking.workEvidence?.completionNotes}
                  onEvidenceSave={(evidence) => handleUpdateStatus('WORK_COMPLETE', evidence)}
                />
              </div>
            )}

            {/* Display Photos if uploaded or in completed stages */}
            {hasPhotos || booking.status === 'WORK_COMPLETE' || booking.status === 'COMPLETED' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                {/* Before */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-amber-700 block mb-2">Before Work Photos ({booking.workEvidence?.beforePhotos?.length || 0})</span>
                  {booking.workEvidence?.beforePhotos?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {booking.workEvidence.beforePhotos.map((url, i) => (
                        <img key={i} src={url} alt="before" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No before photos added.</p>
                  )}
                </div>

                {/* After */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-emerald-700 block mb-2">After / Completed Photos ({booking.workEvidence?.afterPhotos?.length || 0})</span>
                  {booking.workEvidence?.afterPhotos?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {booking.workEvidence.afterPhotos.map((url, i) => (
                        <img key={i} src={url} alt="after" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No after photos added.</p>
                  )}
                </div>
              </div>
            ) : (
              !showUploader && booking.status !== 'IN_PROGRESS' && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                  <Camera className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                  <p>Photos and completion evidence will appear here as the job progresses through stage 2 & 3.</p>
                </div>
              )
            )}

            {booking.workEvidence?.completionNotes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600 block mb-1">Technician Notes:</span>
                <p className="text-slate-500 font-sans">"{booking.workEvidence.completionNotes}"</p>
              </div>
            )}
          </div>

          {/* Job Communication Logs */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-700" /> Timeline & Job Communication Logs
            </h3>

            <div className="space-y-3">
              {booking.notes?.map((n, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold text-teal-700 capitalize">{n.senderRole}:</span>
                    <span className="text-[10px]">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-900">{n.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Post a note or update to the job log..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs">
                Post Note
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Details Summary & Actions */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Parties Involved</h3>

            <div>
              <span className="text-slate-500 block mb-1">Customer</span>
              <div className="font-semibold text-slate-900">{booking.customer?.name}</div>
              <div className="text-slate-500">{booking.customer?.email}</div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Service Provider</span>
              <div className="font-semibold text-emerald-700">{booking.provider?.name}</div>
              <div className="text-slate-500">{booking.provider?.email}</div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div>Scheduled Date: <span className="text-slate-900 font-semibold">{booking.scheduledDate}</span></div>
              <div>Time Window: <span className="text-slate-900 font-semibold">{booking.timeSlot}</span></div>
            </div>

            {booking.status === 'WORK_COMPLETE' && (
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Customer Digital Signoff
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

