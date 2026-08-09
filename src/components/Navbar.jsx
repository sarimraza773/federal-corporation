import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/fedcorp_clean_logo.png';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/team', label: 'Team' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
  { to: '/useful-links', label: 'Resources' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
];

function NavButton({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'whitespace-nowrap rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/90 hover:bg-white/15',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-navy-900">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-10">
        <div className="grid min-w-0 grid-rows-[auto_auto] items-center">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <NavLink
              to="/"
              aria-label="Federal Corporation home"
              className="flex min-w-0 items-center gap-1.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:gap-3"
            >
              <span className="whitespace-nowrap font-serif text-[0.68rem] leading-none text-white tracking-tightish min-[360px]:text-xs min-[420px]:text-base sm:text-xl">
                Federal Corporation
              </span>
              <img
                src={logo}
                alt=""
                width="36"
                height="36"
                decoding="async"
                className="h-7 w-7 shrink-0 scale-125 rounded-full object-contain brightness-0 invert min-[380px]:h-8 min-[380px]:w-8 sm:h-9 sm:w-9"
              />
            </NavLink>
            <span className="min-w-0 truncate font-serif text-[0.68rem] leading-none text-white tracking-tightish min-[380px]:text-base sm:text-xl">
              Rizvi&amp;ivziЯ
            </span>
          </div>
          <span className="mt-1 max-w-[10.5rem] text-[7px] font-medium uppercase leading-tight tracking-[0.06em] text-white/70 min-[380px]:text-[8px] sm:max-w-none sm:whitespace-nowrap sm:text-[10px] sm:tracking-[0.12em]">
            Advocates &amp; Legal Practitioners
          </span>
        </div>

        <a
          href="tel:+923002039564"
          className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:text-xs sm:tracking-[0.14em]"
        >
          Call Now
        </a>
      </div>

      <div>
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-10">
          <nav aria-label="Primary navigation" className="nav-scroll flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center sm:pb-0">
            {nav.map((item) => (
              <NavButton key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
