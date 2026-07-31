import React from 'react';
import Mail from 'lucide-react/dist/esm/icons/mail.js';
import MapPin from 'lucide-react/dist/esm/icons/map-pin.js';
import Phone from 'lucide-react/dist/esm/icons/phone.js';
import ReceiptText from 'lucide-react/dist/esm/icons/receipt-text.js';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import ContactForm from '../components/ContactForm.jsx';

const primaryContacts = [
  {
    label: 'Email',
    icon: Mail,
    items: [{ text: 'federalcorporation@hotmail.com', href: 'mailto:federalcorporation@hotmail.com' }],
  },
  {
    label: 'Tel',
    icon: Phone,
    items: [
      { text: '+922136321038', href: 'tel:+922136321038' },
      { text: '+922136316677', href: 'tel:+922136316677' },
    ],
  },
  {
    label: 'Cell',
    icon: Phone,
    items: [
      { text: '+923002039564', href: 'tel:+923002039564' },
      { text: '+923028299910', href: 'tel:+923028299910' },
    ],
  },
  {
    label: 'Address',
    icon: MapPin,
    items: [{ text: 'M-2-A U.K.Square, Block 16, F.B. Area, Karachi', href: 'https://maps.app.goo.gl/WYUoN4puhW53Faa77' }],
  },
];

function ContactRow({ label, icon: Icon, items }) {
  return (
    <div className="flex gap-4 border-b border-navy-900/10 pb-5 last:border-b-0 last:pb-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy-900/15 bg-navy-900/5 text-ink-100">
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">
          {label}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-base leading-relaxed text-ink-100">
          {items.map((item, index) => (
            <React.Fragment key={item.text}>
              {item.href ? (
                <a href={item.href} className="transition-colors hover:text-maroon-900">
                  {item.text}
                </a>
              ) : (
                <span>{item.text}</span>
              )}
              {index < items.length - 1 ? <span className="text-ink-200/60">-</span> : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact"
        description="Contact us for Karachi office details and legal inquiries."
      />

      <Section title="Get in touch">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-ink-200/80 sm:text-lg">
            Contact us for legal inquiries, office details, and taxation-specific support.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
          <ContactForm />

          <div className="space-y-6">
            <section className="rounded-3xl border border-navy-900/15 bg-white/45 p-6 shadow-soft sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-900">
                Office
              </p>
              <h3 className="mt-3 font-serif text-2xl tracking-tightish text-ink-100">
                Contact details
              </h3>

              <div className="mt-7 space-y-5">
                {primaryContacts.map((contact) => (
                  <ContactRow key={contact.label} {...contact} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-navy-900/15 bg-navy-900 p-6 text-white shadow-soft sm:p-8">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white">
                  <ReceiptText size={19} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                    Taxation
                  </p>
                  <h3 className="mt-3 font-serif text-2xl tracking-tightish text-white">
                    Tax support contact
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-relaxed">
                <p>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                    Cell
                  </span>
                  <a
                    href="tel:+9230982222501"
                    className="mt-1 inline-block text-white transition-colors hover:text-white/80"
                  >
                    +9230982222501
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </Section>

      <div className="h-16" />
    </>
  );
}
