import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import type { ClinicInfo } from '../services/api.ts';
import { getGeneralInquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface FindUsSectionProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
}

export const FindUsSection: React.FC<FindUsSectionProps> = ({
  clinicInfo,
  onOpenBooking,
}) => {
  return (
    <section id="contact" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-teal-100/70 text-teal-900 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>Clinic Location & Reach</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find Us in Tumakuru
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Conveniently situated on 80ft Road near Sira Gate with accessible parking and 24/7 patient support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Contact Cards & Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Aditi Ortho, Physio & Pain Center
                </h3>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Orthopedic Care • Physiotherapy • Pain Management
                </p>
              </div>

              {/* Address Item */}
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Address</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-xs sm:text-sm">
                    {clinicInfo.address}
                    <br />
                    {clinicInfo.landmark}
                    <br />
                    {clinicInfo.city}, {clinicInfo.state} - {clinicInfo.pincode}
                  </p>
                </div>
              </div>

              {/* Phone Item */}
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Phone & Appointments</h4>
                  <a
                    href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
                    className="text-teal-700 font-bold hover:underline block text-sm mt-0.5"
                  >
                    {clinicInfo.phone}
                  </a>
                  <p className="text-[11px] text-slate-500">Tap to call directly from mobile</p>
                </div>
              </div>

              {/* WhatsApp Item */}
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">WhatsApp Enquiry</h4>
                  <a
                    href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline block text-sm mt-0.5"
                  >
                    {clinicInfo.whatsappNumber}
                  </a>
                  <p className="text-[11px] text-slate-500">Fast assistance & appointment questions</p>
                </div>
              </div>

              {/* Hours Item */}
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-slate-900">Operating Hours</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Open 24 Hours
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {clinicInfo.operatingHoursDisplay}
                  </p>
                </div>
              </div>

              {/* Direction & Call CTA buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={clinicInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-teal-400" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm"
                >
                  <span>Book Visit</span>
                </button>
              </div>
            </div>

            {/* Quick Transport & Parking Note */}
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 text-xs text-teal-950 flex items-center space-x-2.5">
              <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Accessibility:</strong> Ground floor entry with wheelchair ramps, stretcher clearance, and reserved parking along 80ft Road.
              </span>
            </div>
          </div>

          {/* Right Column: Google Maps Embed Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Live Google Maps Destination
                </span>
              </div>

              <a
                href={clinicInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-700 hover:underline flex items-center space-x-1"
              >
                <span>Open in Maps App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Map iframe embed */}
            <div className="relative w-full h-[400px] sm:h-full min-h-[350px] bg-slate-100">
              <iframe
                title="Aditi Ortho Physio and Pain Center Google Map"
                src="https://maps.google.com/maps?q=Avalipalya,+80ft+Road,+Sira+Gate,+Tumakuru,+Karnataka+572106&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
