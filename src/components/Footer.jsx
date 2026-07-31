import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink-950/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-serif text-xl text-white tracking-tightish">Federal Corporation</div>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Federal Corporation - Karachi.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <NavLink className="text-sm text-white/70 hover:text-white" to="/services">
              Services
            </NavLink>
            <NavLink className="text-sm text-white/70 hover:text-white" to="/about">
              About
            </NavLink>
            <NavLink className="text-sm text-white/70 hover:text-white" to="/contact">
              Contact
            </NavLink>
            <NavLink className="text-sm text-white/70 hover:text-white" to="/staff/login">
              Staff Login
            </NavLink>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-white/60 leading-relaxed">
          <p>
            Attorney Advertising / Disclaimer: This website is for general information purposes only and does not
            constitute legal advice. No attorney-client relationship is created by use of this website.
          </p>
          <p className="mt-3">Copyright {year} Federal Corporation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
