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

function Pencil({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19h3L17.5 9.5a2.12 2.12 0 0 0-3-3L5 16v3Z" />
      <path d="M14 7.5l2.5 2.5" />
    </svg>
  );
}

function Code({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 7l-5 5 5 5" />
      <path d="M15 7l5 5-5 5" />
    </svg>
  );
}

function Document({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

function Sparkle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v18M3 12h18" />
      <path d="M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
    </svg>
  );
}

function Globe({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3Z" />
    </svg>
  );
}

function Calculator({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7" />
      <path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </svg>
  );
}

function Presentation({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M9 20h6" />
      <path d="M8 12l2.5-3 2 2L16 8" />
    </svg>
  );
}

export function Settings({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 2.75v2.4M12 18.85v2.4M21.25 12h-2.4M5.15 12h-2.4M18.55 5.45l-1.7 1.7M7.15 16.85l-1.7 1.7M18.55 18.55l-1.7-1.7M7.15 7.15l-1.7-1.7" />
    </svg>
  );
}

export function ArrowUp({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M12 19V5" />
      <path d="M5.5 11.5L12 5l6.5 6.5" />
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

const TASK_ICONS = {
  pencil: Pencil,
  code: Code,
  document: Document,
  sparkle: Sparkle,
  globe: Globe,
  calculator: Calculator,
  presentation: Presentation,
} as const;

export type TaskIconName = keyof typeof TASK_ICONS;

export function TaskIcon({ name, className }: { name: TaskIconName; className?: string }) {
  const Icon = TASK_ICONS[name];
  return <Icon className={className} />;
}
