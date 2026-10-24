import React from 'react';
import {
  HelpCircle,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  Activity,
  Check,
} from 'lucide-react';
import type { ConditionItem, ClinicInfo } from '../services/api.ts';
import { getConditionWhatsAppUrl } from '../utils/whatsapp.ts';

interface ConditionsSectionProps {
  conditions: ConditionItem[];
  clinicInfo: ClinicInfo;
  onOpenBookingWithConcern: (concernTitle: string) => void;
}

export const ConditionsSection: React.FC<ConditionsSectionProps> = ({
  conditions,
  clinicInfo,
  onOpenBookingWithConcern,
}) => {
  return (
    <section id="conditions" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-sky-100/70 text-sky-900 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
            <span>Common Concerns Addressed</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Can We Help You With?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            We evaluate and manage a broad range of joint, spinal, muscular, and mobility issues.
          </p>

          {/* Educational Disclaimer Banner */}
          <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-center space-x-2 text-left sm:text-center max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> Conditions listed below are informational examples and do not constitute a medical diagnosis. A clinical evaluation is required for accurate assessment.
            </span>
          </div>
        </div>

        {/* Conditions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conditions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100/60 text-teal-800">
                    {item.suggestedDepartment || 'Orthopedic & Rehab'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {item.description}
                </p>

                {item.symptoms && item.symptoms.length > 0 && (
                  <div className="space-y-1 mb-6">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Common Presentations:
                    </p>
                    {item.symptoms.map((s: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-600">
                        <Check className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200/70 flex items-center gap-2">
                <button
                  onClick={() => onOpenBookingWithConcern(item.title)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 transition-colors text-center"
                >
                  Book Assessment
                </button>
                <a
                  href={getConditionWhatsAppUrl(clinicInfo.whatsappNumber, item.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center space-x-1 transition-colors"
                  title="Discuss this concern on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Global CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 mb-3">
            Experiencing discomfort not listed above?
          </p>
          <a
            href={getConditionWhatsAppUrl(clinicInfo.whatsappNumber, 'a general orthopedic/physiotherapy concern')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-900 bg-white hover:bg-teal-50 border border-slate-300 hover:border-teal-400 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Discuss Your Concern with Our Team</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </div>
    </section>
  );
};
