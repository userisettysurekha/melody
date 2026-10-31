import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// A tiny in-app history stack: gives working back/forward buttons without a router
// (and avoids GitHub Pages deep-link 404s).
const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [nav, setNav] = useState({ stack: [{ name: 'home' }], pos: 0 });
  const [query, setQuery] = useState('');

  const navigate = useCallback((view) => {
    setNav((n) => {
      const cur = n.stack[n.pos];
      if (cur.name === view.name && cur.id === view.id) return n;
      const stack = [...n.stack.slice(0, n.pos + 1), view];
      return { stack, pos: stack.length - 1 };
    });
  }, []);
  const back = useCallback(() => setNav((n) => (n.pos > 0 ? { ...n, pos: n.pos - 1 } : n)), []);
  const forward = useCallback(
    () => setNav((n) => (n.pos < n.stack.length - 1 ? { ...n, pos: n.pos + 1 } : n)),
    []
  );

  const value = useMemo(
    () => ({
      view: nav.stack[nav.pos],
      canBack: nav.pos > 0,
      canForward: nav.pos < nav.stack.length - 1,
      navigate, back, forward, query, setQuery,
    }),
    [nav, navigate, back, forward, query]
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export const useNav = () => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used inside <NavProvider>');
  return ctx;
};
