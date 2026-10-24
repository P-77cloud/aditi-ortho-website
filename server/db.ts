import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type {
  Appointment,
  ClinicService,
  ScheduleConfig,
  ClinicInfo,
  ContentData,
} from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

export interface DatabaseSchema {
  clinicInfo: ClinicInfo;
  services: ClinicService[];
  schedule: ScheduleConfig;
  content: ContentData;
  appointments: Appointment[];
  adminPasswordHash: string; // SHA-256 hash
  adminSalt: string;
}

// Initial seed data
const DEFAULT_SALT = 'aditi_ortho_salt_2026';
// Default password is 'admin123'
const DEFAULT_PASS_HASH = crypto
  .createHash('sha256')
  .update('admin123' + DEFAULT_SALT)
  .digest('hex');

const DEFAULT_DATA: DatabaseSchema = {
  clinicInfo: {
    name: 'Aditi Ortho, Physio & Pain Center',
    tagline: 'Move Better. Live Better. Pain-Free.',
    category: 'Orthopedic Clinic • Physiotherapy • Pain Management',
    address: 'Avalipalya, 80ft Road, Sira Gate',
    landmark: 'Near Sira Gate Circle, 80ft Main Road',
    city: 'Tumakuru',
    state: 'Karnataka',
    pincode: '572106',
    phone: '+91 82771 23000',
    whatsappNumber: '+91 82771 23000',
    email: 'aditiorthoclinic@gmail.com',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Aditi+Ortho%2C+Physio+%26+Pain+Center+Avalipalya+80ft+Road+Sira+Gate+Tumakuru+Karnataka+572106',
    googleRating: 5.0,
    totalReviews: 108,
    operatingHoursDisplay: 'Open 24 Hours (Round-the-clock emergency support & scheduled appointments)',
    emergencyNotice:
      'For severe acute trauma or medical emergencies, visit the nearest emergency facility or call 108 immediately.',
  },
  services: [
    {
      id: 'srv-ortho-consult',
      name: 'Orthopedic Clinical Consultation',
      category: 'Orthopedic Care',
      description:
        'Comprehensive clinical evaluation for joint pain, spinal conditions, bone health, arthritis, and musculoskeletal disorders with personalized treatment roadmaps.',
      suitableFor: [
        'Persistent Joint & Bone Pain',
        'Arthritis & Knee Degeneration',
        'Spinal & Disc Discomfort',
        'Fracture Follow-ups',
      ],
      durationMinutes: 30,
      priceText: 'Consultation Fee Applies',
      isActive: true,
      iconName: 'Activity',
    },
    {
      id: 'srv-physio-rehab',
      name: 'Personalized Physiotherapy & Rehabilitation',
      category: 'Physiotherapy',
      description:
        'Hands-on manual therapy, targeted therapeutic exercise regimens, and electrotherapy modalities designed to restore mobility, strengthen core muscles, and accelerate recovery.',
      suitableFor: [
        'Post-Surgical Joint Rehabilitation',
        'Sports & Ligament Injuries',
        'Stiffness & Range of Motion Loss',
        'Posture-Induced Strain',
      ],
      durationMinutes: 45,
      priceText: 'Per Session Plan Available',
      isActive: true,
      iconName: 'Zap',
    },
    {
      id: 'srv-pain-management',
      name: 'Specialized Pain Assessment & Management',
      category: 'Pain Management',
      description:
        'Evidence-based non-surgical interventions, ergonomic guidance, and multimodal therapy aimed at alleviating acute and chronic musculoskeletal discomfort.',
      suitableFor: [
        'Chronic Lower Back & Sciatica Pain',
        'Cervical Neck Strain & Headaches',
        'Frozen Shoulder & Tendonitis',
        'Myofascial Pain Syndromes',
      ],
      durationMinutes: 30,
      priceText: 'Customized Care Plan',
      isActive: true,
      iconName: 'ShieldCheck',
    },
    {
      id: 'srv-post-op',
      name: 'Post-Operative Orthopedic Care',
      category: 'Orthopedic Care',
      description:
        'Structured recovery protocols following joint replacement, ligament repair, or trauma surgeries, emphasizing safe mobilization and functional independence.',
      suitableFor: [
        'Post Total Knee / Hip Replacement',
        'Post ACL / Meniscus Repair',
        'Post Fracture Cast Removal',
      ],
      durationMinutes: 45,
      priceText: 'Consultation & Rehab Package',
      isActive: true,
      iconName: 'HeartPulse',
    },
  ],
  schedule: {
    isOpen24Hours: true,
    regularHours: [
      { day: 'Monday', open: '08:30 AM', close: '09:00 PM', isOpen: true },
      { day: 'Tuesday', open: '08:30 AM', close: '09:00 PM', isOpen: true },
      { day: 'Wednesday', open: '08:30 AM', close: '09:00 PM', isOpen: true },
      { day: 'Thursday', open: '08:30 AM', close: '09:00 PM', isOpen: true },
      { day: 'Friday', open: '08:30 AM', close: '09:00 PM', isOpen: true },
      { day: 'Saturday', open: '08:30 AM', close: '09:00 PM', isOpen: true },
      { day: 'Sunday', open: '09:00 AM', close: '06:00 PM', isOpen: true },
    ],
    slotDurationMinutes: 30,
    bufferMinutes: 10,
    blockedDates: [],
    holidays: [],
    maxBookingsPerSlot: 2,
  },
  content: {
    heroHeadline: 'Move Better. Live Better. Pain-Free.',
    heroSubheadline:
      'Personalized orthopedic, physiotherapy, and pain-management care focused on helping you move with greater comfort, strength, and confidence.',
    aboutTitle: 'Compassionate, Evidence-Guided Orthopedic & Rehabilitation Care',
    aboutDescription: [
      'Aditi Ortho, Physio & Pain Center is a dedicated healthcare facility in Tumakuru, Karnataka, specializing in modern orthopedic diagnostics, evidence-based physiotherapy, and advanced pain management protocols.',
      'Our approach centers around comprehensive clinical assessments rather than one-size-fits-all treatments. Whether recovering from an acute sports injury, managing long-term joint stiffness, or rehabilitating after orthopedic surgery, we partner with you on every step towards pain-free movement.',
    ],
    aboutPillars: [
      {
        title: 'Patient-Focused Care',
        description:
          'Every treatment plan is tailored to the individual’s daily routine, physical demands, and specific recovery goals.',
      },
      {
        title: 'Integrated Modalities',
        description:
          'Combining orthopedic clinical evaluation with targeted physiotherapy and pain interventions under one roof.',
      },
      {
        title: 'Modern Clinical Environment',
        description:
          'Hygienic, accessible, and equipped with therapeutic modalities for safe and comfortable recovery.',
      },
      {
        title: 'Convenient 24/7 Access',
        description:
          'Open 24 hours with seamless online booking, emergency availability, and prompt patient assistance.',
      },
    ],
    conditions: [
      {
        id: 'cond-back',
        title: 'Lower & Upper Back Pain',
        description:
          'Evaluation and therapeutic relief for lumbar strain, postural stress, stiffness, and radiating pain.',
        symptoms: ['Sharp or dull ache in lower back', 'Stiffness after sitting', 'Muscle spasms'],
        suggestedDepartment: 'Orthopedic Care & Physiotherapy',
      },
      {
        id: 'cond-neck',
        title: 'Neck Pain & Cervical Spondylosis',
        description:
          'Targeted rehabilitation for desk-job neck strain, cervical spine discomfort, and restricted head rotation.',
        symptoms: ['Radiating shoulder tightness', 'Restricted neck motion', 'Postural tension'],
        suggestedDepartment: 'Physiotherapy & Pain Management',
      },
      {
        id: 'cond-knee',
        title: 'Knee & Joint Arthritis',
        description:
          'Strengthening and mobility protocols to preserve joint cartilage, improve walking comfort, and ease stiffness.',
        symptoms: ['Clicking sounds or swelling', 'Difficulty climbing stairs', 'Morning stiffness'],
        suggestedDepartment: 'Orthopedic Care',
      },
      {
        id: 'cond-shoulder',
        title: 'Frozen Shoulder & Rotator Cuff Pain',
        description:
          'Gentle joint mobilization, pain relief techniques, and progressive stretching for regained arm mobility.',
        symptoms: ['Inability to lift arm overhead', 'Night-time shoulder ache', 'Sharp movement catches'],
        suggestedDepartment: 'Physiotherapy & Pain Management',
      },
      {
        id: 'cond-sports',
        title: 'Sports & Muscular Injuries',
        description:
          'Structured injury reconditioning for sprains, ligament tears, hamstring pulls, and overuse fatigue.',
        symptoms: ['Sudden muscle pull', 'Joint instability', 'Localized swelling and tenderness'],
        suggestedDepartment: 'Physiotherapy',
      },
      {
        id: 'cond-sciatica',
        title: 'Sciatica & Nerve Impingement',
        description:
          'Non-surgical decompression exercises and nerve-gliding therapy to ease burning sensations and numbness.',
        symptoms: ['Shooting leg discomfort', 'Numbness or tingling in feet', 'Pain aggravated by sitting'],
        suggestedDepartment: 'Pain Management',
      },
    ],
    faqs: [
      {
        id: 'faq-1',
        question: 'How can I book an appointment at Aditi Ortho, Physio & Pain Center?',
        answer:
          'You can easily book online directly using the appointment booking form on this website in under 2 minutes. Alternatively, call us at +91 82771 23000 or message us on WhatsApp.',
        category: 'Booking & Visiting',
      },
      {
        id: 'faq-2',
        question: 'Can I contact the clinic directly through WhatsApp?',
        answer:
          'Yes, our WhatsApp line (+91 82771 23000) is actively monitored for appointment enquiries, scheduling updates, and directions.',
        category: 'Communication',
      },
      {
        id: 'faq-3',
        question: 'Where is the clinic located in Tumakuru?',
        answer:
          'We are located at Avalipalya, 80ft Road, Sira Gate, Tumakuru, Karnataka 572106. The clinic is easily accessible from all parts of the city with ample parking.',
        category: 'Location & Access',
      },
      {
        id: 'faq-4',
        question: 'How do I reach the clinic using Google Maps?',
        answer:
          'Click the "Get Directions" button anywhere on our website to immediately open Google Maps navigation to our front entrance.',
        category: 'Location & Access',
      },
      {
        id: 'faq-5',
        question: 'What documents or items should I bring to my appointment?',
        answer:
          'Please bring any recent X-rays, MRI reports, blood work, surgical discharge summaries, and a list of current medications. Wearing loose, comfortable clothing is recommended for physical examinations.',
        category: 'Consultation',
      },
      {
        id: 'faq-6',
        question: 'Do I need an appointment before visiting the clinic?',
        answer:
          'Scheduled appointments ensure minimal waiting time. However, walk-in patients and acute orthopedic concerns are accommodated based on clinical urgency.',
        category: 'Booking & Visiting',
      },
    ],
    testimonials: [
      {
        id: 'test-1',
        author: 'Naveen Kumar',
        rating: 5,
        date: 'Recent Google Review',
        treatment: 'Orthopedic Consultation & Knee Care',
        comment:
          'Exceptional care and very thorough examination. The doctor explained the exact cause of my knee pain and provided a clear recovery routine. Highly recommended in Tumakuru!',
        verified: true,
      },
      {
        id: 'test-2',
        author: 'Suma R.',
        rating: 5,
        date: 'Recent Google Review',
        treatment: 'Physiotherapy & Cervical Spine Rehab',
        comment:
          'Very professional physiotherapy sessions. My chronic neck stiffness and shoulder pain decreased significantly within two weeks. The clinic is clean and well organized.',
        verified: true,
      },
      {
        id: 'test-3',
        author: 'Mahesh Gowda',
        rating: 5,
        date: 'Recent Google Review',
        treatment: 'Back Pain & Posture Therapy',
        comment:
          'Great experience. They prioritize natural rehabilitation and exercises before rushing to unnecessary treatments. Friendly staff and punctual timings.',
        verified: true,
      },
      {
        id: 'test-4',
        author: 'Pavitra M.',
        rating: 5,
        date: 'Recent Google Review',
        treatment: 'Post-Fracture Rehabilitation',
        comment:
          'Helped my mother regain complete arm movement after fracture healing. The physiotherapist was extremely patient and supportive throughout.',
        verified: true,
      },
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'Modern Clinic Reception & Waiting Area',
        category: 'Reception',
        imageUrl:
          'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200',
        description:
          'Welcoming, sanitary reception and waiting lounge with comfortable seating and sanitized amenities.',
      },
      {
        id: 'gal-2',
        title: 'Orthopedic Consultation Suite',
        category: 'Clinic',
        imageUrl:
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
        description:
          'Private doctor consultation room equipped for physical assessment, joint mobility checks, and patient discussion.',
      },
      {
        id: 'gal-3',
        title: 'Physiotherapy & Exercise Rehab Wing',
        category: 'Treatment Area',
        imageUrl:
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
        description:
          'Dedicated therapy space for active stretching, balance retraining, and therapeutic movement exercises.',
      },
      {
        id: 'gal-4',
        title: 'Spine & Joint Treatment Modalities',
        category: 'Equipment',
        imageUrl:
          'https://images.unsplash.com/photo-1583912267670-6575ad472688?auto=format&fit=crop&q=80&w=1200',
        description:
          'Advanced physiotherapy equipment including electrotherapy, ultrasound modalities, and traction support.',
      },
      {
        id: 'gal-5',
        title: 'Mobility & Post-Op Recovery Unit',
        category: 'Facilities',
        imageUrl:
          'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1200',
        description:
          'Safe clinical setup for post-surgical mobilization, parallel bar gait training, and progressive load bearing.',
      },
      {
        id: 'gal-6',
        title: 'Pain Assessment & Manual Therapy Station',
        category: 'Treatment Area',
        imageUrl:
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
        description:
          'Cushioned treatment couches designed for manual soft tissue therapy and joint decompression.',
      },
    ],
  },
  appointments: [
    {
      id: 'AOP-824102',
      patientName: 'Ramesh Babu',
      phone: '+91 98451 12345',
      email: 'ramesh.babu@example.com',
      age: 48,
      gender: 'Male',
      appointmentType: 'In-Clinic Consultation',
      serviceId: 'srv-ortho-consult',
      serviceName: 'Orthopedic Clinical Consultation',
      date: '2026-10-06',
      timeSlot: '10:00 AM - 10:30 AM',
      concern: 'Persistent right knee pain when walking downhill for past 3 weeks.',
      status: 'confirmed',
      adminNotes: 'Reviewed prior X-ray, suggested weight-bearing physical checkup.',
      createdAt: '2026-10-04T09:30:00.000Z',
      updatedAt: '2026-10-04T10:15:00.000Z',
    },
    {
      id: 'AOP-824103',
      patientName: 'Geetha Sharma',
      phone: '+91 94480 87654',
      email: 'geetha.s@example.com',
      age: 39,
      gender: 'Female',
      appointmentType: 'Physiotherapy Session',
      serviceId: 'srv-physio-rehab',
      serviceName: 'Personalized Physiotherapy & Rehabilitation',
      date: '2026-10-06',
      timeSlot: '11:00 AM - 11:45 AM',
      concern: 'Cervical stiffness and shoulder muscle pull from computer work.',
      status: 'pending',
      createdAt: '2026-10-05T08:00:00.000Z',
      updatedAt: '2026-10-05T08:00:00.000Z',
    },
  ],
  adminPasswordHash: DEFAULT_PASS_HASH,
  adminSalt: DEFAULT_SALT,
};

