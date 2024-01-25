import { useEffect, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web'
import { isMe } from '@recogito/annotorious-supabase';
import type { Annotation, DrawingStyle, PresentUser } from '@annotorious/react';
import type { Layer, Policies, Translations } from 'src/Types';
import { RightDrawerPanel } from './RightDrawerPanel';
import { AnnotationList } from '../AnnotationList';
import { LayerConfigurationPanel } from '../LayerConfiguration';
import { DocumentNotesList } from '../DocumentNotes';

import './RightDrawer.css';

interface RightDrawerProps {

  i18n: Translations;

  present: PresentUser[];

  currentPanel?: RightDrawerPanel;

  policies?: Policies;

  sorting?: ((a: Annotation, b: Annotation) => number);

  layers?: Layer[];

  tagVocabulary?: string[];

  beforeSelectAnnotation(a?: Annotation): void;

  onChangeAnnotationFilter(fn: ((a: Annotation) => boolean)): void;

  onChangeAnnotationStyle(fn: ((a: Annotation) => DrawingStyle)): void;

}

export const RightDrawer = (props: RightDrawerProps) => {

  // We need to keep the current panel until exit transition is done
  const previous = useRef<RightDrawerPanel | undefined>();

  const me = props.present.find(isMe)!;

  const shouldAnimate = 
    // Drawer closed, and should open
    !previous.current && props.currentPanel ||
    // Drawer open, and should close
    previous.current && !props.currentPanel;

  const drawerTransition = useTransition([props.currentPanel], {
    from: { transform: 'translateX(180px)', opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: 'translateX(180px)', opacity: 0 },
    config: {
      duration: shouldAnimate ? 120 : 0
    }
  });

  useEffect(() => {
    previous.current = props.currentPanel;
  }, [props.currentPanel])

  return drawerTransition((style, panel) => panel && (
    <animated.div
      style={style}
      className="ia-drawer ia-right-drawer">

      <aside>
        {panel === RightDrawerPanel.ANNOTATIONS ? (
          <AnnotationList 
            i18n={props.i18n}
            present={props.present} 
            me={me}
            policies={props.policies}
            sorting={props.sorting}
            tagVocabulary={props.tagVocabulary}
            beforeSelect={props.beforeSelectAnnotation} />
        ) : panel === RightDrawerPanel.LAYERS ? (
          <LayerConfigurationPanel
            i18n={props.i18n}
            layers={props.layers}
            present={props.present}
            onChangeStyle={props.onChangeAnnotationStyle} 
            onChangeFilter={props.onChangeAnnotationFilter} />
        ) : panel === RightDrawerPanel.DOCUMENT_NOTES ? props.layers && (
          <DocumentNotesList 
            i18n={props.i18n}
            present={props.present}
            policies={props.policies} 
            tagVocabulary={props.tagVocabulary} />
        ) : undefined}
      </aside>
    </animated.div>
  ))

}