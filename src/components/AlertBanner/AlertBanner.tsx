import { useState } from 'react';
import type { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { animated, easings, useTransition } from '@react-spring/web';

import './AlertBanner.css';

interface AlertBannerProps {

  children: ReactNode;

}

export const AlertBanner = (props: AlertBannerProps) => {

  const [open, setOpen] = useState(true);

  const bannerTransition = useTransition([open], {
    from: { maxHeight: '0px' },
    enter: { maxHeight: open ? '100px': '0px' },
    leave: { maxHeight: '0px' },
    config: { 
      duration: 300,
      easing: easings.easeOutCubic
    }
  });

  return bannerTransition((style, open) => open && (
    <animated.div style={style} className="alert-banner-wrapper">
      <div className="alert-banner">
        {props.children}

        <button 
          className="alert-banner-close unstyled icon-only"
          onClick={(() => setOpen(false))}>
          <X size={16} />
        </button>
      </div>
    </animated.div>
  ))

}