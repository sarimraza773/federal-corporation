import React from 'react';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import faiqPortrait from '../assets/team/faiq_raza_DP.jpeg';
import wasimPortrait from '../assets/team/wasim_raza_DP.jpg';
import atifPortrait from '../assets/team/atif_raza_DP.png';
import muhammadSadiqPortrait from '../assets/team/Muhammad_Sadiq_DP_normalized.jpeg';
import zohaibHassanPortrait from '../assets/team/Zohaib_Hassan_DP_normalized.jpeg';
import atifWaqasKhanPortrait from '../assets/team/Atif_Waqas_Khan_DP_normalized.jpeg';
import muhammadImranPortrait from '../assets/team/Muhammad_Imran_DP_normalized.jpeg';
import nadirHussainPortrait from '../assets/team/Nadir_Hussain_DP_normalized.jpeg';
import wajahatRazaPortrait from '../assets/team/Wajahat_Raza_DP_normalized.jpeg';
import { associates, managingPartners, professionalStaff } from '../data/team.js';

const portraits = {
  faiq: { src: faiqPortrait, width: 1066, height: 1600 },
  wasim: { src: wasimPortrait, width: 1024, height: 1536 },
  atif: { src: atifPortrait, width: 1023, height: 1537 },
};

const staffPortraits = {
  muhammadSadiq: { src: muhammadSadiqPortrait, width: 1024, height: 1024 },
  zohaibHassan: { src: zohaibHassanPortrait, width: 1024, height: 1024 },
  atifWaqasKhan: { src: atifWaqasKhanPortrait, width: 1024, height: 1024 },
  muhammadImran: { src: muhammadImranPortrait, width: 1024, height: 1024 },
  nadirHussain: { src: nadirHussainPortrait, width: 1024, height: 1024 },
  wajahatRaza: { src: wajahatRazaPortrait, width: 1024, height: 1024 },
};

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

function StaffCard({ member, className = '' }) {
  const portrait = staffPortraits[member.portrait];

  return (
    <article
      className={`overflow-hidden rounded-xl border border-navy-900/10 bg-white/30 shadow-soft backdrop-blur-sm ${className}`.trim()}
    >
      <div className="aspect-square overflow-hidden bg-[#d0d1d2]">
        <img
          src={portrait.src}
          alt={`${member.name}, ${member.role}`}
          width={portrait.width}
          height={portrait.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="border-t border-navy-900/10 px-5 py-4">
        <h4 className="font-medium tracking-tightish text-ink-100">{member.name}</h4>
        <p className="mt-1 text-sm text-ink-200/80">{member.role}</p>
      </div>
    </article>
  );
}

export default function Team() {
  return (
    <>
      <Seo
        title="Team"
        description="Meet the Managing Partners and professionals at Federal Corporation who provide legal services across diverse practice areas."
      />

      <Section title="Managing Partners">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base leading-7 text-ink-200/80 sm:text-lg">
            Federal Corporation is led by three Managing Partners whose experience spans property and real estate
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
                      src={portrait.src}
                      alt={`${partner.name}, ${partner.role}`}
                      width={portrait.width}
                      height={portrait.height}
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
              Associates
            </p>
            <h3 className="mt-3 font-serif text-2xl tracking-tightish text-ink-100 sm:text-3xl">
              Focused legal support and client service
            </h3>
            <p className="mt-4 text-sm leading-6 text-ink-200/80">
              Supporting the Firm’s legal work with diligence, responsiveness, and attention to detail.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-3">
            {associates.map((member) => (
              <StaffCard
                key={`${member.name}-${member.role}`}
                member={member}
                className="lg:col-start-2"
              />
            ))}
          </div>
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

          <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {professionalStaff.map((member, index) => (
              <StaffCard
                key={`${member.name}-${member.role}`}
                member={member}
                className={`lg:col-span-2 ${index === 3 ? 'lg:col-start-2' : ''}`}
              />
            ))}
          </div>
        </div>
      </Section>

      <div className="h-16" />
    </>
  );
}
