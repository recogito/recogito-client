import { useEffect, useState } from 'react';
import { Faders, Files } from '@phosphor-icons/react';
import type { Canvas } from '@allmaps/iiif-parser';
import type { PresentUser } from '@annotorious/react';
import { animated, useTransition, easings } from '@react-spring/web';
import { IIIFThumbnailStrip } from '../IIIF';
import type { DocumentLayer, Translations } from 'src/Types';
import { FilterPanel } from '@components/AnnotationDesktop/FilterPanel';

import './LeftDrawer.css';

interface LeftDrawerProps {

  currentImage?: string;

  i18n: Translations;

  iiifCanvases: Canvas[];

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  open: boolean;
  
  present: PresentUser[];

  onChangeImage(url: string): void;

}

export const LeftDrawer = (props: LeftDrawerProps) => {

  const { t } = props.i18n;

  const [tab, setTab] = useState<'FILTERS' | 'PAGES'>('FILTERS');

  useEffect(() => {
    if (!props.open && props.iiifCanvases.length > 0)
      setTab('PAGES');
  }, [props.iiifCanvases]);

  const transition = useTransition([props.open], {
    from: { transform: 'translateX(-140px)', opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: 'translateX(-140px)', opacity: 0 },
    config: {
      duration: 180,
      easing: easings.easeInOutCubic
    }
  });

  return transition((style, open) => open && (
    <animated.div 
      className="anno-drawer ia-drawer ia-left-drawer"
      style={style}>
      <aside>
        {props.iiifCanvases.length > 1 && (
          <div className="tablist">
            <ul>
              <li 
                className={tab === 'FILTERS' ? 'active' : undefined}>
                <button onClick={() => setTab('FILTERS')}>
                  <Faders size={18} /> {t['Filters']}
                </button>
              </li>

              <li 
                className={tab === 'PAGES' ? 'active' : undefined}>
                <button onClick={() => setTab('PAGES')}>
                  <Files size={18} /> {t['Pages']}
                </button>
              </li>
            </ul>
          </div>
        )}

        <div className="tabcontent">
          {tab === 'FILTERS' ? (
            <FilterPanel 
              i18n={props.i18n} 
              layers={props.layers}
              layerNames={props.layerNames}
              present={props.present} />
          ) : (
            <IIIFThumbnailStrip 
              canvases={props.iiifCanvases} 
              currentImage={props.currentImage}
              i18n={props.i18n}
              onSelect={props.onChangeImage} />
          )}
        </div>
      </aside>
    </animated.div> 
  ))

}