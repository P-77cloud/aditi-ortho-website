import React from 'react';
import { Calendar, Phone, MessageCircle, Navigation, ArrowUpRight } from 'lucide-react';
import type { ClinicInfo } from '../services/api.ts';
import { getGeneralInquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface QuickActionBarProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  clinicInfo,
  onOpenBooking,
}) => {
  return (
    <section className="relative z-20 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Book Appointment */}
        <button
          onClick={onOpenBooking}
          className="group text-left bg-gradient-to-br from-teal-800 to-sky-900 text-white rounded-2xl p-5 shadow-lg shadow-teal-950/15 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-teal-200 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="p-1.5 rounded-full bg-white/10 text-teal-200 group-hover:bg-white/20 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-teal-200 transition-colors">
              Book Appointment
            </h3>
            <p className="text-xs text-teal-100/90 mt-1">
              Choose a convenient date and verified time slot in under 2 minutes.
            </p>
          </div>
        </button>

        {/* Card 2: Call Clinic */}
        <a
          href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
          className="group text-left bg-white text-slate-800 rounded-2xl p-5 shadow-md shadow-slate-200/60 border border-slate-200/90 hover:border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <span className="p-1.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                Call Clinic
              </h3>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Direct
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              One-tap phone call on mobile. Dial {clinicInfo.phone} immediately.
            </p>
          </div>
        </a>

        {/* Card 3: WhatsApp Enquiry */}
        <a
          href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-left bg-white text-slate-800 rounded-2xl p-5 shadow-md shadow-slate-200/60 border border-slate-200/90 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="p-1.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
              WhatsApp Us
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Start a WhatsApp enquiry for quick appointment questions & directions.
            </p>
          </div>
        </a>

        {/* Card 4: Get Directions */}
        <a
          href={clinicInfo.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-left bg-white text-slate-800 rounded-2xl p-5 shadow-md shadow-slate-200/60 border border-slate-200/90 hover:border-sky-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6" />
            </div>
            <span className="p-1.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-700 transition-colors">
              Get Directions
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Open Google Maps navigation to Avalipalya, 80ft Road, Sira Gate.
            </p>
          </div>
        </a>
      </div>
    </section>
  );
};
