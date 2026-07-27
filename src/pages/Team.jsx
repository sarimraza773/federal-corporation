import React from 'react';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';

const partners = [
  {
    name: 'Syed Faiq Raza Rizvi',
    role: 'Managing Partner',
    status: 'On leave',
    text: 'Provides broad legal advisory and dispute resolution services across taxation, corporate, real estate, trademark, and trust registration matters. With a practical understanding of legal and regulatory requirements, he helps clients navigate complex issues through strategic advocacy, commercial insight, and a results-oriented approach.',
  },
  {
    name: 'Syed Wasim Raza Rizvi',
    role: 'Managing Partner',
    text: 'Recognized for his expertise in real estate law, advising clients on property transactions, conveyancing and development matters with practical judgment and meticulous attention to detail.',
  },
  {
    name: 'Syed Atif Raza',
    role: 'Managing Partner',
    text: 'Here’s a slightly expanded version:

Advises clients on corporate, taxation, real estate, trademark, and trust registration matters, with a practical understanding of legal requirements, regulatory compliance, and effective dispute resolution.

Another polished option:

Provides legal advisory services across corporate, taxation, real estate, trademark, and trust registration matters, helping clients navigate regulatory requirements, compliance issues, and dispute resolution with a practical approach.',
  },
];

const staff = [
  { name: 'Muhammad Sadiq', role: 'Senior Manager' },
  { name: 'Atif Waqas', role: 'Senior Tax Manager' },
  { name: 'Zohaib Hassain', role: 'Manager' },
  { name: 'Wajahat', role: 'Manager' },
  { name: 'Imran Owaisi', role: 'Senior Outdoor Staff' },
  { name: 'Nadir Hussain', role: 'Senior Outdoor Staff' },
  { name: 'Ghulam Abbas', role: 'Outdoor Staff' },
  { name: 'Salman Butt', role: 'Senior Staff' },
  { name: 'Shahzab', role: 'Senior Staff' },
  { name: 'Atif Saleem', role: 'Senior Staff' },
  { name: 'Osama Yousuf', role: 'Senior Staff' },
  { name: 'Hasnain', role: 'Senior Staff' },
  { name: 'Syed Hamza Ali', role: 'Junior Tax Consultant' },
];

/**
 * Team page
 *
 * This page introduces the key professionals within the firm. Each team
 * member is presented with their role and a brief description of their
 * expertise. Feel free to update the content or add more members as
 * necessary.
 */
export default function Team() {
  return (
    <>
      <Seo
        title="Team"
        description="Meet the lawyers and professionals at Federalcorporation who provide expert legal services across diverse practice areas."
      />

      <Section title="Meet our professionals">
        <div className="w-full">
          <p className="mx-auto w-full max-w-6xl text-center text-ink-200/80">
            At Federalcorporation, our team combines decades of experience with a passion for client service. Each member
            brings unique skills and insight to deliver the high-quality legal support our clients depend on.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {partners.map((member) => (
            <article
              key={member.name}
              className="flex h-full min-h-[250px] flex-col rounded-2xl border border-navy-900/15 bg-white/45 p-6 shadow-soft backdrop-blur-sm"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-maroon-900">
                  Leadership
                </p>
                <h3 className="mt-5 flex flex-wrap items-center gap-2 font-serif text-2xl tracking-tightish text-ink-100">
                  {member.name}
                  {member.status ? (
                    <span className="rounded-full border border-maroon-900/20 bg-maroon-900/10 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-maroon-900">
                      {member.status}
                    </span>
                  ) : null}
                </h3>
                <p className="mt-2 text-sm font-semibold text-maroon-900">{member.role}</p>
              </div>
              <p className="mt-8 text-sm leading-6 text-ink-200/80">{member.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 border-t border-navy-900/15 pt-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">
              Professional Staff
            </p>
            <h3 className="mt-3 font-serif text-2xl tracking-tightish text-ink-100 sm:text-3xl">
              Client service, tax, and field operations
            </h3>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <article
                key={`${member.name}-${member.role}`}
                className="rounded-xl border border-navy-900/10 bg-white/35 px-5 py-4 shadow-soft backdrop-blur-sm"
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
