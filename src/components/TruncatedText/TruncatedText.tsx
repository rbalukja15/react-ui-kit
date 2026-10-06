import * as React from 'react';
import { Tooltip, Typography, type TypographyProps } from '@mui/material';

export interface TruncatedTextProps extends Omit<TypographyProps, 'children' | 'noWrap'> {
  text: string;
}

/**
 * Single-line text that truncates with an ellipsis and shows the full value
 * in a tooltip, but only while it is actually cut off, so short values get no
 * pointless tooltip. Keeps table rows a uniform height whatever the content.
 *
 * Bound the width from the parent (a cell `maxWidth`, or `minWidth: 0` on a
 * flex child); this component handles the ellipsis and the tooltip.
 */
export function TruncatedText({ text, ...props }: TruncatedTextProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // +1 absorbs sub-pixel rounding, so a value that exactly fits is not flagged.
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    // An empty title renders no tooltip. MUI merges its ref with ours, so the
    // measuring ref keeps working.
    <Tooltip title={overflowing ? text : ''}>
      <Typography ref={ref} noWrap {...props}>
        {text}
      </Typography>
    </Tooltip>
  );
}
