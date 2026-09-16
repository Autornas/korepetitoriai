'use client';

/**
 * Five stars, optionally interactive.
 *
 * Read-only mode renders a fractional average by clipping the filled layer to
 * a percentage, so 4.3 does not silently round up to 4 or down to 5 — the
 * number next to it is the precise value, and the stars should not contradict.
 */
export default function Stars({ value = 0, max = 5, size = 16, onChange, label }) {
  const interactive = typeof onChange === 'function';
  const pct = Math.max(0, Math.min(1, value / max)) * 100;

  if (!interactive) {
    return (
      <span
        className="relative inline-block leading-none select-none"
        style={{ fontSize: size }}
        role="img"
        aria-label={label ?? `${value} / ${max}`}
      >
        <span className="text-[#E3D6BE]">{'★'.repeat(max)}</span>
        <span
          className="absolute inset-0 overflow-hidden text-[#D89A3A]"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          {'★'.repeat(max)}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex gap-1" role="group" aria-label={label ?? 'Rating'}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          aria-label={`${n}`}
          onClick={() => onChange(n)}
          className={`leading-none transition-transform hover:scale-110 ${
            n <= value ? 'text-[#D89A3A]' : 'text-[#E3D6BE] hover:text-[#EBC988]'
          }`}
          style={{ fontSize: size }}
        >
          ★
        </button>
      ))}
    </span>
  );
}
