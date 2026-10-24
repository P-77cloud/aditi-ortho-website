import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Download,
  Share2,
  PhoneCall,
  MessageCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type { ClinicService, ClinicInfo, Appointment } from '../services/api.ts';
import { api } from '../services/api.ts';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar.ts';
import { getBookingConfirmationWhatsAppUrl } from '../utils/whatsapp.ts';
import { insertClientAppointment } from '../services/supabase.ts';

interface BookingFlowProps {
  services: ClinicService[];
  clinicInfo: ClinicInfo;
  initialServiceId?: string;
  initialConcern?: string;
  onBookingSuccess?: (appointment: Appointment) => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  services,
  clinicInfo,
  initialServiceId,
  initialConcern,
  onBookingSuccess,
}) => {
  // Step state: 1: Service, 2: Date, 3: Slot, 4: Details, 5: Confirmation
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || (services[0]?.id ?? '')
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Tomorrow or today
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Patient Details
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Not specified');
  const [appointmentType, setAppointmentType] = useState<string>('In-Clinic Consultation');
  const [concern, setConcern] = useState<string>(initialConcern || '');

  // Slots Loading & Status
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsData, setSlotsData] = useState<{
    time: string;
    isAvailable: boolean;
    remainingCapacity: number;
  }[]>([]);
  const [slotAvailabilityReason, setSlotAvailabilityReason] = useState<string>('');

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Update initial props when changed externally
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
      // Advance to date selection if service provided
      if (step === 1) setStep(2);
    }
  }, [initialServiceId]);

  useEffect(() => {
    if (initialConcern) {
      setConcern(initialConcern);
    }
  }, [initialConcern]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    let isCancelled = false;

    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotAvailabilityReason('');
      setSelectedSlot('');
      try {
        const res = await api.getAvailableSlots(selectedDate);
        if (!isCancelled) {
          if (!res.available) {
            setSlotsData([]);
            setSlotAvailabilityReason(res.reason || 'Not available on this date');
          } else {
            setSlotsData(res.slots);
            // Auto pick first available slot
            const firstAvail = res.slots.find((s) => s.isAvailable);
            if (firstAvail) {
              setSelectedSlot(firstAvail.time);
            }
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setSlotAvailabilityReason('Failed to load slots. Please retry.');
        }
      } finally {
        if (!isCancelled) {
          setLoadingSlots(false);
        }
      }
    }

    fetchSlots();
    return () => {
      isCancelled = true;
    };
  }, [selectedDate]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Helper dates for quick select (next 14 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ iso, dayName, dayNum, monthName, isToday: i === 0 });
    }
    return dates;
  };

  const availableDates = generateDates();

  // Validate step 4
  const handleProceedToConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientName.trim()) {
      setErrorMessage('Please enter the patient’s full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for appointment confirmation.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select a valid time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const newApp = await api.createAppointment({
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        age: age ? Number(age) : undefined,
        gender,
        appointmentType,
        serviceId: selectedService?.id || 'srv-ortho-consult',
        serviceName: selectedService?.name || 'Orthopedic Consultation',
        date: selectedDate,
        timeSlot: selectedSlot,
        concern: concern.trim() || undefined,
      });

      setConfirmedBooking(newApp);
      setStep(5);

      // Also ensure direct client insertion to Supabase database
      insertClientAppointment(newApp).catch((err) => {
        console.warn('[Supabase] Client direct insert notice:', err);
      });

      if (onBookingSuccess) {
        onBookingSuccess(newApp);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit appointment. Please try again or call the clinic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setConfirmedBooking(null);
    setSelectedSlot('');
    setPatientName('');
    setPhone('');
    setEmail('');
    setAge('');
    setConcern('');
    setErrorMessage('');
  };

  return (
    <section id="book" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Instant Online Booking</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Schedule Your Clinic Appointment
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Book your orthopedic consultation, physiotherapy session, or pain evaluation in 5 quick steps with zero waiting.
          </p>
        </div>

        {/* Step Progress Indicator (Steps 1 to 4) */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xl mx-auto px-2">
              {[
                { s: 1, label: 'Service' },
                { s: 2, label: 'Date' },
                { s: 3, label: 'Time' },
                { s: 4, label: 'Details' },
              ].map((item, idx) => (
                <React.Fragment key={item.s}>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (step > item.s) setStep(item.s);
                      }}
                      disabled={step < item.s}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === item.s
                          ? 'bg-teal-700 text-white shadow-md shadow-teal-700/30 ring-4 ring-teal-100'
                          : step > item.s
                          ? 'bg-emerald-600 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {step > item.s ? <CheckCircle2 className="w-4 h-4" /> : item.s}
                    </button>
                    <span
                      className={`text-[11px] mt-1.5 font-semibold ${
                        step === item.s ? 'text-teal-900' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        step > item.s ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          {/* ==================================================== */}
          {/* STEP 1: SELECT SERVICE */}
          {/* ==================================================== */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Step 1: Choose Required Service
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Select the clinical service or therapy for your visit.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      selectedServiceId === srv.id
                        ? 'border-teal-700 bg-teal-50/50 shadow-md ring-1 ring-teal-700'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {srv.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          ~{srv.durationMinutes} mins
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900">{srv.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {srv.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-teal-800">
                        {srv.priceText || 'Standard Clinical Fee'}
                      </span>
                      <span
                        className={`font-bold ${
                          selectedServiceId === srv.id ? 'text-teal-700' : 'text-slate-400'
                        }`}
                      >
                        {selectedServiceId === srv.id ? '✓ Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md"
                >
                  <span>Continue to Date Selection</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: SELECT DATE */}
          {/* ==================================================== */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 2: Choose Preferred Date
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select a convenient day for your clinical visit.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">Selected Service:</span>
                  <p className="text-xs font-bold text-teal-800">{selectedService?.name}</p>
                </div>
              </div>

              {/* Quick Select Horizontal Calendar Bar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upcoming Dates (Next 14 Days)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((item) => (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => setSelectedDate(item.iso)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedDate === item.iso
                          ? 'border-teal-700 bg-teal-700 text-white shadow-md'
                          : 'border-slate-200 hover:border-teal-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase">{item.dayName}</div>
                      <div className="text-lg font-extrabold my-0.5">{item.dayNum}</div>
                      <div className="text-[10px] opacity-80">{item.monthName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Picker Fallback */}
              <div className="pt-2 flex items-center space-x-3 text-xs text-slate-600">
                <span>Or pick any future date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md"
                >
                  <span>Select Time Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: SELECT TIME SLOT */}
          {/* ==================================================== */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 3: Select Available Time Slot
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Consultation slots for{' '}
                    <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'full' })}</strong>
                  </p>
                </div>
              </div>

              {loadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                  <p className="text-xs text-slate-500">Checking clinic availability...</p>
                </div>
              ) : slotAvailabilityReason ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="font-semibold text-amber-900 text-sm">{slotAvailabilityReason}</p>
                  <p className="text-xs text-amber-800">
                    Please select an alternate date or call the clinic at {clinicInfo.phone} for urgent support.
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 transition-colors"
                  >
                    Change Date
                  </button>
                </div>
              ) : slotsData.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No slots currently configured for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Available slots (30 min sessions)</span>
                    <span className="flex items-center space-x-1.5 text-teal-800 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Real-time availability confirmed</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {slotsData.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                          selectedSlot === slot.time
                            ? 'border-teal-700 bg-teal-700 text-white shadow-md'
                            : slot.isAvailable
                            ? 'border-slate-200 hover:border-teal-300 bg-slate-50 text-slate-800'
                            : 'border-slate-100 bg-slate-100/60 text-slate-400 cursor-not-allowed line-through'
                        }`}
                      >
                        <div>{slot.time}</div>
                        {!slot.isAvailable && (
                          <span className="text-[10px] text-red-500 block">Booked</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(4)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <span>Enter Patient Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: PATIENT DETAILS */}
          {/* ==================================================== */}
          {step === 4 && (
            <form onSubmit={handleProceedToConfirmation} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Step 4: Patient Information
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Please provide details for the appointment record.
                </p>
              </div>

              {/* Selected Slot Recap Badge */}
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Service: </span>
                  <strong className="text-teal-900">{selectedService?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Date & Slot: </span>
                  <strong className="text-teal-900">{selectedDate} ({selectedSlot})</strong>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Used for WhatsApp & SMS confirmations.</p>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Age <span className="text-slate-400 font-normal">(Opt)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="e.g. 45"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    >
                      <option value="Not specified">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Appointment Type */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Preferred Visit Type
                  </label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="In-Clinic Consultation">In-Clinic Consultation (First Visit)</option>
                    <option value="Physiotherapy Session">Physiotherapy / Rehab Session</option>
                    <option value="Pain Management Assessment">Pain Management Assessment</option>
                    <option value="Follow-up Visit">Follow-up Visit / Post-Op Review</option>
                  </select>
                </div>

                {/* Short Description of Concern */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Brief Description of Concern / Symptoms <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Knee swelling when climbing stairs, or lower back stiffness for 2 weeks..."
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-sky-800 hover:from-teal-800 hover:to-sky-900 disabled:opacity-50 transition-all shadow-lg shadow-teal-900/15"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Submit Appointment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* STEP 5: CONFIRMATION PAGE */}
          {/* ==================================================== */}
          {step === 5 && confirmedBooking && (
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
              {/* Top Banner */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Appointment Request Received
                </h3>
                <p className="text-slate-600 text-sm max-w-lg mx-auto">
                  Your appointment request has been submitted successfully to Aditi Ortho, Physio & Pain Center.
                </p>
              </div>

              {/* Appointment Slip Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Booking Reference ID
                    </span>
                    <p className="text-lg font-mono font-extrabold text-teal-800">
                      {confirmedBooking.id}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Status: Pending Confirmation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Patient Name</span>
                    <p className="font-bold text-slate-900 text-sm">{confirmedBooking.patientName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Mobile Phone</span>
                    <p className="font-bold text-slate-900 text-sm">{confirmedBooking.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Service Selected</span>
                    <p className="font-bold text-slate-900 text-sm">{confirmedBooking.serviceName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Scheduled Date & Time</span>
                    <p className="font-bold text-teal-800 text-sm">
                      {confirmedBooking.date} • {confirmedBooking.timeSlot}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
                  <span className="font-bold text-slate-800 shrink-0">Clinic Location:</span>
                  <span>Avalipalya, 80ft Road, Sira Gate, Tumakuru, Karnataka 572106</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Add to Calendar */}
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsFile({
                      title: `Aditi Ortho Clinic: ${confirmedBooking.serviceName}`,
                      description: `Appointment ID: ${confirmedBooking.id}\nPatient: ${confirmedBooking.patientName}\nLocation: Avalipalya, 80ft Road, Sira Gate, Tumakuru\nPhone: +91 82771 23000`,
                      location: 'Avalipalya, 80ft Road, Sira Gate, Tumakuru, Karnataka 572106',
                      dateStr: confirmedBooking.date,
                      timeSlotStr: confirmedBooking.timeSlot,
                      bookingId: confirmedBooking.id,
                    });
                  }}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>Download .ICS</span>
                </button>

                {/* 2. Google Calendar */}
                <a
                  href={generateGoogleCalendarUrl({
                    title: `Aditi Ortho: ${confirmedBooking.serviceName}`,
                    description: `Appointment ID: ${confirmedBooking.id}\nPatient: ${confirmedBooking.patientName}`,
                    location: 'Avalipalya, 80ft Road, Sira Gate, Tumakuru, Karnataka 572106',
                    dateStr: confirmedBooking.date,
                    timeSlotStr: confirmedBooking.timeSlot,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-xs"
                >
                  <CalendarIcon className="w-4 h-4 text-sky-700" />
                  <span>Google Calendar</span>
                </a>

                {/* 3. WhatsApp Confirmation */}
                <a
                  href={getBookingConfirmationWhatsAppUrl(clinicInfo.whatsappNumber, {
                    bookingId: confirmedBooking.id,
                    patientName: confirmedBooking.patientName,
                    serviceName: confirmedBooking.serviceName,
                    date: confirmedBooking.date,
                    timeSlot: confirmedBooking.timeSlot,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send on WhatsApp</span>
                </a>

                {/* 4. Call Clinic */}
                <a
                  href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>Call Clinic</span>
                </a>
              </div>

              {/* Bottom Notice & Reset */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  Please arrive 10 minutes prior with any previous X-rays or prescriptions.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
