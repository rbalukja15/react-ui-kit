import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Skeleton } from '@mui/material';

export interface TableSkeletonProps {
  /** Number of placeholder rows. */
  rows?: number;
  /** Number of columns, or an array of header labels. */
  columns?: number | string[];
  /** Render the header row. */
  showHeader?: boolean;
}

/**
 * Loading placeholder for tables. Zero app coupling — pure MUI.
 * Lifted from vetapp as-is.
 */
export function TableSkeleton({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps) {
  const headers = Array.isArray(columns) ? columns : Array.from({ length: columns }, () => '');
  const colCount = headers.length;

  return (
    <Table aria-busy="true" aria-label="loading">
      {showHeader && (
        <TableHead>
          <TableRow>
            {headers.map((label, i) => (
              <TableCell key={i}>{label || <Skeleton width="60%" />}</TableCell>
            ))}
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: colCount }).map((__, c) => (
              <TableCell key={c}>
                <Skeleton />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
