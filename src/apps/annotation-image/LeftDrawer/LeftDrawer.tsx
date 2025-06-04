import { DocumentMetadata } from '@components/AnnotationDesktop/DocumentMetadata';
import { useEffect, useState } from 'react';
import { Faders, Files, ListBullets } from '@phosphor-icons/react';
import type { Canvas } from '@allmaps/iiif-parser';
import type { PresentUser } from '@annotorious/react';
import { animated, useTransition, easings } from '@react-spring/web';
import { FilterPanel } from '@components/AnnotationDesktop';
import { IIIFThumbnailStrip, type IIIFImage } from '../IIIF';
import type { ActiveUsers } from '../IIIF/useMultiPagePresence';
import type {
  DocumentWithContext,
  IIIFMetadata,
  Layer,
  MyProfile,
  Translations,
} from 'src/Types';

import './LeftDrawer.css';

interface LeftDrawerProps {
  activeUsers: ActiveUsers;

  currentImage?: IIIFImage;

  document: DocumentWithContext;

  i18n: Translations;

  iiifCanvases: Canvas[];

  layers?: Layer[];

  layerNames: Map<string, string>;

  me: MyProfile;

  metadata?: IIIFMetadata[];

  open: boolean;

  present: PresentUser[];

  onChangeImage(image: IIIFImage): void;

  onError(error: string): void;

  onUpdated(document: DocumentWithContext): void;
}

export const LeftDrawer = (props: LeftDrawerProps) => {
  const { t } = props.i18n;

  const [tab, setTab] = useState<'FILTERS' | 'PAGES' | 'METADATA'>('FILTERS');

  useEffect(() => {
    if (!props.open && props.iiifCanvases.length > 1) setTab('PAGES');
  }, [props.iiifCanvases]);

  const transition = useTransition([props.open], {
    from: { transform: 'translateX(-140px)', opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: 'translateX(-140px)', opacity: 0 },
    config: {
      duration: 180,
      easing: easings.easeInOutCubic,
    },
  });

  return transition(
    (style, open) =>
      open && (
        <animated.div
          className='anno-drawer ia-drawer ia-left-drawer'
          style={style}
        >
          <aside>
            <div className='tablist'>
              <ul>
                <li className={tab === 'FILTERS' ? 'active' : undefined}>
                  <button
                    onClick={() => setTab('FILTERS')}
                    aria-label={t['open or close the filters tab']}
                  >
                    <Faders size={18} /> {t['Filters']}
                  </button>
                </li>

                {props.iiifCanvases.length > 1 && (
                  <li className={tab === 'PAGES' ? 'active' : undefined}>
                    <button
                      onClick={() => setTab('PAGES')}
                      aria-label={t['open or close the pages tab']}
                    >
                      <Files size={18} /> {t['Pages']}
                    </button>
                  </li>
                )}

                <li className={tab === 'METADATA' ? 'active' : undefined}>
                  <button
                    onClick={() => setTab('METADATA')}
                    aria-label={t['open or close the metadata tab']}
                  >
                    <ListBullets size={18} /> {t['Metadata']}
                  </button>
                </li>
              </ul>
            </div>

            <div className='tabcontent'>
              {tab === 'FILTERS' && (
                <FilterPanel
                  i18n={props.i18n}
                  layers={props.layers}
                  layerNames={props.layerNames}
                  present={props.present}
                />
              )}
              {tab === 'PAGES' && (
                <IIIFThumbnailStrip
                  activeUsers={props.activeUsers}
                  canvases={props.iiifCanvases}
                  currentImage={props.currentImage}
                  i18n={props.i18n}
                  onSelect={props.onChangeImage}
                />
              )}
              {tab === 'METADATA' && (
                <DocumentMetadata
                  allowEdit={props.document.created_by === props.me.id}
                  document={props.document}
                  i18n={props.i18n}
                  metadata={props.metadata}
                  onError={props.onError}
                  onUpdated={props.onUpdated}
                />
              )}
            </div>
          </aside>
        </animated.div>
      )
  );
};
