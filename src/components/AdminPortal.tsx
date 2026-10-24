import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Save,
  BarChart3,
  Layers,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  LogOut,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Copy,
  ExternalLink,
  Check,
  Download,
  Eye,
  Printer,
  PhoneCall,
  CalendarDays,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { getWhatsAppUrl } from '../utils/whatsapp.ts';
import type {
  Appointment,
  ClinicService,
  ScheduleConfig,
  ClinicInfo,
  ContentData,
  AdminStats,
} from '../services/api.ts';
import {
  api,
  setAdminToken,
  clearAdminToken,
  getAdminToken,
} from '../services/api.ts';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Active Tab: 'overview' | 'appointments' | 'services' | 'schedule' | 'clinic' | 'content' | 'security'
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [content, setContent] = useState<ContentData | null>(null);

  // Filter & Search states for Appointments
  const [appFilterStatus, setAppFilterStatus] = useState<string>('all');
  const [appFilterDate, setAppFilterDate] = useState<string>('');
  const [appSearch, setAppSearch] = useState<string>('');
  const [appSourceFilter, setAppSourceFilter] = useState<'all' | 'supabase' | 'local'>('all');
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Appointment Action Drawers & Modals
  const [inspectingApp, setInspectingApp] = useState<Appointment | null>(null);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [reschedulingApp, setReschedulingApp] = useState<Appointment | null>(null);
  const [cancellingApp, setCancellingApp] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('');
  const [rescheduleNote, setRescheduleNote] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');

  // Modal / Form Sub-states
  const [editingService, setEditingService] = useState<ClinicService | null>(null);
  const [isAddingService, setIsAddingService] = useState<boolean>(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState<boolean>(false);

  // New appointment form state
  const [newAppPatient, setNewAppPatient] = useState('');
  const [newAppPhone, setNewAppPhone] = useState('');
  const [newAppService, setNewAppService] = useState('');
  const [newAppDate, setNewAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAppSlot, setNewAppSlot] = useState('10:00 AM - 10:30 AM');
  const [newAppConcern, setNewAppConcern] = useState('');

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  // Supabase Integration state
  const [supabaseInfo, setSupabaseInfo] = useState<{
    connected: boolean;
    projectUrl: string;
    projectId: string;
    tableExists: boolean;
    message: string;
    error?: string;
    sqlToRun?: string;
  } | null>(null);
  const [supabaseSyncing, setSupabaseSyncing] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Verify existing token on open
  useEffect(() => {
    if (isOpen) {
      checkExistingAuth();
    }
  }, [isOpen]);

  const checkExistingAuth = async () => {
    const token = getAdminToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    const valid = await api.verifyAdminToken();
    if (valid) {
      setIsAuthenticated(true);
      loadAllAdminData();
    } else {
      clearAdminToken();
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.adminLogin(password);
      setAdminToken(res.token);
      setIsAuthenticated(true);
      setPassword('');
      loadAllAdminData();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Check password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.adminLogout();
    setIsAuthenticated(false);
  };

  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [sData, aData, srvData, schData, cData, cntData, sbData] = await Promise.all([
        api.getAdminStats(),
        api.getAppointments(),
        api.getServices(true),
        api.getSchedule(),
        api.getClinicInfo(),
        api.getContent(),
        api.getSupabaseStatus().catch(() => null),
      ]);
      setStats(sData);
      setAppointments(aData);
      setServices(srvData);
      setSchedule(schData);
      setClinicInfo(cData);
      setContent(cntData);
      if (sbData) setSupabaseInfo(sbData);
    } catch (e: any) {
      showNotice('error', 'Failed to load some dashboard data.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSupabaseSyncing(true);
    try {
      const res = await api.syncSupabase();
      showNotice(
        res.success ? 'success' : 'error',
        `Supabase Sync: ${res.syncedCount} of ${res.totalCount} appointments synced.`
      );
      // Refresh status
      const updatedStatus = await api.getSupabaseStatus();
      setSupabaseInfo(updatedStatus);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to sync with Supabase.');
    } finally {
      setSupabaseSyncing(false);
    }
  };

  const showNotice = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Appointment actions
  const handleUpdateAppStatus = async (id: string, status: Appointment['status'], notes?: string) => {
    try {
      const updated = await api.updateAppointment(id, { status, adminNotes: notes });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      const newStats = await api.getAdminStats();
      setStats(newStats);
      showNotice('success', `Appointment ${id} status updated to ${status}.`);
      onDataChanged();
    } catch (err: any) {
      showNotice('error', 'Failed to update status.');
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      await api.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      const newStats = await api.getAdminStats();
      setStats(newStats);
      showNotice('success', `Appointment ${id} removed.`);
      onDataChanged();
    } catch (err) {
      showNotice('error', 'Failed to delete appointment.');
    }
  };

  const handleReloadAppointments = async (source = appSourceFilter) => {
    setLoadingData(true);
    try {
      const data = await api.getAppointments({ source });
      setAppointments(data);
      const newStats = await api.getAdminStats();
      setStats(newStats);
      showNotice('success', `Loaded ${data.length} appointments (${source.toUpperCase()}).`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to reload appointments.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApp || !rescheduleDate || !rescheduleSlot) {
      showNotice('error', 'Please provide both date and time slot.');
      return;
    }
    try {
      const updated = await api.rescheduleAppointment(reschedulingApp.id, {
        date: rescheduleDate,
        timeSlot: rescheduleSlot,
        note: rescheduleNote || undefined,
      });
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (inspectingApp?.id === updated.id) setInspectingApp(updated);
      setReschedulingApp(null);
      showNotice('success', `Appointment ${updated.id} rescheduled to ${updated.date} (${updated.timeSlot}).`);
      onDataChanged();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to reschedule.');
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingApp) return;
    try {
      const updated = await api.cancelAppointment(cancellingApp.id, cancelReason || undefined);
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (inspectingApp?.id === updated.id) setInspectingApp(updated);
      setCancellingApp(null);
      setCancelReason('');
      showNotice('success', `Appointment ${updated.id} marked as cancelled.`);
      onDataChanged();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to cancel appointment.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    try {
      const updated = await api.updateAppointment(editingApp.id, editingApp);
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (inspectingApp?.id === updated.id) setInspectingApp(updated);
      setEditingApp(null);
      showNotice('success', `Appointment ${updated.id} updated successfully.`);
      onDataChanged();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save changes.');
    }
  };

  const handleExportCsv = () => {
    if (filteredAppointments.length === 0) {
      showNotice('error', 'No appointments to export.');
      return;
    }
    const headers = [
      'Booking ID',
      'Patient Name',
      'Phone',
      'Email',
      'Age',
      'Gender',
      'Appointment Type',
      'Service Name',
      'Date',
      'Time Slot',
      'Status',
      'Concern / Symptoms',
      'Admin Notes',
      'Created At',
    ];
    const rows = filteredAppointments.map((a) => [
      `"${a.id}"`,
      `"${a.patientName.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      `"${a.age || ''}"`,
      `"${a.gender || ''}"`,
      `"${a.appointmentType}"`,
      `"${a.serviceName.replace(/"/g, '""')}"`,
      `"${a.date}"`,
      `"${a.timeSlot}"`,
      `"${a.status}"`,
      `"${(a.concern || '').replace(/"/g, '""')}"`,
      `"${(a.adminNotes || '').replace(/"/g, '""')}"`,
      `"${a.createdAt}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AditiOrtho-Bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('success', `Exported ${filteredAppointments.length} bookings to CSV.`);
  };

  const handleCreateManualApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppPatient || !newAppPhone) {
      alert('Patient name and phone are required.');
      return;
    }
    try {
      const created = await api.createAppointment({
        patientName: newAppPatient,
        phone: newAppPhone,
        serviceId: newAppService || services[0]?.id || 'srv-ortho-consult',
        serviceName:
          services.find((s) => s.id === newAppService)?.name ||
          'Orthopedic Clinical Consultation',
        date: newAppDate,
        timeSlot: newAppSlot,
        appointmentType: 'Manual Clinic Entry',
        concern: newAppConcern || 'Walk-in / Phone appointment booked by front-desk',
      });
      // Auto confirm manual entries
      await api.updateAppointment(created.id, { status: 'confirmed' });
      setIsAddingAppointment(false);
      setNewAppPatient('');
      setNewAppPhone('');
      setNewAppConcern('');
      loadAllAdminData();
      showNotice('success', `Appointment booked for ${created.patientName} (ID: ${created.id})`);
      onDataChanged();
    } catch (e: any) {
      showNotice('error', 'Failed to create appointment.');
    }
  };

  // Service actions
  const handleSaveService = async (serviceData: Partial<ClinicService>) => {
    try {
      if (editingService && editingService.id) {
        const updated = await api.updateService(editingService.id, serviceData);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showNotice('success', 'Service updated successfully.');
      } else {
        const created = await api.createService({
          name: serviceData.name || 'New Service',
          category: serviceData.category || 'Orthopedic Care',
          description: serviceData.description || '',
          suitableFor: serviceData.suitableFor || [],
          durationMinutes: serviceData.durationMinutes || 30,
          priceText: serviceData.priceText || 'Consultation fee applies',
          isActive: serviceData.isActive !== false,
          iconName: 'Activity',
        });
        setServices((prev) => [...prev, created]);
        showNotice('success', 'New service added.');
      }
      setEditingService(null);
      setIsAddingService(false);
      onDataChanged();
    } catch (e) {
      showNotice('error', 'Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    try {
      await api.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      showNotice('success', 'Service deleted.');
      onDataChanged();
    } catch (e) {
      showNotice('error', 'Failed to delete service.');
    }
  };

  // Schedule Save
  const handleSaveSchedule = async () => {
    if (!schedule) return;
    try {
      const updated = await api.updateSchedule(schedule);
      setSchedule(updated);
      showNotice('success', 'Schedule settings saved successfully.');
      onDataChanged();
    } catch (e) {
      showNotice('error', 'Failed to update schedule.');
    }
  };

  // Clinic Info Save
  const handleSaveClinicInfo = async () => {
    if (!clinicInfo) return;
    try {
      const updated = await api.updateClinicInfo(clinicInfo);
      setClinicInfo(updated);
      showNotice('success', 'Clinic information updated.');
      onDataChanged();
    } catch (e) {
      showNotice('error', 'Failed to update clinic info.');
    }
  };

  // Content Save
  const handleSaveContent = async () => {
    if (!content) return;
    try {
      const updated = await api.updateContent(content);
      setContent(updated);
      showNotice('success', 'Website content updated.');
      onDataChanged();
    } catch (e) {
      showNotice('error', 'Failed to update content.');
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.changeAdminPassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      showNotice('success', 'Password successfully updated.');
    } catch (e: any) {
      showNotice('error', e.message || 'Password update failed.');
    }
  };

  if (!isOpen) return null;

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    if (appFilterStatus !== 'all' && app.status !== appFilterStatus) return false;
    if (appFilterDate && app.date !== appFilterDate) return false;
    if (appSearch) {
      const term = appSearch.toLowerCase();
      const match =
        app.patientName.toLowerCase().includes(term) ||
        app.phone.includes(term) ||
        app.id.toLowerCase().includes(term) ||
        app.serviceName.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Clinic Administration Portal
              </h2>
              <p className="text-xs text-slate-400">
                Aditi Ortho, Physio & Pain Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1.5"
                title="Log out of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)}>✕</button>
          </div>
        )}

        {/* Content Area */}
        {!isAuthenticated ? (
          /* ==================================================== */
          /* LOGIN SCREEN */
          /* ==================================================== */
          <div className="p-8 sm:p-12 max-w-md mx-auto my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Admin Authorization</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your secure administrator password to manage appointments, schedule, services, and clinic content.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Administrator Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md"
              >
                {authLoading ? 'Verifying...' : 'Access Dashboard'}
              </button>
            </form>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              <strong>Default Password:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">admin123</code>
              <br />
              You can change this password anytime in the <strong>Security Settings</strong> tab once logged in.
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* LOGGED IN DASHBOARD */
          /* ==================================================== */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'services', label: 'Services', icon: Layers },
                { id: 'schedule', label: 'Schedule & Slots', icon: Clock },
                { id: 'clinic', label: 'Clinic Info', icon: Settings },
                { id: 'content', label: 'Website Content', icon: FileText },
                { id: 'supabase', label: 'Supabase Sync', icon: Database },
                { id: 'security', label: 'Security', icon: KeyRound },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </aside>

            {/* Main Panel */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Dashboard Metrics</h3>
                      <p className="text-xs text-slate-500">
                        Live snapshot of appointment bookings and clinic performance.
                      </p>
                    </div>
                    <button
                      onClick={loadAllAdminData}
                      disabled={loadingData}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200">
                      <span className="text-[11px] font-bold text-teal-900 uppercase">Today</span>
                      <p className="text-2xl font-extrabold text-teal-950 mt-1">
                        {stats?.todayCount ?? 0}
                      </p>
                      <span className="text-[10px] text-teal-800">Scheduled Today</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-900 uppercase">Pending</span>
                      <p className="text-2xl font-extrabold text-amber-950 mt-1">
                        {stats?.pendingCount ?? 0}
                      </p>
                      <span className="text-[10px] text-amber-800">Needs Approval</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200">
                      <span className="text-[11px] font-bold text-sky-900 uppercase">Upcoming</span>
                      <p className="text-2xl font-extrabold text-sky-950 mt-1">
                        {stats?.upcomingCount ?? 0}
                      </p>
                      <span className="text-[10px] text-sky-800">Confirmed Future</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase">Completed</span>
                      <p className="text-2xl font-extrabold text-emerald-950 mt-1">
                        {stats?.completedCount ?? 0}
                      </p>
                      <span className="text-[10px] text-emerald-800">Treated Patients</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-700 uppercase">Total</span>
                      <p className="text-2xl font-extrabold text-slate-900 mt-1">
                        {stats?.totalCount ?? 0}
                      </p>
                      <span className="text-[10px] text-slate-500">All Time Bookings</span>
                    </div>
                  </div>

                  {/* Recent Pending Queue */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">
                        Pending Appointments Requiring Review
                      </h4>
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="text-xs font-bold text-teal-700 hover:underline"
                      >
                        View All Appointments →
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {appointments
                        .filter((a) => a.status === 'pending')
                        .slice(0, 5)
                        .map((app) => (
                          <div
                            key={app.id}
                            className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {app.patientName}
                                </span>
                                <span className="text-xs font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                  {app.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                {app.serviceName} • <strong>{app.date} ({app.timeSlot})</strong>
                              </p>
                              <p className="text-[11px] text-slate-500">Phone: {app.phone}</p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'confirmed')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'cancelled')}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-red-50 text-red-600 border border-slate-200 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}

                      {appointments.filter((a) => a.status === 'pending').length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          ✓ No pending requests. All appointments are reviewed!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {/* Top Bar with Database Source Switcher & Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          Appointments & Patient Bookings
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                          {filteredAppointments.length} Bookings
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage, inspect, reschedule, edit, cancel, or export clinical bookings.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Database Source Switcher */}
                      <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setAppSourceFilter('all');
                            handleReloadAppointments('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            appSourceFilter === 'all'
                              ? 'bg-white text-slate-900 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All Databases
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppSourceFilter('supabase');
                            handleReloadAppointments('supabase');
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            appSourceFilter === 'supabase'
                              ? 'bg-teal-700 text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Supabase Cloud
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppSourceFilter('local');
                            handleReloadAppointments('local');
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            appSourceFilter === 'local'
                              ? 'bg-white text-slate-900 shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Local Store
                        </button>
                      </div>

                      {/* Export CSV Button */}
                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
                        title="Download all filtered appointments into CSV / Excel spreadsheet"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export CSV</span>
                      </button>

                      {/* Manual Walk-in Booking Button */}
                      <button
                        type="button"
                        onClick={() => setIsAddingAppointment(true)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Book Walk-in</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    {/* Search */}
                    <div className="sm:col-span-6 relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search by patient name, phone, booking ID, service..."
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={appFilterStatus}
                        onChange={(e) => setAppFilterStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                      >
                        <option value="all">All Statuses ({appointments.length})</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="sm:col-span-3 flex items-center space-x-1">
                      <input
                        type="date"
                        value={appFilterDate}
                        onChange={(e) => setAppFilterDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                      {(appFilterDate || appSearch || appFilterStatus !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppFilterDate('');
                            setAppSearch('');
                            setAppFilterStatus('all');
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-1.5 py-1 rounded bg-slate-200/60"
                          title="Reset search and filters"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-3">Booking ID</th>
                          <th className="px-4 py-3">Patient Info</th>
                          <th className="px-4 py-3">Service</th>
                          <th className="px-4 py-3">Date & Slot</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAppointments.map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                            onClick={() => setInspectingApp(app)}
                          >
                            <td className="px-4 py-3 font-mono font-bold text-teal-800">
                              {app.id}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{app.patientName}</div>
                              <div className="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
                                <span>{app.phone}</span>
                                {app.age && <span>• {app.age}y</span>}
                              </div>
                              {app.concern && (
                                <div className="text-slate-400 text-[10px] truncate max-w-xs mt-0.5">
                                  {app.concern}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-800">
                                {app.serviceName}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {app.appointmentType}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{app.date}</div>
                              <div className="text-teal-700 font-medium text-[11px]">{app.timeSlot}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  app.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : app.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : app.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : app.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-purple-100 text-purple-800 border border-purple-200'
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3 text-right space-x-1 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* 1. Inspect */}
                              <button
                                type="button"
                                onClick={() => setInspectingApp(app)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="View Complete Appointment Record"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* 2. Edit */}
                              <button
                                type="button"
                                onClick={() => setEditingApp({ ...app })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 transition-colors"
                                title="Edit Appointment Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* 3. Reschedule */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReschedulingApp(app);
                                  setRescheduleDate(app.date);
                                  setRescheduleSlot(app.timeSlot);
                                  setRescheduleNote('');
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition-colors"
                                title="Reschedule Date & Time"
                              >
                                <CalendarDays className="w-3.5 h-3.5" />
                              </button>

                              {/* 4. Approve/Confirm if pending */}
                              {app.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppStatus(app.id, 'confirmed')}
                                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                                  title="Approve & Confirm"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* 5. Complete if confirmed */}
                              {app.status === 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAppStatus(app.id, 'completed')}
                                  className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                                  title="Mark as Completed"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* 6. Cancel */}
                              {app.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancellingApp(app);
                                    setCancelReason('');
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 transition-colors"
                                  title="Cancel Appointment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* 7. Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.id)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Delete Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {filteredAppointments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-500">
                              <p className="text-sm font-semibold">No appointments found matching current filters.</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Try changing your search query, status filter, or database source.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ==================================================== */}
                  {/* MODAL 1: INSPECT APPOINTMENT DETAIL */}
                  {/* ==================================================== */}
                  {inspectingApp && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Appointment Record
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                              <span>{inspectingApp.patientName}</span>
                              <span className="font-mono text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {inspectingApp.id}
                              </span>
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => setInspectingApp(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Status Strip */}
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Status: </span>
                            <span className="font-bold uppercase text-slate-900">{inspectingApp.status}</span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {inspectingApp.status !== 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateAppStatus(inspectingApp.id, 'confirmed')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Approve
                              </button>
                            )}

                            {inspectingApp.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateAppStatus(inspectingApp.id, 'completed')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Mobile Phone</span>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectingApp.phone}</p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</span>
                            <p className="font-medium text-slate-900 mt-0.5">{inspectingApp.email || 'Not provided'}</p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Age / Gender</span>
                            <p className="font-medium text-slate-900 mt-0.5">
                              {inspectingApp.age ? `${inspectingApp.age} years` : 'Age N/A'} • {inspectingApp.gender || 'Not specified'}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Appointment Type</span>
                            <p className="font-bold text-slate-900 mt-0.5">{inspectingApp.appointmentType}</p>
                          </div>

                          <div className="col-span-2">
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Clinical Service</span>
                            <p className="font-bold text-teal-900 text-sm mt-0.5">{inspectingApp.serviceName}</p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Scheduled Date</span>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectingApp.date}</p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold uppercase text-[10px]">Time Slot</span>
                            <p className="font-bold text-teal-800 text-sm mt-0.5">{inspectingApp.timeSlot}</p>
                          </div>

                          {inspectingApp.concern && (
                            <div className="col-span-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80">
                              <span className="text-[10px] font-bold uppercase text-amber-900">Patient's Symptoms / Concern:</span>
                              <p className="text-xs text-amber-950 mt-1 leading-relaxed">{inspectingApp.concern}</p>
                            </div>
                          )}

                          {inspectingApp.adminNotes && (
                            <div className="col-span-2 p-3 bg-slate-100 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold uppercase text-slate-600">Clinic / Admin Notes:</span>
                              <p className="text-xs text-slate-800 mt-1 leading-relaxed">{inspectingApp.adminNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            {/* WhatsApp link */}
                            <a
                              href={getWhatsAppUrl(
                                inspectingApp.phone,
                                `Hello ${inspectingApp.patientName}, regarding your appointment at Aditi Ortho, Physio & Pain Center for ${inspectingApp.serviceName} on ${inspectingApp.date} at ${inspectingApp.timeSlot} (Booking ID: ${inspectingApp.id}).`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Call link */}
                            <a
                              href={`tel:${inspectingApp.phone.replace(/[^0-9+]/g, '')}`}
                              className="px-3 py-2 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center space-x-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-teal-700" />
                              <span>Call</span>
                            </a>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingApp({ ...inspectingApp });
                                setInspectingApp(null);
                              }}
                              className="px-3.5 py-2 rounded-xl font-bold text-slate-800 bg-slate-100 hover:bg-slate-200"
                            >
                              Edit Details
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingApp(inspectingApp);
                                setRescheduleDate(inspectingApp.date);
                                setRescheduleSlot(inspectingApp.timeSlot);
                                setRescheduleNote('');
                                setInspectingApp(null);
                              }}
                              className="px-3.5 py-2 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800"
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* MODAL 2: EDIT FULL APPOINTMENT */}
                  {/* ==================================================== */}
                  {editingApp && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h4 className="font-bold text-base text-slate-900">
                            Edit Appointment ({editingApp.id})
                          </h4>
                          <button type="button" onClick={() => setEditingApp(null)}>✕</button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                          <div>
                            <label className="font-bold text-slate-700">Patient Full Name *</label>
                            <input
                              type="text"
                              required
                              value={editingApp.patientName}
                              onChange={(e) =>
                                setEditingApp({ ...editingApp, patientName: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-slate-700">Phone Number *</label>
                              <input
                                type="tel"
                                required
                                value={editingApp.phone}
                                onChange={(e) =>
                                  setEditingApp({ ...editingApp, phone: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700">Email Address</label>
                              <input
                                type="email"
                                value={editingApp.email || ''}
                                onChange={(e) =>
                                  setEditingApp({ ...editingApp, email: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-slate-700">Age</label>
                              <input
                                type="number"
                                value={editingApp.age || ''}
                                onChange={(e) =>
                                  setEditingApp({
                                    ...editingApp,
                                    age: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700">Status</label>
                              <select
                                value={editingApp.status}
                                onChange={(e) =>
                                  setEditingApp({
                                    ...editingApp,
                                    status: e.target.value as any,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl border mt-1 bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Service</label>
                            <select
                              value={editingApp.serviceId}
                              onChange={(e) => {
                                const selected = services.find((s) => s.id === e.target.value);
                                setEditingApp({
                                  ...editingApp,
                                  serviceId: e.target.value,
                                  serviceName: selected?.name || editingApp.serviceName,
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border mt-1 bg-white"
                            >
                              {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.category})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-slate-700">Date</label>
                              <input
                                type="date"
                                value={editingApp.date}
                                onChange={(e) =>
                                  setEditingApp({ ...editingApp, date: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700">Time Slot</label>
                              <input
                                type="text"
                                value={editingApp.timeSlot}
                                onChange={(e) =>
                                  setEditingApp({ ...editingApp, timeSlot: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Patient Symptoms / Concern</label>
                            <textarea
                              rows={2}
                              value={editingApp.concern || ''}
                              onChange={(e) =>
                                setEditingApp({ ...editingApp, concern: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            ></textarea>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Admin Notes / History</label>
                            <textarea
                              rows={2}
                              value={editingApp.adminNotes || ''}
                              onChange={(e) =>
                                setEditingApp({ ...editingApp, adminNotes: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            ></textarea>
                          </div>

                          <div className="pt-2 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingApp(null)}
                              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl text-white bg-slate-900 font-bold"
                            >
                              Save All Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* MODAL 3: RESCHEDULE APPOINTMENT */}
                  {/* ==================================================== */}
                  {reschedulingApp && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between border-b pb-3">
                          <div>
                            <h4 className="font-bold text-base text-slate-900">
                              Reschedule Appointment
                            </h4>
                            <p className="text-xs text-slate-500">
                              Patient: <strong>{reschedulingApp.patientName}</strong> ({reschedulingApp.id})
                            </p>
                          </div>
                          <button type="button" onClick={() => setReschedulingApp(null)}>✕</button>
                        </div>

                        <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
                          <div>
                            <label className="font-bold text-slate-700">New Appointment Date *</label>
                            <input
                              type="date"
                              required
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">New Time Slot *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 11:30 AM - 12:00 PM"
                              value={rescheduleSlot}
                              onChange={(e) => setRescheduleSlot(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Rescheduling Reason / Note</label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Patient requested morning slot, or doctor schedule updated..."
                              value={rescheduleNote}
                              onChange={(e) => setRescheduleNote(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            ></textarea>
                          </div>

                          <div className="pt-2 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setReschedulingApp(null)}
                              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl text-white bg-slate-900 font-bold"
                            >
                              Confirm Reschedule
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* MODAL 4: CANCEL APPOINTMENT */}
                  {/* ==================================================== */}
                  {cancellingApp && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between border-b pb-3">
                          <div>
                            <h4 className="font-bold text-base text-red-600 flex items-center space-x-1.5">
                              <AlertCircle className="w-5 h-5" />
                              <span>Cancel Appointment</span>
                            </h4>
                            <p className="text-xs text-slate-500">
                              Patient: <strong>{cancellingApp.patientName}</strong> ({cancellingApp.id})
                            </p>
                          </div>
                          <button type="button" onClick={() => setCancellingApp(null)}>✕</button>
                        </div>

                        <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
                          <p className="text-slate-600">
                            Are you sure you want to cancel this appointment? The status will be marked as cancelled in the database and Supabase.
                          </p>

                          <div>
                            <label className="font-bold text-slate-700">Cancellation Reason (Optional)</label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Patient cancelled by phone, or emergency conflict..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            ></textarea>
                          </div>

                          <div className="pt-2 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setCancellingApp(null)}
                              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100"
                            >
                              Go Back
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold"
                            >
                              Yes, Cancel Booking
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* MODAL 5: MANUAL BOOKING ENTRY */}
                  {/* ==================================================== */}
                  {isAddingAppointment && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h4 className="font-bold text-base text-slate-900">
                            Book Walk-in / Phone Patient
                          </h4>
                          <button onClick={() => setIsAddingAppointment(false)}>✕</button>
                        </div>

                        <form onSubmit={handleCreateManualApp} className="space-y-3 text-xs">
                          <div>
                            <label className="font-bold text-slate-700">Patient Name *</label>
                            <input
                              type="text"
                              required
                              value={newAppPatient}
                              onChange={(e) => setNewAppPatient(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={newAppPhone}
                              onChange={(e) => setNewAppPhone(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Service</label>
                            <select
                              value={newAppService}
                              onChange={(e) => setNewAppService(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1 bg-white"
                            >
                              {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-slate-700">Date</label>
                              <input
                                type="date"
                                value={newAppDate}
                                onChange={(e) => setNewAppDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700">Slot</label>
                              <input
                                type="text"
                                value={newAppSlot}
                                onChange={(e) => setNewAppSlot(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Notes / Concern</label>
                            <textarea
                              rows={2}
                              value={newAppConcern}
                              onChange={(e) => setNewAppConcern(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            ></textarea>
                          </div>

                          <div className="pt-2 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingAppointment(false)}
                              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl text-white bg-slate-900 font-bold"
                            >
                              Save Appointment
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SERVICES */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Manage Services</h3>
                      <p className="text-xs text-slate-500">
                        Add, edit, or remove orthopedic, physiotherapy, and pain management services.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingService(null);
                        setIsAddingService(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase">
                              {srv.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                srv.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {srv.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-slate-900">{srv.name}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {srv.description}
                          </p>

                          <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
                            <div>
                              Duration: <strong>~{srv.durationMinutes} mins</strong>
                            </div>
                            <div>
                              Pricing: <strong>{srv.priceText}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingService(srv);
                              setIsAddingService(true);
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            title="Edit Service"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add / Edit Service Modal */}
                  {isAddingService && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h4 className="font-bold text-base text-slate-900">
                            {editingService ? 'Edit Clinical Service' : 'Add New Service'}
                          </h4>
                          <button onClick={() => setIsAddingService(false)}>✕</button>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const fd = new FormData(form);
                            handleSaveService({
                              name: fd.get('name') as string,
                              category: fd.get('category') as any,
                              description: fd.get('description') as string,
                              durationMinutes: Number(fd.get('durationMinutes')),
                              priceText: fd.get('priceText') as string,
                              isActive: fd.get('isActive') === 'on',
                              suitableFor: (fd.get('suitableFor') as string)
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            });
                          }}
                          className="space-y-3 text-xs"
                        >
                          <div>
                            <label className="font-bold text-slate-700">Service Name *</label>
                            <input
                              type="text"
                              name="name"
                              required
                              defaultValue={editingService?.name || ''}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Category *</label>
                            <select
                              name="category"
                              defaultValue={editingService?.category || 'Orthopedic Care'}
                              className="w-full px-3 py-2 rounded-xl border mt-1 bg-white"
                            >
                              <option value="Orthopedic Care">Orthopedic Care</option>
                              <option value="Physiotherapy">Physiotherapy</option>
                              <option value="Pain Management">Pain Management</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">Description</label>
                            <textarea
                              name="description"
                              rows={2}
                              defaultValue={editingService?.description || ''}
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            ></textarea>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-slate-700">Duration (Mins)</label>
                              <input
                                type="number"
                                name="durationMinutes"
                                defaultValue={editingService?.durationMinutes || 30}
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700">Price Display</label>
                              <input
                                type="text"
                                name="priceText"
                                defaultValue={editingService?.priceText || 'Consultation fee applies'}
                                className="w-full px-3 py-2 rounded-xl border mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700">
                              Suitable For (comma separated)
                            </label>
                            <input
                              type="text"
                              name="suitableFor"
                              defaultValue={editingService?.suitableFor?.join(', ') || ''}
                              placeholder="e.g. Knee pain, Ligament rehab, Sciatica"
                              className="w-full px-3 py-2 rounded-xl border mt-1"
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-1">
                            <input
                              type="checkbox"
                              name="isActive"
                              id="isActive"
                              defaultChecked={editingService ? editingService.isActive : true}
                            />
                            <label htmlFor="isActive" className="font-bold text-slate-700">
                              Active & Available for Booking
                            </label>
                          </div>

                          <div className="pt-3 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingService(false)}
                              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl text-white bg-slate-900 font-bold"
                            >
                              Save Service
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SCHEDULE & SLOTS */}
              {activeTab === 'schedule' && schedule && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Schedule & Availability</h3>
                    <p className="text-xs text-slate-500">
                      Configure 24-hour operation, appointment slot lengths, buffer times, and holidays.
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-teal-900">Open 24 Hours Operation</h4>
                      <p className="text-xs text-teal-800">
                        Keeps clinic marked as 24/7 in listing and enables emergency appointment availability.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={schedule.isOpen24Hours}
                      onChange={(e) =>
                        setSchedule({ ...schedule, isOpen24Hours: e.target.checked })
                      }
                      className="w-5 h-5 accent-teal-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Slot Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={schedule.slotDurationMinutes}
                        onChange={(e) =>
                          setSchedule({
                            ...schedule,
                            slotDurationMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">Buffer Time (Minutes)</label>
                      <input
                        type="number"
                        value={schedule.bufferMinutes}
                        onChange={(e) =>
                          setSchedule({
                            ...schedule,
                            bufferMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Max Bookings Per Slot
                      </label>
                      <input
                        type="number"
                        value={schedule.maxBookingsPerSlot}
                        onChange={(e) =>
                          setSchedule({
                            ...schedule,
                            maxBookingsPerSlot: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1 text-xs"
                      />
                    </div>
                  </div>

                  {/* Blocked Dates */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      Block Dates (Clinic Closed - YYYY-MM-DD, comma separated)
                    </label>
                    <input
                      type="text"
                      value={schedule.blockedDates.join(', ')}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          blockedDates: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g. 2026-11-01, 2026-12-25"
                      className="w-full px-3 py-2 rounded-xl border text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveSchedule}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Schedule Configuration</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: CLINIC INFORMATION */}
              {activeTab === 'clinic' && clinicInfo && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Clinic Details & Contact</h3>
                    <p className="text-xs text-slate-500">
                      Update official clinic address, telephone, WhatsApp, Google Maps link, and operating hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700">Clinic Name</label>
                      <input
                        type="text"
                        value={clinicInfo.name}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">Tagline / Motto</label>
                      <input
                        type="text"
                        value={clinicInfo.tagline}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, tagline: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">Phone Number</label>
                      <input
                        type="text"
                        value={clinicInfo.phone}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">WhatsApp Number</label>
                      <input
                        type="text"
                        value={clinicInfo.whatsappNumber}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, whatsappNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700">Address Line</label>
                      <input
                        type="text"
                        value={clinicInfo.address}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, address: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">Landmark</label>
                      <input
                        type="text"
                        value={clinicInfo.landmark}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, landmark: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">City, State, Pincode</label>
                      <div className="grid grid-cols-3 gap-1">
                        <input
                          type="text"
                          value={clinicInfo.city}
                          onChange={(e) =>
                            setClinicInfo({ ...clinicInfo, city: e.target.value })
                          }
                          className="px-2 py-2 rounded-xl border mt-1"
                        />
                        <input
                          type="text"
                          value={clinicInfo.state}
                          onChange={(e) =>
                            setClinicInfo({ ...clinicInfo, state: e.target.value })
                          }
                          className="px-2 py-2 rounded-xl border mt-1"
                        />
                        <input
                          type="text"
                          value={clinicInfo.pincode}
                          onChange={(e) =>
                            setClinicInfo({ ...clinicInfo, pincode: e.target.value })
                          }
                          className="px-2 py-2 rounded-xl border mt-1"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700">Google Maps Destination URL</label>
                      <input
                        type="text"
                        value={clinicInfo.googleMapsUrl}
                        onChange={(e) =>
                          setClinicInfo({ ...clinicInfo, googleMapsUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700">Operating Hours Display Text</label>
                      <input
                        type="text"
                        value={clinicInfo.operatingHoursDisplay}
                        onChange={(e) =>
                          setClinicInfo({
                            ...clinicInfo,
                            operatingHoursDisplay: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveClinicInfo}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Clinic Information</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: WEBSITE CONTENT */}
              {activeTab === 'content' && content && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Website Content Management</h3>
                    <p className="text-xs text-slate-500">
                      Customize Hero copy, About section paragraphs, and FAQs.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700">Hero Headline</label>
                      <input
                        type="text"
                        value={content.heroHeadline}
                        onChange={(e) =>
                          setContent({ ...content, heroHeadline: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">Hero Subheadline</label>
                      <textarea
                        rows={2}
                        value={content.heroSubheadline}
                        onChange={(e) =>
                          setContent({ ...content, heroSubheadline: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      ></textarea>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">About Title</label>
                      <input
                        type="text"
                        value={content.aboutTitle}
                        onChange={(e) =>
                          setContent({ ...content, aboutTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveContent}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Content Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Security & Credentials</h3>
                    <p className="text-xs text-slate-500">
                      Update your administrator password using SHA-256 salted hashing.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">New Password (min 6 characters)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border mt-1"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 8: SUPABASE DATABASE INTEGRATION */}
              {activeTab === 'supabase' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          Supabase Backend Integration
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          Live Sync
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Appointments submitted on your website are automatically sent and persisted in your Supabase database.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSyncSupabase}
                        disabled={supabaseSyncing}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                        <span>{supabaseSyncing ? 'Syncing...' : 'Sync All Appointments'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Connection Details Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold">Supabase Project ID</span>
                        <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {supabaseInfo?.projectId || 'aounovuycwpqbnqaeqcs'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">Supabase Endpoint URL</span>
                        <p className="font-mono text-teal-800 text-xs mt-0.5 truncate">
                          {supabaseInfo?.projectUrl || 'https://aounovuycwpqbnqaeqcs.supabase.co'}
                        </p>
                      </div>

                      <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600 font-medium">Database Status:</span>
                          {supabaseInfo?.tableExists ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Connected & Table 'appointments' Ready</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Connected • Table 'appointments' pending creation in SQL Editor</span>
                            </span>
                          )}
                        </div>

                        <a
                          href="https://supabase.com/dashboard/project/aounovuycwpqbnqaeqcs/editor"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-bold text-teal-700 hover:underline"
                        >
                          <span>Open Supabase Table Editor</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* SQL Schema Script Setup Section */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-teal-400" />
                        <h4 className="font-bold text-sm text-white">
                          Supabase Table & Policies SQL Script
                        </h4>
                      </div>

                      <button
                        onClick={() => {
                          const sql = supabaseInfo?.sqlToRun || `-- 1. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  gender TEXT,
  appointment_type TEXT,
  service_id TEXT,
  service_name TEXT,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  concern TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public anonymous bookings from the website
DROP POLICY IF EXISTS "Allow anonymous website booking submissions" ON public.appointments;
CREATE POLICY "Allow anonymous website booking submissions" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- 4. Policy: Allow reading appointments
DROP POLICY IF EXISTS "Allow reading appointments" ON public.appointments;
CREATE POLICY "Allow reading appointments" ON public.appointments
  FOR SELECT USING (true);

-- 5. Policy: Allow updating appointments (e.g. status changes)
DROP POLICY IF EXISTS "Allow updating appointments" ON public.appointments;
CREATE POLICY "Allow updating appointments" ON public.appointments
  FOR UPDATE USING (true);`;
                          navigator.clipboard.writeText(sql);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 3000);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SQL Script</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      If you haven’t run this script yet in your Supabase project, click <strong>Copy SQL Script</strong>, open your{' '}
                      <a
                        href="https://supabase.com/dashboard/project/aounovuycwpqbnqaeqcs/sql"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-300 underline font-semibold"
                      >
                        Supabase SQL Editor
                      </a>
                      , paste, and click <strong>Run</strong>.
                    </p>

                    <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-300 overflow-x-auto max-h-48 border border-slate-800">
{supabaseInfo?.sqlToRun || `-- 1. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  gender TEXT,
  appointment_type TEXT,
  service_id TEXT,
  service_name TEXT,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  concern TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anonymous website booking submissions
CREATE POLICY "Allow anonymous website booking submissions" ON public.appointments
  FOR INSERT WITH CHECK (true);`}
                    </pre>
                  </div>

                  {/* Summary of local vs remote */}
                  <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-900">Automatic Real-Time Sync Active</h5>
                      <p className="mt-0.5 text-slate-600 leading-normal">
                        Every time a patient fills out and submits the appointment booking form on your website, the record is immediately saved to your Supabase database table (<code className="font-mono text-teal-900 font-bold">appointments</code>) with full patient contact info, selected service, date, time slot, and reference ID.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
