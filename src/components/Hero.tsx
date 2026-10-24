import React from 'react';
import {
  Calendar,
  Phone,
  MessageCircle,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { ClinicInfo, ContentData } from '../services/api.ts';
import { getGeneralInquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface HeroProps {
  clinicInfo: ClinicInfo;
  content: ContentData;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  clinicInfo,
  content,
  onOpenBooking,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50 pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-32">
      {/* Subtle background ambient blur blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10">
        <div className="absolute -top-12 left-10 w-72 h-72 rounded-full bg-teal-200/35 blur-3xl"></div>
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Clinical Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              </span>
              <span>5.0 Google Rating</span>
              <span className="text-teal-400">•</span>
              <span className="text-slate-600 font-medium">100+ Verified Patient Reviews</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              {content.heroHeadline || 'Move Better. Live Better. Pain-Free.'}
            </h1>

            {/* Supporting Clinical Description */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {content.heroSubheadline ||
                'Personalized orthopedic, physiotherapy and pain-management care focused on helping you move with greater comfort and confidence.'}
            </p>

            {/* Key Clinical Bullet Points */}
            <div className="pt-1 pb-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Patient-Focused Assessment</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Evidence-Guided Rehab</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Open 24 Hours</span>
              </div>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-teal-700 to-sky-800 hover:from-teal-800 hover:to-sky-900 shadow-lg shadow-teal-900/20 hover:shadow-xl hover:shadow-teal-900/30 transition-all active:scale-95"
              >
                <Calendar className="w-5 h-5 text-teal-200" />
                <span>Book an Appointment</span>
                <ArrowRight className="w-4 h-4 text-teal-200" />
              </button>

              <a
                href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-base font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all"
              >
                <Phone className="w-5 h-5 text-teal-700" />
                <span>Call Clinic</span>
              </a>

              <a
                href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-4 rounded-xl text-base font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                title="Send inquiry on WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Trust Pill Footer Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="text-teal-800 font-bold">Orthopedic Care</span>
              <span>•</span>
              <span className="text-teal-800 font-bold">Physiotherapy</span>
              <span>•</span>
              <span className="text-teal-800 font-bold">Pain Management</span>
              <span>•</span>
              <span className="text-slate-600">Tumakuru, Karnataka</span>
            </div>
          </div>

          {/* Right Column: Authentic Clinical Facility Presentation Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000"
                  alt="Aditi Ortho, Physio & Pain Center modern clinical environment in Tumakuru"
                  className="w-full h-[400px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

                {/* Overlaid Facility Highlights */}
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <div className="flex items-center space-x-2 text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dedicated Clinical Care Facility</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Aditi Ortho, Physio & Pain Center
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Avalipalya, 80ft Road, Sira Gate, Tumakuru</span>
                  </p>
                </div>
              </div>

              {/* Floating Verified Rating Badge */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-xl border border-slate-200/80 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                  <Star className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-base font-extrabold text-slate-900">5.0</span>
                    <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">
                    100+ Google Reviews
                  </p>
                </div>
              </div>

              {/* Floating Emergency / Open 24 Hours Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-slate-900 text-white rounded-xl p-3.5 shadow-xl border border-slate-800 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Clock className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      Open 24 Hours
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Round-the-clock availability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
