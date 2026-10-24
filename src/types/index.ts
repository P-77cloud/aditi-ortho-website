export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  appointmentType: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 10:30 AM"
  concern?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicService {
  id: string;
  name: string;
  category: 'Orthopedic Care' | 'Physiotherapy' | 'Pain Management';
  description: string;
  suitableFor: string[];
  durationMinutes: number;
  priceText: string;
  isActive: boolean;
  iconName: string;
}

export interface ScheduleConfig {
  isOpen24Hours: boolean;
  regularHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  slotDurationMinutes: number;
  bufferMinutes: number;
  blockedDates: string[]; // YYYY-MM-DD
  holidays: {
    date: string;
    reason: string;
  }[];
  maxBookingsPerSlot: number;
}

export interface ClinicInfo {
  name: string;
  tagline: string;
  category: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  googleMapsUrl: string;
  googleRating: number;
  totalReviews: number;
  operatingHoursDisplay: string;
  emergencyNotice: string;
}

export interface ConditionItem {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  suggestedDepartment: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  treatment: string;
  comment: string;
  verified: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Clinic' | 'Treatment Area' | 'Equipment' | 'Reception' | 'Facilities';
  imageUrl: string;
  description: string;
}

export interface ContentData {
  heroHeadline: string;
  heroSubheadline: string;
  aboutTitle: string;
  aboutDescription: string[];
  aboutPillars: {
    title: string;
    description: string;
  }[];
  conditions: ConditionItem[];
  faqs: FAQItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
}
