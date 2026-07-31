import React from 'react';
import BadgePercent from 'lucide-react/dist/esm/icons/badge-percent.js';
import Banknote from 'lucide-react/dist/esm/icons/banknote.js';
import Building2 from 'lucide-react/dist/esm/icons/building-2.js';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.js';
import FileSignature from 'lucide-react/dist/esm/icons/file-signature.js';
import Landmark from 'lucide-react/dist/esm/icons/landmark.js';
import Scale from 'lucide-react/dist/esm/icons/scale.js';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js';
import Section from '../components/Section.jsx';

const resourceGroups = [
  {
    title: 'Revenue Authorities',
    links: [
      { name: 'Federal Board of Revenue', url: 'https://www.fbr.gov.pk', icon: BadgePercent },
      { name: 'Punjab Revenue Authority', url: 'https://pra.punjab.gov.pk', icon: Landmark },
      { name: 'Sindh Revenue Board', url: 'https://www.srb.gos.pk/srb/', icon: Landmark },
      { name: 'KP Revenue Authority', url: 'https://kpra.kp.gov.pk', icon: Landmark },
      { name: 'Balochistan Revenue Authority', url: 'https://bra.gob.pk', icon: Landmark },
      {
        name: 'Sindh e-stamping',
        url: 'https://www.estamps.gos.pk/eStampCitizenPortal/ChallanFormView/HomePage',
        icon: FileSignature,
      },
    ],
  },
  {
    title: 'Finance & Investment',
    links: [
      { name: 'State Bank of Pakistan', url: 'https://www.sbp.org.pk/index.html', icon: Banknote },
      { name: 'Ministry of Finance', url: 'https://www.finance.gov.pk', icon: Landmark },
      { name: 'Sindh Investment Department', url: 'https://sindhinvestment.gos.pk', icon: Building2 },
    ],
  },
  {
    title: 'Corporate & Regulatory',
    links: [
      {
        name: 'Securities & Exchange Commission of Pakistan',
        url: 'https://www.secp.gov.pk',
        icon: ShieldCheck,
      },
      { name: 'Intellectual Property of Pakistan', url: 'https://ipo.gov.pk', icon: FileSignature },
      { name: 'Competition Commission of Pakistan', url: 'https://www.cc.gov.pk', icon: Scale },
    ],
  },
];

function ResourceLink({ name, url, icon: Icon }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[142px] flex-col justify-between rounded-xl border border-navy-900/15 bg-white/35 p-5 shadow-[0_10px_28px_rgba(4,30,66,0.08)] transition-colors hover:bg-white/50"
    >
      <span className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy-900/15 bg-navy-900/5 text-ink-100 transition-colors group-hover:bg-navy-900 group-hover:text-white">
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <ExternalLink
          size={18}
          strokeWidth={1.8}
          className="mt-1 shrink-0 text-maroon-900 opacity-70 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </span>

      <span className="mt-5 font-serif text-xl leading-tight tracking-tightish text-ink-100">
        {name}
      </span>

      <span className="mt-4 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-maroon-900">
        Visit website
      </span>
    </a>
  );
}

export default function UsefulLinks() {
  return (
    <>
      <Section title="Useful Links">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-ink-200/80 sm:text-lg">
            Official government, revenue, banking, corporate, and regulatory resources for
            reference, compliance, and public information.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {resourceGroups.map((group) => (
            <section key={group.title} aria-labelledby={`${group.title}-heading`}>
              <div className="mb-4 flex flex-col gap-2 border-b border-navy-900/15 pb-3 sm:flex-row sm:items-end sm:justify-between">
                <h3
                  id={`${group.title}-heading`}
                  className="font-serif text-2xl tracking-tightish text-ink-100"
                >
                  {group.title}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">
                  {group.links.length} links
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.links.map((link) => (
                  <ResourceLink key={link.name} {...link} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>

      <div className="h-12" />
    </>
  );
}
