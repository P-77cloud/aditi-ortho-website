import React from 'react';
import { Star, MessageSquare, ExternalLink, CheckCircle, Quote } from 'lucide-react';
import type { TestimonialItem, ClinicInfo } from '../services/api.ts';

interface ReviewsSectionProps {
  testimonials: TestimonialItem[];
  clinicInfo: ClinicInfo;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  testimonials,
  clinicInfo,
}) => {
  return (
    <section id="reviews" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rating Header Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold text-amber-600">5.0</span>
            </div>
            <div>
              <div className="flex items-center space-x-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                ))}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                5.0 Star Rating on Google
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Based on {clinicInfo.totalReviews || '100+'} authentic patient ratings and reviews.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href={clinicInfo.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <span>See More Reviews on Google</span>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Feedback & Recovery Experiences
          </h2>
          <p className="text-slate-600 text-sm">
            Read real feedback from patients who have received orthopedic care, physiotherapy, or pain relief at our clinic.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-teal-100 absolute top-5 right-5 pointer-events-none" />

              <div>
                {/* Rating & Treatment */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {item.date}
                  </span>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold mb-3">
                  {item.treatment}
                </div>

                {/* Comment */}
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  “{item.comment}”
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.author}</h4>
                  <p className="text-[11px] text-slate-500">Verified Patient / Google Reviewer</p>
                </div>
                {item.verified && (
                  <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified Review</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
