import React, { useState } from 'react';
import {
  Activity,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Heart,
} from 'lucide-react';
import type { ClinicInfo } from '../services/api.ts';
import { getGeneralInquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface FooterProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  clinicInfo,
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
}) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const quickLinks = [
    { label: 'About Center', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Common Conditions', href: '#conditions' },
    { label: 'Facility Gallery', href: '#gallery' },
    { label: 'Patient Reviews', href: '#reviews' },
    { label: 'FAQs', href: '#faqs' },
    { label: 'Find Us / Map', href: '#contact' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 sm:pb-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Medical Emergency Disclaimer Banner */}
        <div className="mb-12 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3.5 text-xs text-slate-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              Important Medical Notice & Emergency Protocol
            </h4>
            <p className="leading-relaxed text-slate-400">
              Information provided on this website is for general informational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional regarding your individual musculoskeletal condition.
            </p>
            <p className="font-semibold text-slate-300 pt-0.5">
              For acute trauma, open fractures, or life-threatening medical emergencies, please visit the nearest hospital emergency department immediately or dial 108 / 112.
            </p>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-900 to-teal-700 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white font-heading">
                  Aditi Ortho
                </span>
                <p className="text-[11px] font-semibold text-teal-400 tracking-wider uppercase">
                  Physio & Pain Center
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dedicated orthopedic care, evidence-based physiotherapy, and advanced pain management in Tumakuru, Karnataka. Focused on helping you move with comfort and strength.
            </p>

            <div className="pt-2 flex items-center space-x-3 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-teal-400 font-bold border border-slate-800">
                5.0 ★ Google Rating
              </span>
              <span className="text-slate-500">100+ Reviews</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-teal-400 transition-colors flex items-center space-x-1"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={onOpenLookup}
                  className="hover:text-teal-400 transition-colors flex items-center space-x-1 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Track Appointment Status</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Location */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Clinic Contact & Location
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  {clinicInfo.address}, {clinicInfo.landmark}, {clinicInfo.city}, Karnataka {clinicInfo.pincode}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a
                  href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-white hover:text-teal-400 transition-colors font-medium"
                >
                  {clinicInfo.phone}
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {clinicInfo.whatsappNumber} (WhatsApp)
                </a>
              </div>

              <div className="flex items-center space-x-2 text-teal-300">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Open 24 Hours • Emergency & Scheduled Care</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm"
              >
                Book Online
              </button>
              <a
                href={clinicInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center space-x-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Aditi Ortho, Physio & Pain Center. All rights reserved.</p>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-slate-400 transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-teal-400 transition-colors font-medium text-slate-400"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Privacy Policy</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Aditi Ortho, Physio & Pain Center respects the confidentiality of personal and medical information.
              </p>
              <p>
                <strong>Information Collected:</strong> We collect contact information (name, phone number, email) and general descriptions of symptoms solely to manage appointment requests and communicate visit confirmations.
              </p>
              <p>
                <strong>Data Protection:</strong> We do not sell or share patient contact details with third-party advertisers. All records are handled in compliance with applicable healthcare privacy practices.
              </p>
            </div>
            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Terms of Service</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>Appointments & Confirmations:</strong> Online booking submissions constitute requests for clinical consultation. While every effort is made to honor scheduled times, clinical emergencies may occasionally cause unavoidable delays.
              </p>
              <p>
                <strong>Non-Diagnostic Content:</strong> Educational descriptions of symptoms and treatments on this website are intended for general awareness and must not replace professional clinical evaluation.
              </p>
            </div>
            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
