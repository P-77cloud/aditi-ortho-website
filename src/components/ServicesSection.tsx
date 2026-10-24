import React, { useState } from 'react';
import {
  Activity,
  Zap,
  ShieldCheck,
  HeartPulse,
  Clock,
  ArrowRight,
  CheckCircle,
  Tag,
} from 'lucide-react';
import type { ClinicService } from '../services/api.ts';

interface ServicesSectionProps {
  services: ClinicService[];
  onSelectServiceForBooking: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Orthopedic Care',
    'Physiotherapy',
    'Pain Management',
  ];

  const filteredServices =
    selectedCategory === 'All'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Orthopedic Care':
        return <Activity className="w-5 h-5 text-teal-700" />;
      case 'Physiotherapy':
        return <Zap className="w-5 h-5 text-sky-700" />;
      case 'Pain Management':
        return <ShieldCheck className="w-5 h-5 text-indigo-700" />;
      default:
        return <HeartPulse className="w-5 h-5 text-teal-700" />;
    }
  };

  return (
    <section id="services" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-teal-100/70 text-teal-900 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Clinical Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Specialized Care & Rehabilitation
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Focused clinical care for musculoskeletal, joint, spinal conditions, and post-surgical recovery.
          </p>

          {/* Category Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Icon & Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getCategoryIcon(service.category)}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                    {service.category}
                  </span>
                </div>

                {/* Service Name & Description */}
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Suitable For */}
                {service.suitableFor && service.suitableFor.length > 0 && (
                  <div className="mb-6 pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Suitable for:
                    </p>
                    <ul className="space-y-1.5">
                      {service.suitableFor.map((item: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer: Duration, Price, Book Button */}
              <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{service.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center space-x-1 font-semibold text-teal-800">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    <span>{service.priceText || 'Consultation fee applies'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectServiceForBooking(service.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-900 bg-slate-100 hover:bg-teal-700 hover:text-white border border-slate-200 hover:border-teal-700 transition-all duration-200 group/btn"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Note on Customized Care */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto bg-white p-4 rounded-xl border border-slate-200">
          Need assistance selecting the right clinical service or therapy? Call our care desk at{' '}
          <a href="tel:+918277123000" className="font-bold text-teal-700 hover:underline">
            +91 82771 23000
          </a>{' '}
          or consult our team directly on WhatsApp.
        </div>
      </div>
    </section>
  );
};
