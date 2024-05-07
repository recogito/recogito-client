import { useEffect, useRef } from 'react';
import { animated, easings, useSpring, useTransition } from '@react-spring/web';
import type { TextAnnotation } from '@recogito/react-text-annotator';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
import type { Annotation, DrawingStyle, PresentUser } from '@annotorious/react';
import { isMe } from '@recogito/annotorious-supabase';
import { AnnotationList, DocumentNotesList, LayerConfigurationPanel, DrawerPanel } from '@components/AnnotationDesktop';
import type { Layer, Policies, Translations } from 'src/Types';

import './RightDrawer.css';

interface RightDrawerProps {

  i18n: Translations;

  present: PresentUser[];

  currentPanel?: DrawerPanel;

  policies?: Policies;

  sorting?: ((a: PDFAnnotation, b: PDFAnnotation) => number);

  layers?: Layer[];

  style?: (a: TextAnnotation) => DrawingStyle;

  tagVocabulary?: string[];

  beforeSelectAnnotation(a?: Annotation): void;

  onChangeAnnotationFilter(fn: ((a: Annotation) => boolean)): void;

  onChangeAnnotationStyle(fn: ((a: Annotation) => DrawingStyle)): void;

}

export const RightDrawer = (props: RightDrawerProps) => {

  const previous = useRef<DrawerPanel | undefined>();

  const me = props.present.find(isMe)!;

  const shouldAnimate = 
    // Drawer currently closed, and should open
    !previous.current && props.currentPanel ||
    // Drawer currently open, and should close
    previous.current && !props.currentPanel;

  const spacerAnimation = useSpring({
    from: { flexGrow: props.currentPanel ? 1 : 0 },
    to: { flexGrow: props.currentPanel ? 0 : 1 },
    config: {
      duration: shouldAnimate ? 450 : 0,
      easing: easings.easeInOutCubic
    }
  });

  const drawerTransition = useTransition([props.currentPanel], {
    from: { flexBasis: 0, flexGrow: 0, opacity: 0 },
    enter: { flexBasis: 340, flexGrow: 1, opacity: 1 },
    leave: { flexBasis: 0, flexGrow: 0, opacity: 0 },
    config: {
      duration: shouldAnimate ? 450 : 0,
      easing: easings.easeInOutCubic
    }
  });

  useEffect(() => {
    previous.current = props.currentPanel;
  }, [props.currentPanel]);

  return ( 
    <>
      <animated.div style={spacerAnimation} className="spacer" />

      {drawerTransition((style, panel) => panel && (
        <animated.div 
          className="ta-drawer ta-right-drawer"
          style={style}>
          <aside>
            {panel === DrawerPanel.ANNOTATIONS ? (
              <AnnotationList 
                currentStyle={props.style}
                i18n={props.i18n}
                layers={props.layers}
                me={me}
                policies={props.policies}
                present={props.present} 
                sorting={props.sorting}
                tagVocabulary={props.tagVocabulary}
                beforeSelect={props.beforeSelectAnnotation} />
            ) : panel === DrawerPanel.LAYERS ? (
              <LayerConfigurationPanel
                i18n={props.i18n}
                layers={props.layers}
                present={props.present}
                onChangeStyle={props.onChangeAnnotationStyle} 
                onChangeFilter={props.onChangeAnnotationFilter} />
            ) : panel === DrawerPanel.DOCUMENT_NOTES ? props.layers && (
              <DocumentNotesList 
                i18n={props.i18n}
                present={props.present}
                policies={props.policies} 
                tagVocabulary={props.tagVocabulary} />
            ) : undefined}
          </aside>
        </animated.div>
      ))}
    </>
  )

}