import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "dealstage_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 pointer-events-none">
      <div className="max-w-lg mx-auto sm:mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 pointer-events-auto">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 font-medium mb-1">We use cookies</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              We use essential cookies to make DealStage work and analytics cookies to improve your experience.{" "}
              <Link to="/cookie-policy" className="text-indigo-400 hover:text-indigo-300 underline">Learn more</Link>
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={accept}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Accept all
              </button>
              <button
                onClick={decline}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                Essential only
              </button>
            </div>
          </div>
          <button onClick={decline} className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
