import * as React from 'react';

/** Outline icons the components draw themselves, inlined so the kit does not need an icon package. */
function Outline({ size, strokeWidth = 1.6, children }: { size: number; strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
    >
      {children}
    </svg>
  );
}

export const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <Outline size={size} strokeWidth={2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Outline>
);

export const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <Outline size={size}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </Outline>
);

export const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <Outline size={size}>
    <path d="M6 9l6 6 6-6" />
  </Outline>
);

export const ArrowDownIcon = ({ size = 13 }: { size?: number }) => (
  <Outline size={size} strokeWidth={2}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Outline>
);
