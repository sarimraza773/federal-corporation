import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/team', label: 'Team' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
  { to: '/about', label: 'About Us' },
  { to: '/useful-links', label: 'Resources' },
  { to: '/news', label: 'News' },
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
        <div className="grid min-w-0 grid-cols-[auto_auto] grid-rows-[auto_auto] items-center gap-x-2 sm:gap-x-3">
          <span className="min-w-0 truncate font-serif text-sm leading-none text-white tracking-tightish min-[380px]:text-base sm:text-xl">
              Rizvi&amp;ivziЯ
          </span>
          <NavLink
            to="/"
            aria-label="FederalCorporation home"
            className="row-span-1 flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:gap-3"
          >
            <img
              src={logo}
              alt=""
              width="36"
              height="36"
              decoding="async"
              className="hidden h-9 w-9 shrink-0 rounded-full object-contain sm:block"
            />
            <span className="whitespace-nowrap font-serif text-[0.82rem] leading-none text-white tracking-tightish min-[360px]:text-sm min-[420px]:text-base sm:text-xl">
              FederalCorporation
            </span>
          </NavLink>
          <span className="col-start-1 row-start-2 mt-1 max-w-[10.5rem] text-[7px] font-medium uppercase leading-tight tracking-[0.06em] text-white/70 min-[380px]:text-[8px] sm:max-w-none sm:whitespace-nowrap sm:text-[10px] sm:tracking-[0.12em]">
            Advocate &amp; Legal Practitioners
          </span>
        </div>

        <a
          href="tel:+9236316677"
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
