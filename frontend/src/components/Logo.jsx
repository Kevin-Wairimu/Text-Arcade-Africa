import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ mode = 'full', className = '' }) {
  const title = 'Text Africa Arcade';

  // --- ICON MODE ---
  // Renders a square icon. Its size will be controlled by classes like 'h-10 w-10'.
  if (mode === 'icon') {
    return (
      <Link to="/" aria-label={title}>
        <svg
          viewBox="0 0 128 128"
          role="img"
          aria-labelledby="logoIconTitle"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title id="logoIconTitle">{title}</title>
          <rect x="0" y="0" width="128" height="128" rx="18" fill="#1E6B2B" />
          <circle cx="44" cy="44" r="16" fill="#FFFFFF" />
          <path d="M62 36 L98 36 L98 44 L76 44 L76 92 L62 92 Z" fill="#FFFFFF" />
          <circle cx="64" cy="64" r="60" fill="none" stroke="#77BFA1" strokeOpacity="0.06" strokeWidth="8" />
        </svg>
      </Link>
    );
  }

  // --- FULL LOGO MODE (default) ---
  // Renders the horizontal wordmark. Size will be controlled by classes like 'h-10 w-auto'.
  return (
    <Link to="/" aria-label={title}>
      <svg
        viewBox="0 0 400 100"
        role="img"
        aria-labelledby="logoFullTitle"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <title id="logoFullTitle">{title}</title>
        <g transform="translate(12,12)">
          <rect x="0" y="0" width="76" height="72" rx="14" fill="#1E6B2B" />
          <circle cx="22" cy="26" r="10" fill="#FFFFFF" opacity="0.95" />
          <path d="M34 18 L60 18 L60 24 L46 24 L46 58 L34 58 Z" fill="#FFFFFF" />
        </g>
        <g transform="translate(110,36)">
          <text x="0" y="0" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#111827">Text Africa</text>
          <text x="0" y="28" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="16" fill="#77BFA1">Arcade</text>
        </g>
      </svg>
    </Link>
  );
}
