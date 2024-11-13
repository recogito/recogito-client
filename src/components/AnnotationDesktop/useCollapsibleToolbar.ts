import { useEffect, useRef, useState } from 'react';

export const useCollapsibleToolbar = () => {

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
    if (!ref.current) return;
    
    const shouldCollapse = ref.current ? ref.current.scrollWidth > ref.current.clientWidth : false;
    
    if (shouldCollapse && !collapsed) {
      setBreakpoint(windowWidth);
      setCollapsed(true);
    } else if (!shouldCollapse && windowWidth > breakpoint) {
      setCollapsed(false);
    }
  }, [windowWidth]);

  return { ref, collapsed };

}