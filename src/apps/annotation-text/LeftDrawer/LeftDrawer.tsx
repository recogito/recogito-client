import { DocumentMetadata } from '@components/AnnotationDesktop/DocumentMetadata';
import { Faders, ListBullets } from '@phosphor-icons/react';
import { animated, easings, useTransition } from '@react-spring/web';
import type { PresentUser } from '@annotorious/react';
import { FilterPanel } from '@components/AnnotationDesktop/FilterPanel';
import { useState } from 'react';
import type { Document, Layer, MyProfile, Translations } from 'src/Types';
import './LeftDrawer.css';

interface LeftDrawerProps {
  document: Document;

  i18n: Translations;

  layers?: Layer[];

  me: MyProfile;

  layerNames: Map<string, string>;

  open: boolean;

  present: PresentUser[];

  onError(error: string): void;

  onUpdated(document: Document): void;
}

export const LeftDrawer = (props: LeftDrawerProps) => {
  const [tab, setTab] = useState<'FILTERS' | 'METADATA'>('FILTERS');

  const { t } = props.i18n;

  const transition = useTransition([props.open], {
    from: { flexBasis: 0, opacity: 0 },
    enter: { flexBasis: 280, opacity: 1 },
    leave: { flexBasis: 0, opacity: 0 },
    config: {
      duration: 350,
      easing: easings.easeInOutCubic,
    },
  });

  return transition(
    (style, open) =>
      open && (
        <animated.div
          style={style}
          className={
            props.open
              ? 'anno-drawer ta-drawer ta-left-drawer open'
              : 'anno-drawer ta-drawer ta-left-drawer'
          }
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
              {tab === 'METADATA' && (
                <DocumentMetadata
                  allowEdit={props.document.created_by === props.me.id}
                  document={props.document}
                  i18n={props.i18n}
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
