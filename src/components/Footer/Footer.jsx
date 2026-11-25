import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative text-neutral-400 font-sans border-t border-white/[0.08] mt-auto overflow-hidden bg-gradient-to-b from-transparent to-[#040406]">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-600/10 blur-[120px] pointer-events-none rounded-full"
      />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-16 pb-12">
        {/* Top Feature: Newsletter / Updates Banner */}
        <div className="mb-14 pb-12 border-b border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-white text-lg font-bold tracking-tight">Stay updated with new releases</h3>
            <p className="text-xs text-neutral-400 mt-1">Get weekly picks, live matches, and platform announcements.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full sm:w-auto items-center gap-2 glass-mirror rounded-2xl p-1.5 focus-within:border-cine-red/80 focus-within:shadow-neon-red transition-all"
          >
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              className="bg-transparent px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-5 py-2.5 glass-btn-primary text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-neon-red whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-14">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-0 lg:pr-8">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2.5 h-6 bg-[#E50914] rounded-sm inline-block shadow-neon-red"></span>
              <span className="text-white font-black tracking-wider text-xl">A Final Year College Project</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6 max-w-sm">
              Explore thousands of movies, exclusive originals, live sports streams, and timeless cinema curated for film enthusiasts everywhere.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-150">Home</Link>
              </li>
              <li>
                <Link to="/live" className="hover:text-white transition-colors duration-150">Live Sports</Link>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors duration-150">Careers</a>
              </li>
              <li>
                <a href="#press" className="hover:text-white transition-colors duration-150">Press Kit</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#help" className="hover:text-white transition-colors duration-150">Help Center</a>
              </li>
              <li>
                <a href="#devices" className="hover:text-white transition-colors duration-150">Supported Devices</a>
              </li>
              <li>
                <a href="#feedback" className="hover:text-white transition-colors duration-150">Feedback</a>
              </li>
              <li>
                <a href="#speed" className="hover:text-white transition-colors duration-150">Speed Test</a>
              </li>
            </ul>
          </div>

          {/* Language & Socials */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Language</h4>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-mirror border border-white/10 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              <span className="text-neutral-200">English (Global)</span>
            </div>

            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Connect</h4>
            <div className="flex gap-2.5">
              <a
                href="https://www.instagram.com/jadav_girish_27_18/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl glass-mirror border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/60 hover:bg-[#E50914]/15 active:scale-95 transition-all duration-200 shadow-glass-sm"
                aria-label="Instagram Profile"
              >
                <i className="fa-brands fa-instagram text-base"></i>
              </a>
              <a
                href="#twitter"
                className="w-10 h-10 rounded-xl glass-mirror border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/60 hover:bg-[#E50914]/15 active:scale-95 transition-all duration-200 shadow-glass-sm"
                aria-label="X (Twitter) Profile"
              >
                <i className="fa-brands fa-x-twitter text-base"></i>
              </a>
              <a
                href="#github"
                className="w-10 h-10 rounded-xl glass-mirror border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#E50914]/60 hover:bg-[#E50914]/15 active:scale-95 transition-all duration-200 shadow-glass-sm"
                aria-label="GitHub Repository"
              >
                <i className="fa-brands fa-github text-base"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Disclaimer */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-normal text-neutral-400">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            <a href="#terms" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#cookies" className="hover:text-white transition-colors">Cookie Preferences</a>
            <a href="#legal" className="hover:text-white transition-colors">Legal Notices</a>
          </div>

          <div className="text-center md:text-right flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-1.5">
            <p>&copy; {currentYear} Girish Jadav M. All rights reserved.</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-400 font-semibold shadow-neon-red">
              Academic Project &bull; Non-commercial
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;