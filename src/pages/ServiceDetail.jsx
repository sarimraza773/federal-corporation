import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import { getServiceBySlug } from '../data/services.js';

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <>
      <Seo
        title={service.fullTitle}
        description={`${service.fullTitle} services from Federal Corporation.`}
      />

      <Section eyebrow="Service" title={service.fullTitle}>
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.55fr]">
          <article className="rounded-3xl border border-navy-900/15 bg-white/45 p-6 shadow-soft backdrop-blur-sm sm:p-8">
            <p className="text-lg leading-relaxed text-ink-200/80">{service.summary}</p>

            <div className="mt-8">
              <h3 className="font-serif text-2xl tracking-tightish text-ink-100">How we help</h3>
              <ul className="mt-4 space-y-4 text-ink-200/80">
                {service.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-navy-900" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="rounded-3xl border border-navy-900/15 bg-navy-900 p-6 text-white shadow-soft sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/65">Next step</p>
            <h3 className="mt-3 font-serif text-2xl tracking-tightish">Discuss this service</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Share the documents, timeline, or questions you have and we can guide the next practical step.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-white/90"
            >
              Contact Federal Corporation
            </Link>
            <Link
              to="/services"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back to services
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
