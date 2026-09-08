type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function ArrowUp({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M12 19V5" />
      <path d="M5.5 11.5L12 5l6.5 6.5" />
    </svg>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 9.5l5.5 5.5 5.5-5.5" />
    </svg>
  );
}

export function ArrowUpRight({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 16.5l9-9" />
      <path d="M8.5 7.5h8v8" />
    </svg>
  );
}

export function Check({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function Close({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function Clip({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M17 8.5l-6.9 6.9a2.6 2.6 0 0 0 3.7 3.7l7.1-7.1a4.4 4.4 0 0 0-6.2-6.2l-7.1 7.1a6.2 6.2 0 0 0 8.8 8.8l4.1-4.1" />
    </svg>
  );
}
