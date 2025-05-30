import { Chats } from '@phosphor-icons/react';
import { animated, easings, useTransition } from '@react-spring/web';
import type { DrawingStyleExpression, ImageAnnotation, PresentUser } from '@annotorious/react';
import { isMe, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel';
import { AnnotationList, DocumentNotesList, DocumentNotesTabButton } from '@components/AnnotationDesktop';
import type { DocumentLayer, Policies, Translations, VocabularyTerm } from 'src/Types';

import './RightDrawer.css';

interface RightDrawerProps {

  i18n: Translations;

  isLocked: boolean;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  open: boolean;

  policies?: Policies;

  present: PresentUser[];

  style?: DrawingStyleExpression<ImageAnnotation>;

  tagVocabulary?: VocabularyTerm[];

  beforeSelectAnnotation(a?: ImageAnnotation): void;

  onNavigateTo(annotation: SupabaseAnnotation): void;

  onTabChanged(tab: 'ANNOTATIONS' | 'NOTES'): void;

  tab: 'ANNOTATIONS' | 'NOTES';
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

  const { filter } = useFilter();

  return transition((style, open) => open && (
    <animated.div 
      className="anno-drawer ia-drawer ia-right-drawer"
      style={style}>
      <aside>
        <div className="tablist">
          <ul>
            <li 
              className={props.tab === 'ANNOTATIONS' ? 'active' : undefined}>
              <button onClick={() => props.onTabChanged('ANNOTATIONS')}>
                <Chats size={18} /> {t['Annotations']}
              </button>
            </li>

            <li 
              className={props.tab === 'NOTES' ? 'active' : undefined}>
              <DocumentNotesTabButton
                i18n={props.i18n}
                onClick={() => props.onTabChanged('NOTES')} />
            </li>
          </ul>
        </div>

        <div className="tabcontent">
          {props.tab === 'ANNOTATIONS' ? (
            <AnnotationList 
              currentStyle={props.style}
              filter={filter}
              i18n={props.i18n}
              isProjectLocked={props.isLocked}
              present={props.present} 
              layers={props.layers}
              layerNames={props.layerNames}
              me={me}
              policies={props.policies}
              tagVocabulary={props.tagVocabulary}
              beforeSelect={props.beforeSelectAnnotation} 
              onNavigateTo={props.onNavigateTo}/>
          ) : (
            <DocumentNotesList 
              i18n={props.i18n}
              isProjectLocked={props.isLocked}
              layers={props.layers}
              layerNames={props.layerNames}
              present={props.present}
              policies={props.policies} 
              tagVocabulary={props.tagVocabulary} 
              onNavigateTo={props.onNavigateTo} />
          )}
        </div>
      </aside>
    </animated.div>
  ))

}