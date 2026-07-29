import React from 'react';
import Seo from '../components/Seo.jsx';
import logo from '../assets/logo.jpg';

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="About FederalCorporation, a Karachi-based multidisciplinary law firm celebrating 50 years of excellence."
      />

      <section className="px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-10">
        <div className="about-anniversary mx-auto w-full max-w-7xl">
          <div className="about-anniversary-layout">
            <div className="about-anniversary-identity">
              <img
                src={logo}
                alt="FederalCorporation logo"
                width="120"
                height="120"
                decoding="async"
                className="h-28 w-28 rounded-full object-contain sm:h-32 sm:w-32"
              />
              <p className="mt-4 font-sans text-2xl font-extrabold uppercase tracking-tight text-ink-100">
                FederalCorporation
              </p>

              <div className="mt-10 font-serif text-4xl uppercase leading-tight tracking-[0.12em] text-maroon-900 sm:text-5xl lg:text-6xl">
                <p>50+ Years</p>
                <p className="mt-5">Of Excellence</p>
              </div>
              <p className="mt-6 font-serif text-3xl text-maroon-900">1974-current</p>
            </div>

            <div className="about-anniversary-copy">
              <p className="text-base font-medium leading-relaxed text-ink-200/80 sm:text-lg">
                Established in 1974 as a skills development entity, <strong>FederalCorporation</strong>{' '}
                evolved into a multidisciplinary law firm by 1984. Our journey's intricacies are
                untraceable, yet our essence lies not in falling, but in resiliently rising each time we fall.
              </p>

              <div className="about-anniversary-message mt-10 text-ink-200/80">
                <p>
                  2024 marked a significant milestone for <strong>FederalCorporation</strong> as we proudly
                  celebrated our 50th anniversary! For over half a century, we've been dedicated to delivering
                  unparalleled legal services in the realms of
                </p>

                <div className="my-8 grid gap-3 font-serif text-lg uppercase tracking-[0.08em] text-maroon-900 sm:grid-cols-2">
                  <span>Property / Real Estate Conveyance</span>
                  <span>Taxation</span>
                  <span>Corporate</span>
                  <span>Commercial Litigation</span>
                  <span>General Litigation</span>
                  <span>Intellectual Property</span>
                </div>

                <p className="font-serif text-2xl text-maroon-900">and beyond!</p>

                <div className="mt-10 space-y-5">
                  <p>
                    As we reflect on our journey, we're immensely grateful for the trust and confidence our
                    clients have placed in us. Each case, negotiation, and victory has shaped the legacy of FederalCorporation.
                  </p>
                  <p>
                    To our incredible team, past and present, thank you for your dedication and brilliance.
                    Together, we've built an institution known for its integrity, professionalism, and
                    client-centric approach.
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

      <section className="about-anniversary-banner">
        <p>Here's to 50 years of legal excellence and to the many more ahead!</p>
      </section>
    </>
  );
}
