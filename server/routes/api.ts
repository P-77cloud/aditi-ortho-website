import express from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import {
  saveAppointmentToSupabase,
  checkSupabaseStatus,
  fetchAppointmentsFromSupabase,
  deleteAppointmentFromSupabase,
  SUPABASE_SETUP_SQL,
} from '../supabase.ts';

const router = express.Router();

// Simple in-memory session tokens for admin
const activeSessions = new Map<string, { createdAt: number }>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Middleware: Admin Authentication
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin token required' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  next();
}

// ==========================================
// CLINIC INFO
// ==========================================
router.get('/clinic-info', (req, res) => {
  try {
    const info = db.getClinicInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clinic information' });
  }
});

router.put('/clinic-info', requireAdmin, (req, res) => {
  try {
    const updated = db.updateClinicInfo(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update clinic information' });
  }
});

// ==========================================
// SERVICES
// ==========================================
router.get('/services', (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const services = db.getServices(includeInactive);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.post('/services', requireAdmin, (req, res) => {
  try {
    const { name, category, description, suitableFor, durationMinutes, priceText, isActive, iconName } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Service name and category are required' });
    }

    const created = db.addService({
      name,
      category,
      description: description || '',
      suitableFor: Array.isArray(suitableFor) ? suitableFor : [],
      durationMinutes: Number(durationMinutes) || 30,
      priceText: priceText || 'Consultation fee applies',
      isActive: isActive !== false,
      iconName: iconName || 'Activity',
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/services/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/services/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ==========================================
// SCHEDULE & AVAILABLE SLOTS
// ==========================================
router.get('/schedule', (req, res) => {
  try {
    const schedule = db.getSchedule();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

router.put('/schedule', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSchedule(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Generate dynamic available slots for a given date
router.get('/schedule/available-slots', (req, res) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const schedule = db.getSchedule();

    // Check if blocked
    if (schedule.blockedDates.includes(dateStr)) {
      return res.json({ available: false, reason: 'Clinic is closed on this date', slots: [] });
    }

    // Check if holiday
    const holiday = schedule.holidays.find((h) => h.date === dateStr);
    if (holiday) {
      return res.json({ available: false, reason: `Clinic Holiday: ${holiday.reason}`, slots: [] });
    }

    // Get day of week
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];

    const dayConfig = schedule.regularHours.find((h) => h.day === dayOfWeek);
    if (dayConfig && !dayConfig.isOpen && !schedule.isOpen24Hours) {
      return res.json({ available: false, reason: `Closed on ${dayOfWeek}s`, slots: [] });
    }

    // Base slots for appointments
    // Generate clean clinical slots (e.g. 09:00 AM to 08:30 PM)
    const standardSlots: string[] = [
      '09:00 AM - 09:30 AM',
      '09:30 AM - 10:00 AM',
      '10:00 AM - 10:30 AM',
      '10:30 AM - 11:00 AM',
      '11:00 AM - 11:30 AM',
      '11:30 AM - 12:00 PM',
      '12:00 PM - 12:30 PM',
      '12:30 PM - 01:00 PM',
      '02:00 PM - 02:30 PM',
      '02:30 PM - 03:00 PM',
      '03:00 PM - 03:30 PM',
      '03:30 PM - 04:00 PM',
      '04:00 PM - 04:30 PM',
      '04:30 PM - 05:00 PM',
      '05:00 PM - 05:30 PM',
      '05:30 PM - 06:00 PM',
      '06:00 PM - 06:30 PM',
      '06:30 PM - 07:00 PM',
      '07:00 PM - 07:30 PM',
      '07:30 PM - 08:00 PM',
      '08:00 PM - 08:30 PM',
    ];

    // Check existing appointments on this date
    const allAppointments = db.getAppointments();
    const dateBookings = allAppointments.filter(
      (a) => a.date === dateStr && a.status !== 'cancelled'
    );

    const slotCounts = new Map<string, number>();
    for (const b of dateBookings) {
      slotCounts.set(b.timeSlot, (slotCounts.get(b.timeSlot) || 0) + 1);
    }

    const maxPerSlot = schedule.maxBookingsPerSlot || 2;
    const slotsWithAvailability = standardSlots.map((slot) => {
      const bookedCount = slotCounts.get(slot) || 0;
      return {
        time: slot,
        isAvailable: bookedCount < maxPerSlot,
        remainingCapacity: Math.max(0, maxPerSlot - bookedCount),
      };
    });

    res.json({
      available: true,
      date: dateStr,
      day: dayOfWeek,
      isOpen24Hours: schedule.isOpen24Hours,
      slots: slotsWithAvailability,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate available slots' });
  }
});

// ==========================================
// CONTENT
// ==========================================
router.get('/content', (req, res) => {
  try {
    const content = db.getContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

router.put('/content', requireAdmin, (req, res) => {
  try {
    const updated = db.updateContent(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// ==========================================
// APPOINTMENTS
// ==========================================
// Public: Lookup by Booking ID or Phone
router.get('/appointments/lookup', (req, res) => {
  try {
    const { id, phone } = req.query;

    if (id && typeof id === 'string') {
      const app = db.getAppointmentById(id);
      if (!app) {
        return res.status(404).json({ error: 'Appointment not found for this Booking ID' });
      }
      return res.json([app]);
    }

    if (phone && typeof phone === 'string') {
      const apps = db.getAppointmentsByPhone(phone);
      if (!apps.length) {
        return res.status(404).json({ error: 'No appointments found for this phone number' });
      }
      return res.json(apps);
    }

    res.status(400).json({ error: 'Provide either id or phone parameter' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to lookup appointment' });
  }
});

// Admin: List all appointments with filters and optional source
router.get('/appointments', requireAdmin, async (req, res) => {
  try {
    const { status, date, search, source } = req.query;
    let appointments: any[] = [];

    if (source === 'supabase') {
      const sbResult = await fetchAppointmentsFromSupabase();
      appointments = sbResult.appointments;
    } else {
      // Local appointments
      appointments = db.getAppointments();

      // If source is 'all' or not specified, also merge any remote records from Supabase
      if (source !== 'local') {
        try {
          const sbResult = await fetchAppointmentsFromSupabase();
          if (sbResult.success && sbResult.appointments.length > 0) {
            const localIds = new Set(appointments.map((a) => a.id));
            for (const sbApp of sbResult.appointments) {
              if (!localIds.has(sbApp.id)) {
                appointments.push(sbApp);
              }
            }
          }
        } catch (e) {
          // Fallback to local gracefully
        }
      }
    }

    if (status && typeof status === 'string' && status !== 'all') {
      appointments = appointments.filter((a) => a.status === status);
    }

    if (date && typeof date === 'string') {
      appointments = appointments.filter((a) => a.date === date);
    }

    if (search && typeof search === 'string') {
      const term = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(term) ||
          a.phone.includes(term) ||
          a.id.toLowerCase().includes(term) ||
          (a.serviceName && a.serviceName.toLowerCase().includes(term))
      );
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Public: Create Appointment
router.post('/appointments', async (req, res) => {
  try {
    const {
      patientName,
      phone,
      email,
      age,
      gender,
      appointmentType,
      serviceId,
      serviceName,
      date,
      timeSlot,
      concern,
    } = req.body;

    if (!patientName || !phone || !date || !timeSlot) {
      return res.status(400).json({
        error: 'Patient name, phone number, appointment date, and time slot are required.',
      });
    }

    // Clean phone number validation
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Resolve service name if missing
    let resolvedServiceName = serviceName;
    if (!resolvedServiceName && serviceId) {
      const srv = db.getServiceById(serviceId);
      resolvedServiceName = srv ? srv.name : 'Orthopedic Consultation';
    }

    const created = db.createAppointment({
      patientName: patientName.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : undefined,
      age: age ? Number(age) : undefined,
      gender: gender || 'Not specified',
      appointmentType: appointmentType || 'In-Clinic Consultation',
      serviceId: serviceId || 'srv-ortho-consult',
      serviceName: resolvedServiceName || 'Orthopedic Consultation',
      date,
      timeSlot,
      concern: concern ? concern.trim() : undefined,
    });

    // Automatically sync appointment to Supabase database
    const supabaseResult = await saveAppointmentToSupabase(created);

    res.status(201).json({
      ...created,
      supabaseSynced: supabaseResult.success,
      supabaseStatus: supabaseResult,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit appointment request.' });
  }
});

// Admin: Update appointment (full edit, status change, notes)
const handleUpdateAppointment = async (req: express.Request, res: express.Response) => {
  try {
    const updated = db.updateAppointment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Sync updated data with Supabase
    saveAppointmentToSupabase(updated).catch((err) => {
      console.warn('[Supabase] Failed to sync update:', err);
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

router.put('/appointments/:id', requireAdmin, handleUpdateAppointment);
router.patch('/appointments/:id', requireAdmin, handleUpdateAppointment);

// Admin: Reschedule appointment
router.post('/appointments/:id/reschedule', requireAdmin, async (req, res) => {
  try {
    const { date, timeSlot, note } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'New date and time slot are required for rescheduling.' });
    }

    const existing = db.getAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const previousInfo = `Rescheduled from ${existing.date} (${existing.timeSlot}).`;
    const updatedNotes = note
      ? `${existing.adminNotes ? existing.adminNotes + ' | ' : ''}${previousInfo} Reason: ${note}`
      : `${existing.adminNotes ? existing.adminNotes + ' | ' : ''}${previousInfo}`;

    const updated = db.updateAppointment(req.params.id, {
      date,
      timeSlot,
      status: 'rescheduled',
      adminNotes: updatedNotes,
    });

    if (updated) {
      saveAppointmentToSupabase(updated).catch((err) => {
        console.warn('[Supabase] Reschedule sync warning:', err);
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// Admin: Cancel appointment
router.post('/appointments/:id/cancel', requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const existing = db.getAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const cancelNote = reason ? `Cancellation reason: ${reason}` : 'Cancelled by administrator.';
    const updatedNotes = existing.adminNotes
      ? `${existing.adminNotes} | ${cancelNote}`
      : cancelNote;

    const updated = db.updateAppointment(req.params.id, {
      status: 'cancelled',
      adminNotes: updatedNotes,
    });

    if (updated) {
      saveAppointmentToSupabase(updated).catch((err) => {
        console.warn('[Supabase] Cancel sync warning:', err);
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Admin: Delete appointment
router.delete('/appointments/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = db.deleteAppointment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Also delete from Supabase if present
    deleteAppointmentFromSupabase(req.params.id).catch((err) => {
      console.warn('[Supabase] Delete warning:', err);
    });

    res.json({ success: true, message: 'Appointment deleted successfully from database' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// ==========================================
// SUPABASE BACKEND INTEGRATION
// ==========================================
router.get('/supabase/status', async (req, res) => {
  try {
    const status = await checkSupabaseStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      message: 'Failed to check Supabase status',
      error: error.message,
    });
  }
});

// Admin: Sync all local appointments to Supabase
router.post('/supabase/sync', requireAdmin, async (req, res) => {
  try {
    const appointments = db.getAppointments();
    let synced = 0;
    const errors: any[] = [];

    for (const app of appointments) {
      const result = await saveAppointmentToSupabase(app);
      if (result.success) {
        synced++;
      } else {
        errors.push({ id: app.id, error: result.error });
      }
    }

    res.json({
      success: errors.length === 0,
      totalCount: appointments.length,
      syncedCount: synced,
      errors: errors.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Sync failed' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================
router.post('/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const isValid = db.verifyAdminPassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid administrator password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, { createdAt: Date.now() });

    res.json({
      success: true,
      token,
      message: 'Admin authentication successful',
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed due to a server error' });
  }
});

router.get('/admin/verify', requireAdmin, (req, res) => {
  res.json({ valid: true });
});

router.post('/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers.authorization?.substring(7).trim();
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/admin/change-password', requireAdmin, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (!db.verifyAdminPassword(currentPassword)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    db.setAdminPassword(newPassword);
    res.json({ success: true, message: 'Admin password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admin password' });
  }
});

router.get('/admin/stats', requireAdmin, (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

export default router;
