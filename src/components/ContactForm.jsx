import React, { useRef, useState } from 'react';
import { contactLimits, validateContactInput } from '../lib/contact.js';
import { supabase } from '../lib/supabase.js';

const successMessage = 'Thank you. Your message has been sent successfully. A member of our team will get back to you shortly.';
const failureMessage = 'We were unable to send your message. Please try again or contact us directly by email.';

export default function ContactForm() {
  const [status, setStatus] = useState({ type: 'idle', msg: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const submissionLock = useRef(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (submissionLock.current) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { values, errors } = validateContactInput({
      name: formData.get('name'),
      email: formData.get('email'),
      contactNumber: formData.get('contactNumber'),
      message: formData.get('message'),
    });

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus({ type: 'error', msg: 'Please correct the highlighted fields and try again.' });
      form.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }

    if (!supabase) {
      setStatus({ type: 'error', msg: failureMessage });
      return;
    }

    submissionLock.current = true;
    setIsSending(true);
    setStatus({ type: 'idle', msg: '' });

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...values,
          companyWebsite: String(formData.get('companyWebsite') || ''),
        },
      });

      if (error || data?.success !== true) throw error || new Error('Contact submission failed');

      form.reset();
      setFieldErrors({});
      setStatus({ type: 'ok', msg: successMessage });
    } catch {
      setStatus({ type: 'error', msg: failureMessage });
    } finally {
      submissionLock.current = false;
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSending}
      className="rounded-3xl border border-navy-900/15 bg-white/45 p-6 shadow-soft backdrop-blur-sm sm:p-8"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-900">
          Send an inquiry
        </p>
        <h3 className="mt-3 font-serif text-2xl tracking-tightish text-ink-100">
          Contact Us
        </h3>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">Name</span>
          <input
            id="contact-name"
            name="name"
            minLength={contactLimits.name.min}
            maxLength={contactLimits.name.max}
            required
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
            placeholder="Your full name"
          />
          {fieldErrors.name ? <span id="contact-name-error" className="mt-1 block text-xs text-red-700">{fieldErrors.name}</span> : null}
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">Email</span>
          <input
            id="contact-email"
            name="email"
            type="email"
            maxLength={contactLimits.email.max}
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
            className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
            placeholder="you@example.com"
          />
          {fieldErrors.email ? <span id="contact-email-error" className="mt-1 block text-xs text-red-700">{fieldErrors.email}</span> : null}
        </label>
      </div>

      <label className="block mt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">Contact Number</span>
        <input
          id="contact-number"
          name="contactNumber"
          type="tel"
          minLength={contactLimits.contactNumber.min}
          maxLength={contactLimits.contactNumber.max}
          required
          autoComplete="tel"
          aria-invalid={Boolean(fieldErrors.contactNumber)}
          aria-describedby={fieldErrors.contactNumber ? 'contact-number-error' : undefined}
          className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
          placeholder="Your contact number"
        />
        {fieldErrors.contactNumber ? <span id="contact-number-error" className="mt-1 block text-xs text-red-700">{fieldErrors.contactNumber}</span> : null}
      </label>

      <label className="block mt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">Message</span>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          minLength={contactLimits.message.min}
          maxLength={contactLimits.message.max}
          required
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
          placeholder="How can we help?"
        />
        {fieldErrors.message ? <span id="contact-message-error" className="mt-1 block text-xs text-red-700">{fieldErrors.message}</span> : null}
      </label>

      <div hidden aria-hidden="true">
        <label htmlFor="contact-company-website">Company website</label>
        <input
          id="contact-company-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSending}
          className="rounded-2xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>

        {status.type !== 'idle' ? (
          <p
            role={status.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`text-sm ${status.type === 'error' ? 'text-red-700' : 'text-ink-200/80'}`}
          >
            {status.msg}
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-200/60">
        Notice: Please do not send confidential information through this form. Submitting an inquiry does not
        create an attorney-client relationship until a formal engagement is confirmed.
      </p>
    </form>
  );
}
