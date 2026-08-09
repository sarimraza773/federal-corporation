import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import slide1 from '../assets/slideshow.jpg';
import slide2 from '../assets/slideshow2.jpg';
import slide5 from '../assets/slideshow5.jpg';

const slidesBase = [
  {
    image: slide5,
    tag: 'Property & Real Estate',
    title: 'Property / Real Estate Conveyance',
    desc: 'Property and real estate, succession and inheritance, registration, and documentation.',
  },
  {
    image: slide1,
    tag: 'Taxation',
    title: 'Taxation',
    desc: 'Filing, tax advisory, and litigation.',
  },
  {
    image: slide2,
    tag: 'Corporate and Commercial',
    title: 'Corporate and Commercial',
    desc: 'Regulatory advisory, incorporation, and statutory filing.',
  },
];

const heroServices = [
  { label: 'Property & Real Estate', to: '/services/real-estate-conveyance' },
  { label: 'Taxation', to: '/services/taxation' },
  { label: 'Corporate & Commercial', to: '/services/corporate' },
  { label: 'Intellectual Property', to: '/services/intellectual-property' },
  { label: 'Anti Money Laundering & Anti Benami', to: '/services/anti-money-laundering' },
  { label: 'Competition & Antitrust Law', to: '/services/competition-law' },
  { label: 'Non-Profit Organisations', to: '/services/non-profit-organisations' },
  { label: 'All Services', to: '/services', wide: true },
];

function Dot({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hero-dot h-2.5 rounded-full transition-all ${
        active ? 'w-8 bg-navy-900' : 'w-2.5 bg-navy-900/25 hover:bg-navy-900/45'
      }`}
      aria-label="Go to slide"
    />
  );
}

export default function HeroCarousel({ slides = slidesBase }) {
  const [i, setI] = useState(0);
  const safeSlides = useMemo(() => (slides?.length ? slides : slidesBase), [slides]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setI((value) => (value + 1) % safeSlides.length);
      }
    }, 7000);
    return () => clearInterval(timer);
  }, [safeSlides.length]);

  const slide = safeSlides[i] ?? safeSlides[0];

  return (
    <section className="px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="hero-shell relative min-h-[640px] overflow-hidden rounded-3xl border border-navy-900/15 shadow-soft sm:min-h-[520px] lg:h-[500px] lg:min-h-0">
          {slide?.image ? (
            <img
              key={slide.image}
              src={slide.image}
              alt=""
              width="1200"
              height="600"
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className="hero-slide absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          <div className="hero-image-overlay absolute inset-0" />

          <div className="relative z-10 h-full bg-white/50">
            <div className="flex h-full flex-col p-6 sm:p-10 lg:p-12">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center rounded-full border border-navy-900/10 bg-white/35 px-3 py-1 text-xs font-medium text-ink-200/80">
                  {slide?.tag ?? ''}
                </span>

                <div className="flex items-center gap-2">
                  {safeSlides.map((_, idx) => (
                    <Dot key={idx} active={idx === i} onClick={() => setI(idx)} />
                  ))}
                </div>
              </div>

              <div
                key={slide.title}
                className="hero-copy mt-7 grid flex-1 gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:gap-12"
              >
                <div>
                  <h1 className="font-sans text-3xl font-semibold leading-[1.06] tracking-tightish text-ink-100 sm:text-5xl sm:leading-[1.02] lg:text-6xl">
                    {slide?.title ?? ''}
                  </h1>
                  <p className="mt-4 max-w-2xl text-ink-200/80">{slide?.desc ?? ''}</p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-800"
                    >
                      Get in touch
                    </Link>
                    <Link
                      to="/services"
                      className="inline-flex items-center justify-center rounded-xl bg-white/15 px-6 py-3 text-sm font-medium text-ink-100 transition-colors hover:bg-white/20"
                    >
                      Explore services
                    </Link>
                  </div>
                </div>

                <div className="hero-feature-panel rounded-2xl border border-navy-900/10 bg-white/20 p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-200/80">Featured</p>
                  <p className="mt-3 text-sm font-medium text-ink-100">Core legal services</p>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {heroServices.map((service) => (
                      <Link
                        key={service.to}
                        to={service.to}
                        className={`min-w-0 break-words rounded-xl border border-navy-900/10 bg-white/25 px-3 py-2 text-xs font-medium leading-snug text-ink-100 transition-colors hover:bg-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 ${service.wide ? 'lg:col-span-2' : ''}`}
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
