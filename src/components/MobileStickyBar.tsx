import React from 'react';
import { Home, Activity, Calendar, MessageCircle, Phone } from 'lucide-react';
import type { ClinicInfo } from '../services/api.ts';
import { getGeneralInquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface MobileStickyBarProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  clinicInfo,
  onOpenBooking,
}) => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-2 px-3 sm:hidden">
      <div className="grid grid-cols-5 gap-1 text-center items-center">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-teal-700 transition-colors"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* 2. Services */}
        <button
          type="button"
          onClick={() => scrollTo('#services')}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-teal-700 transition-colors"
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Services</span>
        </button>

        {/* 3. Book (Featured) */}
        <button
          type="button"
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-700 to-sky-800 text-white shadow-lg shadow-teal-900/30 flex items-center justify-center ring-4 ring-white">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-teal-800 mt-0.5">Book</span>
        </button>

        {/* 4. WhatsApp */}
        <a
          href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>

        {/* 5. Call */}
        <a
          href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
          className="flex flex-col items-center justify-center py-1 text-teal-700 hover:text-teal-800 transition-colors"
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Call</span>
        </a>
      </div>
    </div>
  );
};
