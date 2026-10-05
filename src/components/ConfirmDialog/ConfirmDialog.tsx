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
 * `window.confirm()`. Labels are props with sensible English defaults,
 * so the component carries no i18n dependency. Consumers who localise just pass translated strings.
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
  const titleId = React.useId();
  const messageId = React.useId();

  const confirm = React.useCallback((options: ConfirmOptions) => {
    // Only one dialog shows at a time: a newer request supersedes a
    // pending one, which resolves as cancelled rather than hanging.
    resolverRef.current?.(false);
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  // Don't leave callers awaiting forever if the provider unmounts mid-prompt.
  React.useEffect(() => () => {
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  const settle = React.useCallback((result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={open}
        onClose={() => settle(false)}
        // Name the dialog by its title, or by its message when there is no
        // title, so screen readers never announce an unlabelled dialog.
        aria-labelledby={opts.title ? titleId : opts.message ? messageId : undefined}
        aria-describedby={opts.title && opts.message ? messageId : undefined}
      >
        {opts.title && <DialogTitle id={titleId}>{opts.title}</DialogTitle>}
        {opts.message && (
          <DialogContent>
            <DialogContentText id={messageId}>{opts.message}</DialogContentText>
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
