import * as React from 'react';

// Outline icons for the example screens. Apps bring their own icon set;
// the kit's components take any node as `icon`.
function I({ children, size = 16, sw = 1.6 }: { children: React.ReactNode; size?: number; sw?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const ReceiptIcon = () => <I><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></I>;
export const CoinIcon = () => <I><circle cx="12" cy="12" r="8.5" /><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.5 5 4.2 0 1.1-1 1.9-2.5 1.9-1.1 0-2.1-.5-2.6-1.3M12 6.5V8M12 16v1.5" /></I>;
export const BoxIcon = () => <I><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></I>;
export const AlertIcon = () => <I><path d="M12 4l9 16H3l9-16z" /><path d="M12 10v4M12 17h.01" /></I>;
export const ChartIcon = () => <I><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 16v-3M12 16V8M16 16v-5" /></I>;
export const GridIcon = () => <I><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></I>;
export const ListIcon = () => <I><path d="M4 6h16M4 12h16M4 18h10" /></I>;
export const CalendarIcon = () => <I size={18}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></I>;
export const DownloadIcon = () => <I><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></I>;
export const ArrowRightIcon = () => <I size={14} sw={2}><path d="M5 12h14M13 6l6 6-6 6" /></I>;
export const TrendUpIcon = () => <I size={12} sw={2}><path d="M4 16l6-6 4 4 6-7" /><path d="M15 7h5v5" /></I>;
export const PlusIcon = () => <I size={18} sw={2}><path d="M12 5v14M5 12h14" /></I>;
export const SyringeIcon = () => <I><path d="M17 3l4 4M19 5l-4 4M15 9l-8 8-3 1 1-3 8-8M11 7l6 6M9 13l2 2" /></I>;
export const ShieldIcon = () => <I><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /></I>;
export const PillIcon = () => <I><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M9.5 9.5l5 5" /></I>;
export const BagIcon = () => <I><path d="M6 4h12l-1 16H7L6 4z" /><path d="M6 8h12M10 13h4" /></I>;
export const ClockIcon = () => <I><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></I>;
export const HistoryIcon = () => <I><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /><path d="M12 8v4l2.5 1.5" /></I>;

// Sidebar icons, 20px.
const N = ({ children }: { children: React.ReactNode }) => <I size={20}>{children}</I>;
export const navIcons = {
  dashboard: <N><rect x="3.5" y="3.5" width="7" height="9" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="5" rx="1.5" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.5" /><rect x="3.5" y="15.5" width="7" height="5" rx="1.5" /></N>,
  clients: <N><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6" /></N>,
  pets: <N><circle cx="6" cy="10" r="2" /><circle cx="10" cy="5.5" r="2" /><circle cx="14" cy="5.5" r="2" /><circle cx="18" cy="10" r="2" /><path d="M12 11c-3 0-5.5 4-5.5 6.5 0 1.7 1.4 2.5 3 2.5 1 0 1.6-.5 2.5-.5s1.5.5 2.5.5c1.6 0 3-.8 3-2.5C17.5 15 15 11 12 11z" /></N>,
  appointments: <N><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></N>,
  invoices: <N><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></N>,
  inventory: <N><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></N>,
  purchases: <N><path d="M6 4h12l-1 16H7L6 4z" /><path d="M9 8a3 3 0 0 0 6 0" /></N>,
  expenses: <N><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /></N>,
  statistics: <N><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 16v-3M12 16V8M16 16v-5" /></N>,
  suppliers: <N><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></N>,
};
