import React from 'react';
import {
  Shield,
  Activity,
  HeartPulse,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type { ClinicInfo, ContentData } from '../services/api.ts';

interface AboutSectionProps {
  clinicInfo: ClinicInfo;
  content: ContentData;
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  clinicInfo,
  content,
  onOpenBooking,
}) => {
  return (
    <section id="about" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Showcase: Clinical Facility Photos */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=900"
                  alt="Clinical Consultation Room at Aditi Ortho, Physio & Pain Center"
                  className="w-full h-80 sm:h-96 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs uppercase font-bold tracking-wider text-teal-300">
                    Clinical Care & Diagnostics
                  </span>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    Hygienic, well-equipped consultation & assessment room
                  </p>
                </div>
              </div>

              {/* Smaller overlapping photo */}
              <div className="hidden sm:block absolute -bottom-8 -right-8 w-56 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500"
                  alt="Physiotherapy & Rehabilitation Area"
                  className="w-full h-36 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/30"></div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-[11px] font-bold">Dedicated Rehab Wing</p>
                </div>
              </div>
            </div>

            {/* Clinic Details Pill */}
            <div className="pt-6 sm:pt-4 flex items-center space-x-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Facility Address:</strong> Avalipalya, 80ft Road, Sira Gate, Tumakuru, Karnataka 572106
              </span>
            </div>
          </div>

          {/* Clinical Copy & Core Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5" />
                <span>About Our Center</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {content.aboutTitle ||
                  'Compassionate, Evidence-Guided Orthopedic & Rehabilitation Care'}
              </h2>
            </div>

            {/* Description Paragraphs */}
            <div className="space-y-4 text-slate-600 text-base leading-relaxed">
              {content.aboutDescription && content.aboutDescription.length > 0 ? (
                content.aboutDescription.map((p, idx) => <p key={idx}>{p}</p>)
              ) : (
                <>
                  <p>
                    Aditi Ortho, Physio & Pain Center provides structured musculoskeletal,
                    physiotherapy, and pain management care for individuals in Tumakuru and surrounding regions.
                  </p>
                  <p>
                    Our center emphasizes thorough physical examinations, conservative non-surgical pathways, and personalized recovery roadmaps designed to help patients regain pain-free movement.
                  </p>
                </>
              )}
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {content.aboutPillars && content.aboutPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <h3 className="font-bold text-sm text-slate-900">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-2 flex items-center space-x-4">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
              >
                Schedule an Assessment
              </button>
              <a
                href="#services"
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
              >
                Explore Services →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
