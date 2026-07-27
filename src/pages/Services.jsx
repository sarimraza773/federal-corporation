import React from 'react';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import Card from '../components/Card.jsx';
import { services } from '../data/services.js';
import { serviceImages } from '../data/serviceImages.js';

export default function Services() {
  return (
    <>
      <Seo
        title="Services"
        description="Services offered by Federalcorporation include conveyance, taxation, corporate, intellectual property, non-profit, anti-money laundering, and competition matters."
      />

      <Section title="Capabilities">
        <p className="mx-auto w-full max-w-6xl text-center text-ink-200/80">
          The firm's profile lists services including taxation, corporate, intellectual property,
          real estate conveyance, anti-money laundering, non-profit organisations, and competition law.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.slug}
              title={service.fullTitle}
              subtitle={service.subtitle}
              image={serviceImages[service.slug]}
              href={`/services/${service.slug}`}
            >
              <p>{service.text}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
                Read more
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="h-16" />
    </>
  );
}
