import { useState } from 'react';
import type { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { animated, easings, useTransition } from '@react-spring/web';

import './AlertBanner.css';

interface AlertBannerProps {

  id: string;

  children: ReactNode;

}

export const AlertBanner = (props: AlertBannerProps) => {

  const key = `r6o-alert-${props.id}`;

  const [open, setOpen] = useState(!localStorage.getItem(key));

  const bannerTransition = useTransition([open], {
    from: { maxHeight: '0px' },
    enter: { maxHeight: open ? '160px': '0px' },
    leave: { maxHeight: '0px' },
    config: { 
      duration: 300,
      easing: easings.easeOutCubic
    }
  });

  const onHide = () => {
    setOpen(false);
    localStorage.setItem(key, 'hidden');
  }

  return bannerTransition((style, open) => open && (
    <animated.div style={style} className="alert-banner-wrapper">
      <div className="alert-banner">
        {props.children}

        <button 
          className="alert-banner-close unstyled icon-only"
          onClick={onHide}>
          <X size={16} />
        </button>
      </div>
    </animated.div>
  ))

}