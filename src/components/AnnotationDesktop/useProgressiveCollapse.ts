import { useEffect, useRef, useState } from 'react';

interface CollapseState {

  level: 0 | 1 | 2 | 3;

  breakpoints: number[];

}

export const useProgressiveCollapse = (buffer = 0) => {

  const ref = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [collapseState, setCollapseState] = useState<CollapseState>({
    level: 0,
    breakpoints: []
  });

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const hasOverflow = ref.current.scrollWidth >= (ref.current.clientWidth - buffer);
    
    const { level, breakpoints } = collapseState;

    if (hasOverflow) {
      // If we're overflowing and not at max collapse level, increment the level
      if (level < 3) {
        setCollapseState({
          level: (level + 1) as CollapseState['level'],
          breakpoints: [...breakpoints, windowWidth]
        });
      }
    } else {
      // Check if we can decrease collapse level
      for (let i = breakpoints.length - 1; i >= 0; i--) {
        if (windowWidth > breakpoints[i]) {
          setCollapseState({
            level: i as CollapseState['level'],
            breakpoints: breakpoints.slice(0, i)
          });
          break;
        }
      }
    }
  }, [windowWidth, buffer]);

  return {
    ref,
    collapseLevel: collapseState.level,
    breakpoints: collapseState.breakpoints
  };

}