import React from 'react';
import Seo from '../components/Seo.jsx';
import logo from '../assets/fedcorp_clean_logo.png';
import { services } from '../data/services.js';

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="About Federal Corporation, a Karachi-based multidisciplinary law firm celebrating 50 years of excellence."
      />

      <section className="px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-10">
        <div className="about-anniversary mx-auto w-full max-w-7xl">
          <div className="about-anniversary-layout">
            <div className="about-anniversary-identity">
              <img
                src={logo}
                alt="Federal Corporation logo"
                width="1024"
                height="1024"
                decoding="async"
                className="h-48 w-48 object-contain sm:h-56 sm:w-56 lg:h-64 lg:w-64"
              />
              <p className="mt-4 font-sans text-2xl font-extrabold uppercase tracking-tight text-ink-100">
                Federal Corporation
              </p>

              <div className="mt-10 font-serif text-4xl uppercase leading-tight tracking-[0.12em] text-maroon-900 sm:text-5xl lg:text-6xl">
                <p>50+ Years</p>
                <p className="mt-5">Of Excellence</p>
              </div>
              <p className="mt-6 font-serif text-3xl text-maroon-900">Est. 1974</p>
            </div>

            <div className="about-anniversary-copy">
              <p className="text-base font-medium leading-relaxed text-ink-200/80 sm:text-lg">
                Federal Corporation was established in 1974 as a skills development institute and it formally
                evolved into a multidisciplinary law firm in 1984. Our journey's intricacies are untraceable,
                yet our essence lies not in falling, but in resiliently rising after every fall.
              </p>

              <div className="about-anniversary-message mt-10 text-ink-200/80">
                <p>
                  The year 2024 marked a significant milestone for FedCorp as we proudly celebrated our 50th
                  anniversary. We have been dedicated to delivering unparalleled legal services for over half a
                  century. Our services include:
                </p>

                <div className="my-8 grid gap-3 font-serif text-lg uppercase tracking-[0.08em] text-maroon-900 sm:grid-cols-2">
                  {services.map((service) => (
                    <span key={service.slug}>{service.fullTitle}</span>
                  ))}
                </div>

                <div className="mt-10 space-y-5">
                  <p>
                    As we reflect upon our journey, we are immensely grateful for the trust and confidence our
                    clients have placed in us. Every case, negotiation and success has shaped FedCorp's legacy
                    and has helped us grow into well recognised professionals in the community.
                  </p>
                  <p>
                    To our team, past and present, thank you for your dedication and brilliance. Together we have
                    built an institution known for its integrity, professionalism and solution oriented approach.
                  </p>
                  <p>
                    To our clients, thank you for entrusting us with your legal needs. Your success is our
                    success, and we look forward to continuing to serve you with the highest standards of legal
                    proficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
