import type { Resource, Sequence } from 'manifesto.js';
import { animated } from '@react-spring/web';
import { useDrawerTransition, type DrawerPanel } from '@components/AnnotationDesktop';
import { IIIFThumbnailStrip } from '../IIIF';

import './LeftDrawer.css';

interface LeftDrawerProps {

  currentImage?: string;

  currentPanel?: DrawerPanel;

  iiifSequence?: Sequence;

  onChangeImage(url: string): void;

}

export const LeftDrawer = (props: LeftDrawerProps) => {

  const drawerTransition = useDrawerTransition(props.currentPanel, {
    from: { transform: 'translateX(-75px)', opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: 'translateX(-75px)', opacity: 0 },
    config: {
      duration: 120
    }
  });

  return drawerTransition((style, panel) => panel && (
    <animated.div 
      className="ia-drawer ia-left-drawer"
      style={style}>
      <aside>
        <IIIFThumbnailStrip 
          currentImage={props.currentImage}
          sequence={props.iiifSequence} 
          onSelect={props.onChangeImage} />
      </aside>
    </animated.div> 
  ))

}