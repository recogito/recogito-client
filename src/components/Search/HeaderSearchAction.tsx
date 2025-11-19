import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useTransition, animated } from '@react-spring/web';
import { useTranslation } from 'react-i18next';

import './HeaderSearchAction.css';

interface HeaderSearchActionProps {

  onChangeSearch(value: string): void;

}

export const HeaderSearchAction = (props: HeaderSearchActionProps) => {

  const { t } = useTranslation(['common']);

  const el = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [value, setValue] = useState('');

  const transition = useTransition([open], {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 180 },
    leave: { opacity: 0, width: 0 }, 
    config: {
      duration: 125
    }
  });

  useEffect(() => {
    props.onChangeSearch(value);
  }, [value]);

  return ( 
    <div className="header-search-container">
      {transition((style, open) => open && (
        <animated.div style={style} ref={el} className="header-searchbox">
          <input 
            autoFocus 
            value={value}
            onChange={evt => setValue(evt.target.value)} 
            onBlur={() => !value && setOpen(false)} />
          <MagnifyingGlass size={16} />
        </animated.div>
      ))} 
            
      <button onClick={() => setOpen(true)}>
        <MagnifyingGlass size={16} /> <span>{t('Search', { ns: 'common' })}</span>
      </button>
    </div>
  )

}