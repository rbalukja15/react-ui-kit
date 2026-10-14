import * as React from 'react';

// Inlined so the kit does not need `@mui/icons-material`.
function Svg({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style={{ fontSize: '1.5rem' }}>
      <path d={d} />
    </svg>
  );
}

export const MenuIcon = () => <Svg d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />;
export const MenuOpenIcon = () => (
  <Svg d="M3 18h13v-2H3zm0-5h10v-2H3zm0-7v2h13V6zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5z" />
);
