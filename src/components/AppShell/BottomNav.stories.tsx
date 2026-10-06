import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BottomNav } from './BottomNav';

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
);

const items = [
  { label: 'Home', href: '/', icon: <Icon d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /> },
  { label: 'Projects', href: '/projects', icon: <Icon d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8z" /> },
  { label: 'Calendar', href: '/calendar', icon: <Icon d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14z" /> },
];

/** Stands in for a router: the story keeps the path in state. */
function Demo() {
  const [path, setPath] = React.useState('/projects');
  const StoryLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function StoryLink(
        { href = '/', ...rest },
        ref,
      ) {
        return (
          <a
            ref={ref}
            href={`#${href}`}
            {...rest}
            onClick={(event) => {
              event.preventDefault();
              setPath(href);
            }}
          />
        );
      }),
    [],
  );
  return <BottomNav items={items} currentPath={path} LinkComponent={StoryLink} hideAtBreakpoint={null} />;
}

const meta: Meta<typeof BottomNav> = {
  title: 'Layout/BottomNav',
  component: BottomNav,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof BottomNav> = { render: () => <Demo /> };
