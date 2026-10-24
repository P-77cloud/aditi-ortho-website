import React, { useState } from 'react';
import {
  Phone,
  Clock,
  MapPin,
  Calendar,
  Search,
  Lock,
  Menu,
  X,
  Activity,
  MessageCircle,
} from 'lucide-react';
import type { ClinicInfo } from '../services/api.ts';
import { getGeneralInquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface NavbarProps {
  clinicInfo: ClinicInfo;
  onOpenBooking: (serviceId?: string) => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  clinicInfo,
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Conditions', href: '#conditions' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'FAQs', href: '#faqs' },
    { label: 'Find Us', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Notification / Contact Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5">
          <div className="flex items-center space-x-4 sm:space-x-6 flex-wrap">
            <a
              href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center space-x-1.5 hover:text-white transition-colors group"
              title="Call Clinic Directly"
            >
              <Phone className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-100">{clinicInfo.phone}</span>
            </a>

            <div className="hidden md:flex items-center space-x-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{clinicInfo.address}, Tumakuru</span>
            </div>

            <div className="flex items-center space-x-1.5 text-teal-300 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Open 24 Hours</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto text-xs">
            <button
              onClick={onOpenLookup}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Look up your appointment status"
            >
              <Search className="w-3 h-3 text-teal-400" />
              <span className="hidden sm:inline">Track Appointment</span>
              <span className="sm:hidden">Track</span>
            </button>

            <span className="text-slate-700">|</span>

            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Clinic Admin Portal"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-900 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/10 group-hover:scale-105 transition-all">
              <Activity className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 font-heading">
                  Aditi Ortho
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200 hidden sm:inline-block">
                  5.0 ★
                </span>
              </div>
              <p className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
                Physio & Pain Center
              </p>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <a
              href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => onOpenBooking()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-700 to-sky-800 hover:from-teal-800 hover:to-sky-900 shadow-md shadow-teal-900/15 hover:shadow-lg transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-teal-200" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => onOpenBooking()}
              className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-700 shadow-xs"
            >
              Book
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100"
            >
              <Search className="w-3.5 h-3.5 text-teal-600" />
              <span>Track Appointment</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Portal</span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <a
              href={`tel:${clinicInfo.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200"
            >
              <Phone className="w-4 h-4 text-teal-700" />
              <span>Call Clinic ({clinicInfo.phone})</span>
            </a>

            <a
              href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-sky-800 shadow-md"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
