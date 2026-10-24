import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Appointment } from './types.ts';

export const SUPABASE_PROJECT_ID = 'aounovuycwpqbnqaeqcs';
export const SUPABASE_URL =
  process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  'sb_publishable_viRRK7LoAE7v2EroAIrBaA_omyntciS';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export const SUPABASE_SETUP_SQL = `-- 1. Create appointments table
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
  FOR UPDATE USING (true);

-- 6. Policy: Allow deleting appointments
DROP POLICY IF EXISTS "Allow deleting appointments" ON public.appointments;
CREATE POLICY "Allow deleting appointments" ON public.appointments
  FOR DELETE USING (true);
`;

/**
 * Insert or update an appointment in Supabase
 */
export async function saveAppointmentToSupabase(appointment: Appointment): Promise<{
  success: boolean;
  table?: string;
  error?: string;
  code?: string;
  data?: any;
}> {
  try {
    // 1. Try standard snake_case schema
    const snakeCasePayload = {
      id: appointment.id,
      patient_name: appointment.patientName,
      phone: appointment.phone,
      email: appointment.email || null,
      age: appointment.age || null,
      gender: appointment.gender || null,
      appointment_type: appointment.appointmentType,
      service_id: appointment.serviceId,
      service_name: appointment.serviceName,
      date: appointment.date,
      time_slot: appointment.timeSlot,
      concern: appointment.concern || null,
      status: appointment.status,
      admin_notes: appointment.adminNotes || null,
      created_at: appointment.createdAt || new Date().toISOString(),
      updated_at: appointment.updatedAt || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('appointments')
      .upsert(snakeCasePayload, { onConflict: 'id' })
      .select();

    if (!error) {
      console.log(`[Supabase] Successfully saved appointment ${appointment.id}`);
      return { success: true, table: 'appointments', data };
    }

    console.warn(`[Supabase] Insert attempt with snake_case failed: ${error.message} (${error.code})`);

    // 2. If column not found, try camelCase payload
    if (error.message.includes('column') || error.message.includes('does not exist')) {
      const camelCasePayload = {
        id: appointment.id,
        patientName: appointment.patientName,
        phone: appointment.phone,
        email: appointment.email || null,
        age: appointment.age || null,
        gender: appointment.gender || null,
        appointmentType: appointment.appointmentType,
        serviceId: appointment.serviceId,
        serviceName: appointment.serviceName,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        concern: appointment.concern || null,
        status: appointment.status,
        adminNotes: appointment.adminNotes || null,
        createdAt: appointment.createdAt || new Date().toISOString(),
        updatedAt: appointment.updatedAt || new Date().toISOString(),
      };

      const retryRes = await supabase
        .from('appointments')
        .upsert(camelCasePayload, { onConflict: 'id' })
        .select();

      if (!retryRes.error) {
        console.log(`[Supabase] Successfully saved appointment ${appointment.id} using camelCase`);
        return { success: true, table: 'appointments', data: retryRes.data };
      }
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  } catch (err: any) {
    console.error('[Supabase] Exception while saving appointment:', err);
    return {
      success: false,
      error: err.message || 'Unknown network error',
    };
  }
}

/**
 * Fetch all appointments from Supabase
 */
export async function fetchAppointmentsFromSupabase(): Promise<{
  success: boolean;
  appointments: Appointment[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, appointments: [], error: error.message };
    }

    const appointments: Appointment[] = (data || []).map((row: any) => ({
      id: row.id,
      patientName: row.patient_name || row.patientName || 'Patient',
      phone: row.phone || '',
      email: row.email || undefined,
      age: row.age ? Number(row.age) : undefined,
      gender: row.gender || 'Not specified',
      appointmentType: row.appointment_type || row.appointmentType || 'In-Clinic Consultation',
      serviceId: row.service_id || row.serviceId || 'srv-ortho-consult',
      serviceName: row.service_name || row.serviceName || 'Orthopedic Consultation',
      date: row.date,
      timeSlot: row.time_slot || row.timeSlot,
      concern: row.concern || undefined,
      status: (row.status as any) || 'pending',
      adminNotes: row.admin_notes || row.adminNotes || undefined,
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    }));

    return { success: true, appointments };
  } catch (err: any) {
    return { success: false, appointments: [], error: err.message };
  }
}

/**
 * Delete an appointment from Supabase
 */
export async function deleteAppointmentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Check connection status with the user's Supabase backend
 */
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  projectUrl: string;
  projectId: string;
  tableExists: boolean;
  message: string;
  error?: string;
  sqlToRun?: string;
}> {
  try {
    const { error } = await supabase.from('appointments').select('id').limit(1);

    if (!error) {
      return {
        connected: true,
        projectUrl: SUPABASE_URL,
        projectId: SUPABASE_PROJECT_ID,
        tableExists: true,
        message: 'Connected to Supabase. Table "appointments" is active and ready.',
      };
    }

    if (error.code === 'PGRST205' || error.message.includes('not find the table')) {
      return {
        connected: true,
        projectUrl: SUPABASE_URL,
        projectId: SUPABASE_PROJECT_ID,
        tableExists: false,
        message: 'Connected to Supabase project, but table "appointments" is not yet created.',
        error: error.message,
        sqlToRun: SUPABASE_SETUP_SQL,
      };
    }

    return {
      connected: true,
      projectUrl: SUPABASE_URL,
      projectId: SUPABASE_PROJECT_ID,
      tableExists: false,
      message: `Supabase responded: ${error.message}`,
      error: error.message,
      sqlToRun: SUPABASE_SETUP_SQL,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectUrl: SUPABASE_URL,
      projectId: SUPABASE_PROJECT_ID,
      tableExists: false,
      message: 'Failed to connect to Supabase.',
      error: err.message,
      sqlToRun: SUPABASE_SETUP_SQL,
    };
  }
}
