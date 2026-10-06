// Components
export * from './components/Breadcrumbs';
export * from './components/ConfirmDialog';
export * from './components/EmptyState';
export * from './components/FloatingCreateButton';
export * from './components/PageSkeleton';
export * from './components/RowActions';
export * from './components/TableSkeleton';
export * from './components/TruncatedText';

// Theme
export { createAppTheme } from './theme/theme';
export type { ThemeMode, ThemeOverrides } from './theme/theme';
export { ThemeModeProvider, useThemeMode } from './theme/ThemeModeContext';
export type {
  ThemeModeContextValue,
  ThemeModePreference,
  ThemeModeProviderProps,
} from './theme/ThemeModeContext';

// Hooks
export { useDebouncedValue } from './hooks/useDebouncedValue';

// --- TODO: port the remaining vetapp components into src/components/ ---
//   AppDatePicker   (controlled + optional RHF adapter)
//   FkAutocomplete  (controlled + optional RHF adapter)
//   TitleCaseField  (controlled + optional RHF adapter)
// and the useUrlState hook. See README "Porting guide".
