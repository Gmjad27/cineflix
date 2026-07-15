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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] p-6 text-white shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-500">Privacy Policy</p>
            <h2 id="privacy-policy-title" className="mt-2 text-2xl font-bold">
              Your privacy matters
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/20"
            aria-label="Close privacy policy popup"
          >
            ✕
          </button>
        </div>

        <p className="text-sm leading-6 text-gray-300">
          Cineflix uses local storage to remember your watch list, continue watching
          progress, and popup preferences. We do not sell your personal data.
        </p>

        <div className="mt-4 rounded-xl bg-white/5 p-4 text-sm text-gray-300">
          By continuing, you agree to our Privacy Policy and Terms of Use.<br/>
          Made by <span className="font-bold text-fuchsia-700">JADAV GIRISH</span> for collage project purposes.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          
          <button
            type="button"
            onClick={acceptPolicy}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Accept & Continue
          </button>
          {/* <p>Thanks for nexas</p> */}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPopup;
export { STORAGE_KEY as PRIVACY_POLICY_STORAGE_KEY };
