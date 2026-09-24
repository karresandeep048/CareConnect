import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ServicesDirectory from './pages/ServicesDirectory';
import ProviderDirectory from './pages/ProviderDirectory';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OpsDashboard from './pages/OpsDashboard';
import SupportDashboard from './pages/SupportDashboard';
import BookingDetails from './pages/BookingDetails';
import Estimator from './pages/Estimator';
import Showcase from './pages/Showcase';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import CareBot from './components/CareBot';

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen flex flex-col bg-canvas text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/estimate" element={<Estimator />} />
              <Route path="/showcase" element={<Showcase />} />

              {/* Protected Routes (Require Login) */}
              <Route path="/services" element={<ProtectedRoute><ServicesDirectory /></ProtectedRoute>} />
              <Route path="/providers" element={<ProtectedRoute><ProviderDirectory /></ProtectedRoute>} />

              {/* Role Dashboards */}
              <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/ops-dashboard" element={<ProtectedRoute allowedRoles={['ops_manager']}><OpsDashboard /></ProtectedRoute>} />
              <Route path="/support-dashboard" element={<ProtectedRoute allowedRoles={['support_agent']}><SupportDashboard /></ProtectedRoute>} />
              <Route path="/booking/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CareBot />
        </div>
      </Router>
    </AuthProvider>
  );
}
