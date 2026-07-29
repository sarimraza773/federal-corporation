import React from 'react';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import faiqPortrait from '../assets/team/faiq_raza_DP.jpeg';
import { managingPartners, professionalStaff } from '../data/team.js';

const portraits = { faiq: faiqPortrait };

function PartnerBadges({ credentials }) {
  if (!credentials.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Partner credentials and status">
      {credentials.map((credential) => (
        <span
          key={credential}
          className="rounded-full border border-maroon-900/20 bg-maroon-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-maroon-900"
        >
          {credential}
        </span>
      ))}
    </div>
  );
}

export default function Team() {
  return (
    <>
      <Seo
        title="Team"
        description="Meet the Managing Partners and professionals at FederalCorporation who provide legal services across diverse practice areas."
      />

      <Section eyebrow="Firm leadership" title="Managing Partners">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base leading-7 text-ink-200/80 sm:text-lg">
            FederalCorporation is led by three Managing Partners whose experience spans property and real estate
            conveyance, taxation, corporate and commercial law, intellectual property, and dispute resolution.
            Together, they guide the Firm’s work with practical judgement and a longstanding commitment to client service.
          </p>
        </div>

        <div className="mt-12 space-y-5 sm:space-y-6">
          {managingPartners.map((partner, index) => {
            const portrait = portraits[partner.portrait];
            return (
              <article
                key={partner.name}
                className={`overflow-hidden rounded-3xl border border-navy-900/15 shadow-soft ${
                  portrait
                    ? 'grid bg-white/55 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]'
                    : 'bg-white/40 p-6 backdrop-blur-sm sm:p-8 lg:grid lg:grid-cols-[minmax(220px,0.55fr)_minmax(0,1.45fr)] lg:gap-12 lg:p-10'
                }`}
              >
                {portrait ? (
                  <div className="relative min-h-[420px] bg-navy-900/5 sm:min-h-[520px] lg:min-h-full">
                    <img
                      src={portrait}
                      alt="Syed Faiq Raza, Managing Partner"
                      width="1066"
                      height="1600"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-[center_34%]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-900/25 to-transparent" aria-hidden="true" />
                  </div>
                ) : null}

                <div className={portrait ? 'p-6 sm:p-8 lg:p-10' : 'contents'}>
                  <div className={portrait ? '' : 'lg:pr-4'}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">
                      Leadership
                    </p>
                    <h3 className="mt-4 font-serif text-3xl leading-tight tracking-tightish text-ink-100 sm:text-4xl">
                      {partner.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-maroon-900">
                      {partner.role}
                    </p>
                    <PartnerBadges credentials={partner.credentials} />
                  </div>

                  <div className={`${portrait ? 'mt-8' : 'mt-8 lg:mt-0'} space-y-5 text-[0.98rem] leading-7 text-ink-200/80 sm:text-base sm:leading-8`}>
                    {partner.biography.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 border-t border-navy-900/15 pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">
              Professional Staff
            </p>
            <h3 className="mt-3 font-serif text-2xl tracking-tightish text-ink-100 sm:text-3xl">
              Client service, tax, and field operations
            </h3>
            <p className="mt-4 text-sm leading-6 text-ink-200/80">
              Supporting the Firm’s legal work with experienced administrative, tax, and field services.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {professionalStaff.map((member) => (
              <article
                key={`${member.name}-${member.role}`}
                className="rounded-xl border border-navy-900/10 bg-white/30 px-5 py-4 backdrop-blur-sm"
              >
                <h4 className="font-medium tracking-tightish text-ink-100">{member.name}</h4>
                <p className="mt-1 text-sm text-ink-200/80">{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <div className="h-16" />
    </>
  );
}
