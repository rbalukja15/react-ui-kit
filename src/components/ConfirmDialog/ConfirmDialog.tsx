'use client';

import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';

export interface ConfirmOptions {
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as a destructive action. */
  destructive?: boolean;
}

type Resolver = (confirmed: boolean) => void;

const ConfirmContext = React.createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

/**
 * Promise-based confirmation dialog — a drop-in replacement for
 * `window.confirm()`. In vetapp the labels came from i18next; here they
 * are props with sensible English defaults, so the component carries no
 * i18n dependency. Consumers who localise just pass translated strings.
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ message: 'Delete this record?', destructive: true })) { ... }
 */
export function ConfirmDialogProvider({
  children,
  defaultConfirmLabel = 'Confirm',
  defaultCancelLabel = 'Cancel',
}: {
  children: React.ReactNode;
  defaultConfirmLabel?: string;
  defaultCancelLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ConfirmOptions>({});
  const resolverRef = React.useRef<Resolver | null>(null);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = React.useCallback((result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={open} onClose={() => settle(false)} aria-labelledby="confirm-title">
        {opts.title && <DialogTitle id="confirm-title">{opts.title}</DialogTitle>}
        {opts.message && (
          <DialogContent>
            <DialogContentText>{opts.message}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => settle(false)}>{opts.cancelLabel ?? defaultCancelLabel}</Button>
          <Button
            onClick={() => settle(true)}
            variant="contained"
            color={opts.destructive ? 'error' : 'primary'}
            autoFocus
          >
            {opts.confirmLabel ?? defaultConfirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmDialogProvider>');
  return ctx;
}
