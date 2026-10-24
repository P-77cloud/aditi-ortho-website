import { createClient } from '@supabase/supabase-js';
import type { Appointment } from '../types/index.ts';

export const SUPABASE_PROJECT_ID = 'aounovuycwpqbnqaeqcs';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 'sb_publishable_viRRK7LoAE7v2EroAIrBaA_omyntciS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function insertClientAppointment(appointment: Appointment) {
  try {
    const payload = {
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
      .upsert(payload, { onConflict: 'id' });

    return { success: !error, error: error?.message, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
