import React, { useState, useEffect } from 'react';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Activity, AlertCircle, MapPin, UserCheck, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OpsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpsData();
  }, []);

  const fetchOpsData = async () => {
    setLoading(true);
    try {
      const [bRes, rRes, pRes] = await Promise.all([
        API.get('/bookings'),
        API.get('/requests'),
        API.get('/providers')
      ]);
      setBookings(bRes.data);
      setRequests(rRes.data);
      setProviders(pRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" /> Operations Dispatch Center
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Global Booking Dispatch & Quality Control</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor active jobs platform-wide, handle provider dispatching & SLA breach escalations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Dispatch Board */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" /> Active Platform Job Feed ({bookings.length})
          </h3>

          {bookings.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-500 text-xs rounded-2xl">No active bookings to monitor</div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{b.serviceRequest?.title || 'Service Booking'}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>Customer: <span className="text-slate-900 font-semibold">{b.customer?.name}</span></div>
                  <div>Assigned Provider: <span className="text-emerald-700 font-semibold">{b.provider?.name}</span></div>
                  <div>Scheduled: {b.scheduledDate} ({b.timeSlot})</div>
                  <div>Total Price: ${b.totalPrice}</div>
                </div>
                <div className="flex justify-end">
                  <Link to={`/booking/${b._id}`} className="text-teal-700 hover:underline font-semibold flex items-center gap-1">
                    Inspect Full Evidence & Logs <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quality & Provider SLA Stats */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Ops Metrics & Coverage</h3>
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Total Unassigned Requests</span>
              <span className="font-bold text-amber-700">{requests.filter(r => r.status === 'OPEN').length}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Verified On-Duty Pros</span>
              <span className="font-bold text-emerald-700">{providers.filter(p => p.verificationStatus === 'verified').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Disputed Bookings</span>
              <span className="font-bold text-rose-600">{bookings.filter(b => b.status === 'DISPUTED').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
