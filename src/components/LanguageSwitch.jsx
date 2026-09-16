'use client';

import { useLanguage } from './LanguageProvider';

const OPTIONS = [
  { code: 'lt', label: 'LT' },
  { code: 'en', label: 'EN' },
];

/** Segmented LT/EN picker for pages without the app Topbar (login, register…). */
export default function LanguageSwitch({ className = '' }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('lang.toggleTitle')}
      className={`inline-flex items-center p-0.5 rounded-lg border border-[#DCC9A8] bg-[#FFFDF8] ${className}`}
    >
      {OPTIONS.map(({ code, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(code)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
              active ? 'bg-[#C8654A] text-white' : 'text-[#5A4A38] hover:bg-[#F4ECDF]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
