import { renderToString } from 'react-dom/server';
import { useUrlState } from './useUrlState';

function Page() {
  const [{ q }] = useUrlState({ q: 'none' });
  return <span>{q}</span>;
}

describe('the browser adapter on the server', () => {
  it('renders the defaults', () => {
    window.history.replaceState(null, '', '/list?q=cat');
    expect(renderToString(<Page />)).toContain('none');
  });
});
