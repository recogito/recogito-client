import { useEffect, useRef } from 'react';
import { useTransition } from '@react-spring/web';
import type { DrawerPanel } from '@components/AnnotationDesktop';

export const useDrawerTransition = (panel: DrawerPanel | undefined, args: any) => {

  const previous = useRef<DrawerPanel | undefined>();

  const shouldAnimate = 
    // Drawer currently closed, and should open
    !previous.current && panel ||
    // Drawer currently open, and should close
    previous.current && !panel;

  const drawerTransition = useTransition([panel], {
    ...args,
    config: {
      ...args.config,
      duration: shouldAnimate ? args.config.duration || 120 : 0
    }
  });

  useEffect(() => {
    previous.current = panel;
  }, [panel]);

  return drawerTransition;

}