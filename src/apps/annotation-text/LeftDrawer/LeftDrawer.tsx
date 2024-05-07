import { animated, easings, useTransition } from '@react-spring/web';
import { FilterPanel } from '@components/AnnotationDesktop/FilterPanel';
import type { Translations } from 'src/Types';

import './LeftDrawer.css';

interface LeftDrawerProps {

  i18n: Translations;

  open: boolean;

}

export const LeftDrawer = (props: LeftDrawerProps) => {

  const transition = useTransition([props.open], {
    from: { flexBasis: 0, opacity: 0 },
    enter: { flexBasis: 280, opacity: 1 },
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
        <FilterPanel i18n={props.i18n} />
      </aside>
    </animated.div>
  ))

}