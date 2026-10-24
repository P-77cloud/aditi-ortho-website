import type {
  Appointment,
  ClinicService,
  ScheduleConfig,
  ClinicInfo,
  ConditionItem,
  FAQItem,
  GalleryItem,
  TestimonialItem,
  ContentData,
} from '../types/index.ts';

export type {
  Appointment,
  ClinicService,
  ScheduleConfig,
  ClinicInfo,
  ConditionItem,
  FAQItem,
  GalleryItem,
  TestimonialItem,
  ContentData,
};

const BASE_URL = '/api';

export interface AvailableSlotResponse {
  available: boolean;
  date?: string;
  day?: string;
  reason?: string;
  isOpen24Hours?: boolean;
  slots: {
    time: string;
    isAvailable: boolean;
    remainingCapacity: number;
  }[];
}

export interface AdminStats {
  todayCount: number;
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalCount: number;
  pendingCount: number;
}

// Token helper
export const getAdminToken = (): string | null => {
  return localStorage.getItem('aop_admin_token');
};

export const setAdminToken = (token: string) => {
  localStorage.setItem('aop_admin_token', token);
};

export const clearAdminToken = () => {
  localStorage.removeItem('aop_admin_token');
};

const authHeader = (): Record<string, string> => {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// API Client
export const api = {
  // Clinic Info
  async getClinicInfo(): Promise<ClinicInfo> {
    const res = await fetch(`${BASE_URL}/clinic-info`);
    if (!res.ok) throw new Error('Failed to load clinic information');
    return res.json();
  },

  async updateClinicInfo(info: Partial<ClinicInfo>): Promise<ClinicInfo> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/clinic-info`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(info),
    });
    if (!res.ok) throw new Error('Failed to update clinic info');
    return res.json();
  },

  // Services
  async getServices(all = false): Promise<ClinicService[]> {
    const res = await fetch(`${BASE_URL}/services${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async createService(service: Omit<ClinicService, 'id'>): Promise<ClinicService> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to add service');
    return res.json();
  },

  async updateService(id: string, updates: Partial<ClinicService>): Promise<ClinicService> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  },

  async deleteService(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to delete service');
  },

  // Schedule & Slots
  async getSchedule(): Promise<ScheduleConfig> {
    const res = await fetch(`${BASE_URL}/schedule`);
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  },

  async updateSchedule(schedule: Partial<ScheduleConfig>): Promise<ScheduleConfig> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/schedule`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(schedule),
    });
    if (!res.ok) throw new Error('Failed to update schedule');
    return res.json();
  },

  async getAvailableSlots(date: string): Promise<AvailableSlotResponse> {
    const res = await fetch(`${BASE_URL}/schedule/available-slots?date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to fetch available time slots');
    return res.json();
  },

  // Content
  async getContent(): Promise<ContentData> {
    const res = await fetch(`${BASE_URL}/content`);
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  },

  async updateContent(content: Partial<ContentData>): Promise<ContentData> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/content`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(content),
    });
    if (!res.ok) throw new Error('Failed to update content');
    return res.json();
  },

  // Appointments
  async createAppointment(
    payload: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Appointment> {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit appointment');
    }
    return res.json();
  },

  async lookupAppointments(query: { id?: string; phone?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (query.id) params.append('id', query.id);
    if (query.phone) params.append('phone', query.phone);
    const res = await fetch(`${BASE_URL}/appointments/lookup?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'No appointment found');
    }
    return res.json();
  },

  async getAppointments(filters?: {
    status?: string;
    date?: string;
    search?: string;
    source?: string;
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.source) params.append('source', filters.source);

    const res = await fetch(`${BASE_URL}/appointments?${params.toString()}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update appointment');
    return res.json();
  },

  async rescheduleAppointment(
    id: string,
    payload: { date: string; timeSlot: string; note?: string }
  ): Promise<Appointment> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/appointments/${id}/reschedule`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reschedule appointment');
    }
    return res.json();
  },

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel appointment');
    }
    return res.json();
  },

  async deleteAppointment(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to delete appointment');
  },

  // Admin Auth
  async adminLogin(password: string): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid administrator password');
    }
    return res.json();
  },

  async verifyAdminToken(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/admin/verify`, {
        headers: authHeader(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/admin/logout`, {
        method: 'POST',
        headers: authHeader(),
      });
    } finally {
      clearAdminToken();
    }
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/admin/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change password');
    }
  },

  // Supabase Integration
  async getSupabaseStatus(): Promise<{
    connected: boolean;
    projectUrl: string;
    projectId: string;
    tableExists: boolean;
    message: string;
    error?: string;
    sqlToRun?: string;
  }> {
    const res = await fetch(`${BASE_URL}/supabase/status`);
    if (!res.ok) throw new Error('Failed to retrieve Supabase status');
    return res.json();
  },

  async syncSupabase(): Promise<{
    success: boolean;
    totalCount: number;
    syncedCount: number;
    errors?: any[];
  }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeader(),
    };
    const res = await fetch(`${BASE_URL}/supabase/sync`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sync with Supabase');
    }
    return res.json();
  },
};
