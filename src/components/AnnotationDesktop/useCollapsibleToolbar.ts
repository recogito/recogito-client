import { useEffect, useRef, useState } from 'react';

export const useCollapsibleToolbar = (buffer = 0) => {

  const ref = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [breakpoint, setBreakpoint] = useState(0);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  useEffect(() => {
    const shouldCollapse = ref.current ? (ref.current.scrollWidth + buffer) > ref.current.clientWidth : false;

    if (shouldCollapse && !collapsed) {
      setBreakpoint(windowWidth);
      setCollapsed(true);
    } else if (!shouldCollapse && windowWidth > breakpoint) {
      setCollapsed(false);
    }
  }, [windowWidth, buffer]);

  return { ref, collapsed };

}