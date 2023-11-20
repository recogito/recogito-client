import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useTransition, animated } from '@react-spring/web';
import type { Translations } from 'src/Types';
import { useClickOutside } from './useClickoutside';

import './HeaderSearchAction.css';

interface HeaderSearchActionProps {

  i18n: Translations;

}

export const HeaderSearchAction = (props: HeaderSearchActionProps) => {

  const { t } = props.i18n;

  const el = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(true);

  useClickOutside(el, () => setOpen(false));

  const transition = useTransition([open], {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 180 },
    leave: { opacity: 0, width: 0 }, 
    config: {
      duration: 125
    }
  });

  useEffect(() => {
    if (open)
      el.current?.classList.add('visible');
  }, [open]);

  return ( 
    <div className="header-search-container">
      {transition((style, open) => open && (
        <animated.div style={style} ref={el} className="header-searchbox">
          <input autoFocus />
          <MagnifyingGlass size={16} />
        </animated.div>
      ))} 
            
      <button onClick={() => setOpen(true)}>
        <MagnifyingGlass size={16} /> <span>{t['Search']}</span>
      </button>
    </div>
  )

}