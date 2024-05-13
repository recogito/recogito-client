import { useRef, useState } from 'react';
import { Chats, Note } from '@phosphor-icons/react';
import { animated, easings, useSpring, useTransition } from '@react-spring/web';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
import type { Annotation, PresentUser } from '@annotorious/react';
import { isMe } from '@recogito/annotorious-supabase';
import { AnnotationList, DocumentNotesList } from '@components/AnnotationDesktop';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import type { DocumentLayer, Policies, Translations } from 'src/Types';

import './RightDrawer.css';

interface RightDrawerProps {

  i18n: Translations;

  layers?: DocumentLayer[];

  open: boolean;

  policies?: Policies;

  present: PresentUser[];

  sorting?: ((a: PDFAnnotation, b: PDFAnnotation) => number);

  style?: HighlightStyleExpression;

  tagVocabulary?: string[];

  beforeSelectAnnotation(a?: Annotation): void;

}

export const RightDrawer = (props: RightDrawerProps) => {

  const me = props.present.find(isMe)!;

  const { filter } = useFilter();

  const [tab, setTab] = useState<'ANNOTATIONS' | 'NOTES'>('ANNOTATIONS');

  // Is defined **after** the component mounts
  const el = useRef<HTMLDivElement>(null);

  const spacerAnimation = useSpring({
    from: { flexGrow: props.open ? 1 : 0 },
    to: { flexGrow: props.open ? 0 : 1 },
    immediate: !el.current, // Immediate animation on first run only
    config: {
      duration: 450,
      easing: easings.easeInOutCubic
    }
  });

  const drawerTransition = useTransition([props.open], {
    from: { flexBasis: 0, flexGrow: 0, opacity: 0 },
    enter: { flexBasis: 340, flexGrow: 1, opacity: 1 },
    leave: { flexBasis: 0, flexGrow: 0, opacity: 0 },
    config: {
      duration: 450,
      easing: easings.easeInOutCubic
    }
  });

  return ( 
    <>
      <animated.div 
        ref={el}
        style={spacerAnimation} 
        className="spacer" />

      {drawerTransition((style, open) => open && (
        <animated.div 
          className="anno-drawer ta-drawer ta-right-drawer"
          style={style}>
          <aside>
            <div className="tablist">
              <ul>
                <li 
                  className={tab === 'ANNOTATIONS' ? 'active' : undefined}>
                  <button onClick={() => setTab('ANNOTATIONS')}>
                    <Chats size={18} /> Annotations
                  </button>
                </li>

                <li 
                  className={tab === 'NOTES' ? 'active' : undefined}>
                  <button onClick={() => setTab('NOTES')}>
                    <Note size={18} /> Notes
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
                  layers={props.layers}
                  me={me}
                  policies={props.policies}
                  present={props.present} 
                  sorting={props.sorting}
                  tagVocabulary={props.tagVocabulary}
                  beforeSelect={props.beforeSelectAnnotation} />
                ) : (
                  <DocumentNotesList 
                    i18n={props.i18n}
                    present={props.present}
                    policies={props.policies} 
                    tagVocabulary={props.tagVocabulary} />
                )}
            </div>
          </aside>
        </animated.div>
      ))}
    </>
  )

}