// Database helper
class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with defaults in case new fields were added
        return {
          ...DEFAULT_DATA,
          ...parsed,
          clinicInfo: { ...DEFAULT_DATA.clinicInfo, ...(parsed.clinicInfo || {}) },
          content: { ...DEFAULT_DATA.content, ...(parsed.content || {}) },
          schedule: { ...DEFAULT_DATA.schedule, ...(parsed.schedule || {}) },
        };
      }
    } catch (e) {
      console.error('Error loading DB file, fallback to defaults:', e);
    }

    this.saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB file:', e);
    }
  }

  // Clinic Info
  getClinicInfo(): ClinicInfo {
    return this.data.clinicInfo;
  }

  updateClinicInfo(info: Partial<ClinicInfo>): ClinicInfo {
    this.data.clinicInfo = { ...this.data.clinicInfo, ...info };
    this.saveData(this.data);
    return this.data.clinicInfo;
  }

  // Services
  getServices(includeInactive = false): ClinicService[] {
    if (includeInactive) return this.data.services;
    return this.data.services.filter((s) => s.isActive);
  }

  getServiceById(id: string): ClinicService | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  addService(service: Omit<ClinicService, 'id'>): ClinicService {
    const newService: ClinicService = {
      ...service,
      id: `srv-${Date.now().toString(36)}`,
    };
    this.data.services.push(newService);
    this.saveData(this.data);
    return newService;
  }

  updateService(id: string, updates: Partial<ClinicService>): ClinicService | null {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.saveData(this.data);
    return this.data.services[idx];
  }

  deleteService(id: string): boolean {
    const initialLen = this.data.services.length;
    this.data.services = this.data.services.filter((s) => s.id !== id);
    if (this.data.services.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Schedule
  getSchedule(): ScheduleConfig {
    return this.data.schedule;
  }

  updateSchedule(updates: Partial<ScheduleConfig>): ScheduleConfig {
    this.data.schedule = { ...this.data.schedule, ...updates };
    this.saveData(this.data);
    return this.data.schedule;
  }

  // Content
  getContent(): ContentData {
    return this.data.content;
  }

  updateContent(updates: Partial<ContentData>): ContentData {
    this.data.content = { ...this.data.content, ...updates };
    this.saveData(this.data);
    return this.data.content;
  }

  // Appointments
  getAppointments(): Appointment[] {
    return [...this.data.appointments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find(
      (a) => a.id.toLowerCase() === id.trim().toLowerCase()
    );
  }

  getAppointmentsByPhone(phone: string): Appointment[] {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return this.data.appointments.filter((a) => {
      const p = a.phone.replace(/[^0-9]/g, '');
      return p.includes(cleanPhone) || cleanPhone.includes(p);
    });
  }

  createAppointment(
    payload: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Appointment {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const id = `AOP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomDigits}`;

    const newApp: Appointment = {
      ...payload,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.appointments.push(newApp);
    this.saveData(this.data);
    return newApp;
  }

  updateAppointment(
    id: string,
    updates: Partial<Appointment>
  ): Appointment | null {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.appointments[idx];
  }

  deleteAppointment(id: string): boolean {
    const initialLen = this.data.appointments.length;
    this.data.appointments = this.data.appointments.filter((a) => a.id !== id);
    if (this.data.appointments.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Admin Auth
  verifyAdminPassword(password: string): boolean {
    const hash = crypto
      .createHash('sha256')
      .update(password + this.data.adminSalt)
      .digest('hex');
    return hash === this.data.adminPasswordHash;
  }

  setAdminPassword(newPassword: string) {
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto
      .createHash('sha256')
      .update(newPassword + newSalt)
      .digest('hex');
    this.data.adminSalt = newSalt;
    this.data.adminPasswordHash = newHash;
    this.saveData(this.data);
  }

  // Dashboard Stats
  getStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const appointments = this.data.appointments;

    const todayAppointments = appointments.filter((a) => a.date === todayStr);
    const upcomingAppointments = appointments.filter(
      (a) => a.date >= todayStr && (a.status === 'confirmed' || a.status === 'pending')
    );
    const completedAppointments = appointments.filter((a) => a.status === 'completed');
    const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled');

    return {
      todayCount: todayAppointments.length,
      upcomingCount: upcomingAppointments.length,
      completedCount: completedAppointments.length,
      cancelledCount: cancelledAppointments.length,
      totalCount: appointments.length,
      pendingCount: appointments.filter((a) => a.status === 'pending').length,
    };
  }
}

export const db = new JsonDatabase();
