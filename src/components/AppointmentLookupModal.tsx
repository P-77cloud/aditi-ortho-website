import React, { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Clock3,
  Phone,
  RefreshCw,
} from 'lucide-react';
import type { Appointment, ClinicInfo } from '../services/api.ts';
import { api } from '../services/api.ts';

interface AppointmentLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicInfo: ClinicInfo;
}

export const AppointmentLookupModal: React.FC<AppointmentLookupModalProps> = ({
  isOpen,
  onClose,
  clinicInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Appointment[] | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const term = searchTerm.trim();
      const isBookingId = term.toUpperCase().startsWith('AOP-');
      const data = await api.lookupAppointments(
        isBookingId ? { id: term } : { phone: term }
      );
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'No appointment found with those details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <Clock3 className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            Cancelled
          </span>
        );
      case 'rescheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Rescheduled
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Track Your Appointment
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter your Booking Reference ID (e.g. AOP-202610-...) or registered 10-digit mobile number.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. AOP-202610-8241 or 9845112345"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {results && (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Found {results.length} record(s):
            </p>
            {results.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-800">
                    {app.id}
                  </span>
                  {getStatusBadge(app.status)}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {app.date} • {app.timeSlot}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium pt-1">
                    Service: <strong>{app.serviceName}</strong>
                  </div>
                </div>

                {app.adminNotes && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900">
                    <strong>Clinic Note:</strong> {app.adminNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Need immediate assistance?</span>
          <a
            href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
            className="font-bold text-teal-700 hover:underline flex items-center space-x-1"
          >
            <Phone className="w-3 h-3" />
            <span>Call {clinicInfo.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
