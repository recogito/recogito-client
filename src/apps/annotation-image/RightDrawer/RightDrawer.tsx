import { useEffect, useState } from 'react';
import { Chats, Note } from '@phosphor-icons/react';
import { animated, easings, useTransition } from '@react-spring/web';
import type { DrawingStyleExpression, ImageAnnotation, PresentUser } from '@annotorious/react';
import { isMe } from '@recogito/annotorious-supabase';
import { AnnotationList, DocumentNotesList } from '@components/AnnotationDesktop';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import type { DocumentLayer, Policies, Translations } from 'src/Types';

import './RightDrawer.css';

interface RightDrawerProps {

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  open: boolean;

  policies?: Policies;

  present: PresentUser[];

  style?: DrawingStyleExpression<ImageAnnotation>;

  tagVocabulary?: string[];

  beforeSelectAnnotation(a?: ImageAnnotation): void;

  onTabChanged?(tab: 'ANNOTATIONS' | 'NOTES'): void;

}

export const RightDrawer = (props: RightDrawerProps) => {

  const { t } = props.i18n;

  const me = props.present.find(isMe)!;

  const transition = useTransition([props.open], {
    from: { transform: 'translateX(180px)', opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: 'translateX(180px)', opacity: 0 },
    config: {
      duration: 180,
      easing: easings.easeInOutCubic
    }
  });

  const [tab, setTab] = useState<'ANNOTATIONS' | 'NOTES'>('ANNOTATIONS');

  const { filter } = useFilter();

  useEffect(() => {
    if (props.onTabChanged)
      props.onTabChanged(tab);
  }, [tab]);

  return transition((style, open) => open && (
    <animated.div 
      className="anno-drawer ia-drawer ia-right-drawer"
      style={style}>
      <aside>
        <div className="tablist">
          <ul>
            <li 
              className={tab === 'ANNOTATIONS' ? 'active' : undefined}>
              <button onClick={() => setTab('ANNOTATIONS')}>
                <Chats size={18} /> {t['Annotations']}
              </button>
            </li>

            <li 
              className={tab === 'NOTES' ? 'active' : undefined}>
              <button onClick={() => setTab('NOTES')}>
                <Note size={18} /> {t['Notes']}
              </button>
            </li>
          </ul>
        </div>

        <div className="tabcontent">
          {tab === 'ANNOTATIONS' ? (
            <AnnotationList 
              currentStyle={props.style}
              filter={filter}
              i18n={props.i18n}
              present={props.present} 
              layers={props.layers}
              layerNames={props.layerNames}
              me={me}
              policies={props.policies}
              tagVocabulary={props.tagVocabulary}
              beforeSelect={props.beforeSelectAnnotation} />
          ) : (
            <DocumentNotesList 
              i18n={props.i18n}
              layers={props.layers}
              layerNames={props.layerNames}
              present={props.present}
              policies={props.policies} 
              tagVocabulary={props.tagVocabulary} />
          )}
        </div>
      </aside>
    </animated.div>
  ))

}