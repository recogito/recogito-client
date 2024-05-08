import { animated, easings, useTransition } from '@react-spring/web';
import type { Filter, PresentUser } from '@annotorious/react';
import { FilterPanel } from '@components/AnnotationDesktop/FilterPanel';
import type { Translations } from 'src/Types';

import './LeftDrawer.css';

interface LeftDrawerProps {

  i18n: Translations;

  open: boolean;
  
  present: PresentUser[];

  onSetFilter(filter?: Filter): void;

}

export const LeftDrawer = (props: LeftDrawerProps) => {

  const transition = useTransition([props.open], {
    from: { flexBasis: 0, opacity: 0 },
    enter: { flexBasis: 240, opacity: 1 },
    leave: { flexBasis: 0, opacity: 0 },
    config: {
      duration: 350,
      easing: easings.easeInOutCubic
    }
  });

  return transition((style, open) => open && (
    <animated.div 
      style={style}
      className={props.open ? 'ta-drawer ta-left-drawer open' : 'ta-drawer ta-left-drawer'}>
      <aside>
        <FilterPanel 
          i18n={props.i18n} 
          present={props.present} 
          onSetFilter={props.onSetFilter} />
      </aside>
    </animated.div>
  ))

}