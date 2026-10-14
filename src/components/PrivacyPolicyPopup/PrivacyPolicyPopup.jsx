import React, { useEffect } from 'react';

const STORAGE_KEY = 'cineflix-privacy-policy-accepted';

function PrivacyPolicyPopup({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const acceptPolicy = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-all">
      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_0_50px_-12px_rgba(220,38,38,0.25)] text-white"
      >
        {/* Subtle Red Top Gradient Accent */}
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-800 via-red-500 to-red-800"></div>

        <div className="p-6 sm:p-8">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
              {/* Privacy Lock Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close privacy policy popup"
            >
              {/* Close X Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 id="privacy-policy-title" className="mt-5 text-2xl font-semibold tracking-tight text-white">
            Your privacy matters
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Cineflix uses local storage to remember your watch list, continue watching
            progress, and popup preferences. We do not track you or sell your personal data.
          </p>

          {/* Developer / Project Card */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/[0.07]">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">College Project By</span>
              <span className="mt-0.5 font-semibold text-zinc-200">Jadav Girish</span>
            </div>

            <a
              href="https://instagram.com/jadav_girish_27_18"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1px] transition-transform hover:scale-105"
            >
              <div className="flex h-full w-full items-center gap-2 rounded-xl bg-zinc-950 px-3 py-1.5 transition-colors hover:bg-transparent">
                {/* Instagram Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span className="text-xs font-semibold text-white">Follow</span>
              </div>
            </a>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={acceptPolicy}
              className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-500/30 active:scale-[0.98]"
            >
              Accept & Continue
            </button>
            <p className="mt-4 text-center text-xs text-zinc-500">
              By continuing, you agree to our Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPopup;
export { STORAGE_KEY as PRIVACY_POLICY_STORAGE_KEY };