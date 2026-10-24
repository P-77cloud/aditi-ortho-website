/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { QuickActionBar } from './components/QuickActionBar.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { ConditionsSection } from './components/ConditionsSection.tsx';
import { BookingFlow } from './components/BookingFlow.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { FindUsSection } from './components/FindUsSection.tsx';
import { Footer } from './components/Footer.tsx';
import { MobileStickyBar } from './components/MobileStickyBar.tsx';
import { AppointmentLookupModal } from './components/AppointmentLookupModal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { api } from './services/api.ts';
import type { ClinicInfo, ClinicService, ContentData } from './services/api.ts';
import { MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl } from './utils/whatsapp.ts';

export default function App() {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Navigation triggers
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>();
  const [bookingConcern, setBookingConcern] = useState<string | undefined>();

  const loadData = async () => {
    try {
      const [cInfo, srvs, cnt] = await Promise.all([
        api.getClinicInfo(),
        api.getServices(),
        api.getContent(),
      ]);
      setClinicInfo(cInfo);
      setServices(srvs);
      setContent(cnt);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBooking = (serviceId?: string, concern?: string) => {
    if (serviceId) setBookingServiceId(serviceId);
    if (concern) setBookingConcern(concern);

    const bookEl = document.getElementById('book');
    if (bookEl) {
      bookEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading || !clinicInfo || !content) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-xl font-bold">Aditi Ortho, Physio & Pain Center</h2>
        <p className="text-xs text-slate-400 mt-1">Loading clinical care portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-teal-700 selection:text-white pb-14 sm:pb-0">
      {/* 1. Global Navigation */}
      <Navbar
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* 2. Hero Section */}
      <Hero
        clinicInfo={clinicInfo}
        content={content}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 3. Quick Action Bar */}
      <QuickActionBar
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 4. About the Clinic */}
      <AboutSection
        clinicInfo={clinicInfo}
        content={content}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 5. Services Section */}
      <ServicesSection
        services={services}
        onSelectServiceForBooking={(sId) => handleOpenBooking(sId)}
      />

      {/* 6. Conditions / What Can We Help You With */}
      <ConditionsSection
        conditions={content.conditions || []}
        clinicInfo={clinicInfo}
        onOpenBookingWithConcern={(concernTitle) =>
          handleOpenBooking(undefined, concernTitle)
        }
      />

      {/* 7. Appointment Booking System (Core Feature) */}
      <BookingFlow
        services={services}
        clinicInfo={clinicInfo}
        initialServiceId={bookingServiceId}
        initialConcern={bookingConcern}
        onBookingSuccess={() => {
          // Refresh data if needed
          loadData();
        }}
      />

      {/* 8. Gallery */}
      <GallerySection galleryItems={content.gallery || []} />

      {/* 9. Reviews & Testimonials */}
      <ReviewsSection
        testimonials={content.testimonials || []}
        clinicInfo={clinicInfo}
      />

      {/* 10. Frequently Asked Questions */}
      <FaqSection faqs={content.faqs || []} />

      {/* 11. Find Us / Contact & Map */}
      <FindUsSection
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 12. Footer with Medical Disclaimer */}
      <Footer
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* 13. Mobile Sticky Bottom Action Bar */}
      <MobileStickyBar
        clinicInfo={clinicInfo}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 14. Floating WhatsApp Quick Contact Button (Desktop) */}
      <div className="fixed bottom-6 right-6 z-30 hidden sm:flex flex-col items-end gap-2.5">
        <a
          href={getGeneralInquiryWhatsAppUrl(clinicInfo.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-950/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          title="Chat directly on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="text-xs font-bold tracking-wide">
            WhatsApp Inquiry
          </span>
        </a>
      </div>

      {/* 15. Track Appointment Modal */}
      <AppointmentLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        clinicInfo={clinicInfo}
      />

      {/* 16. Admin Management Portal */}
      <AdminPortal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onDataChanged={loadData}
      />
    </div>
  );
}
