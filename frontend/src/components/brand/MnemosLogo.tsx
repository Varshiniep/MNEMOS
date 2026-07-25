interface Props {
  size?: number;
  className?: string;
  /** 'full' = icon + wordmark, 'icon' = icon only, 'wordmark' = text only */
  variant?: 'full' | 'icon' | 'wordmark';
}

export function MnemosLogo({ size = 32, className = '', variant = 'full' }: Props) {
  const r = size / 2;

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={variant === 'icon' ? className : ''}
    >
      <defs>
        <radialGradient id="mnemos-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
        <radialGradient id="mnemos-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
        <filter id="mnemos-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Connector lines */}
      <line x1="16" y1="16" x2="16" y2="4"  stroke="rgba(167,139,250,0.45)" strokeWidth="1" />
      <line x1="16" y1="16" x2="16" y2="28" stroke="rgba(167,139,250,0.45)" strokeWidth="1" />
      <line x1="16" y1="16" x2="4"  y2="16" stroke="rgba(167,139,250,0.45)" strokeWidth="1" />
      <line x1="16" y1="16" x2="28" y2="16" stroke="rgba(167,139,250,0.45)" strokeWidth="1" />
      <line x1="16" y1="16" x2="6"  y2="6"  stroke="rgba(167,139,250,0.3)"  strokeWidth="1" />
      <line x1="16" y1="16" x2="26" y2="6"  stroke="rgba(167,139,250,0.3)"  strokeWidth="1" />
      <line x1="16" y1="16" x2="6"  y2="26" stroke="rgba(167,139,250,0.3)"  strokeWidth="1" />
      <line x1="16" y1="16" x2="26" y2="26" stroke="rgba(167,139,250,0.3)"  strokeWidth="1" />

      {/* Outer nodes */}
      <circle cx="16" cy="4"  r="2.2" fill="url(#mnemos-node)"  filter="url(#mnemos-glow)" opacity="0.9" />
      <circle cx="16" cy="28" r="2.2" fill="url(#mnemos-node)"  filter="url(#mnemos-glow)" opacity="0.9" />
      <circle cx="4"  cy="16" r="2.2" fill="url(#mnemos-node)"  filter="url(#mnemos-glow)" opacity="0.9" />
      <circle cx="28" cy="16" r="2.2" fill="url(#mnemos-node)"  filter="url(#mnemos-glow)" opacity="0.9" />
      <circle cx="6"  cy="6"  r="1.6" fill="rgba(167,139,250,0.7)" />
      <circle cx="26" cy="6"  r="1.6" fill="rgba(167,139,250,0.7)" />
      <circle cx="6"  cy="26" r="1.6" fill="rgba(167,139,250,0.7)" />
      <circle cx="26" cy="26" r="1.6" fill="rgba(167,139,250,0.7)" />

      {/* Outer ring */}
      <circle cx="16" cy="16" r={r - 1} stroke="rgba(79,70,229,0.25)" strokeWidth="1" fill="none" />

      {/* Central node */}
      <circle cx="16" cy="16" r="5" fill="url(#mnemos-core)" filter="url(#mnemos-glow)" />
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.9" />
    </svg>
  );

  if (variant === 'icon') return icon;

  if (variant === 'wordmark') {
    return (
      <span className={`font-bold tracking-tight text-white ${className}`} style={{ fontSize: size * 0.6 }}>
        MNEMOS
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <div>
        <div className="font-bold tracking-tight text-white leading-none" style={{ fontSize: Math.max(14, size * 0.5) }}>
          MNEMOS
        </div>
        {size >= 40 && (
          <div className="text-[10px] text-indigo-400 leading-none mt-0.5 tracking-wide">
            World Model
          </div>
        )}
      </div>
    </div>
  );
}
