import React, { useState } from 'react';

const mailto = {
  to: 'federalcorporation@hotmail.com',
  subject: encodeURIComponent('Website Inquiry - Federal Corporation'),
};

const limits = {
  name: 100,
  email: 254,
  message: 1800,
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ContactForm() {
  const [status, setStatus] = useState({ type: 'idle', msg: '' });

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      setStatus({ type: 'error', msg: 'Please fill out all fields.' });
      return;
    }

    if (name.length > limits.name || email.length > limits.email || message.length > limits.message) {
      setStatus({ type: 'error', msg: 'Please shorten your inquiry and try again.' });
      return;
    }

    if (!isValidEmail(email)) {
      setStatus({ type: 'error', msg: 'Please enter a valid email address.' });
      return;
    }

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
    );

    window.location.href = `mailto:${mailto.to}?subject=${mailto.subject}&body=${body}`;
    setStatus({ type: 'ok', msg: 'Opening your email client...' });
    e.currentTarget.reset();
  }

  return (
    <form
      onSubmit={onSubmit}
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
            name="name"
            maxLength={limits.name}
            required
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
            placeholder="Your full name"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">Email</span>
          <input
            name="email"
            type="email"
            maxLength={limits.email}
            required
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block mt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-200/80">Message</span>
        <textarea
          name="message"
          rows={6}
          maxLength={limits.message}
          required
          className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white/65 px-4 py-3 text-ink-100 outline-none transition-colors focus:border-navy-900/35"
          placeholder="How can we help?"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-2xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
        >
          Send Message
        </button>

        {status.type !== 'idle' ? (
          <p
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
