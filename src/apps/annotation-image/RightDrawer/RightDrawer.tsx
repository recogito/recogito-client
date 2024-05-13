import { animated } from '@react-spring/web';
import type { Annotation, AnnotationState, DrawingStyle, ImageAnnotation, PresentUser } from '@annotorious/react';
import { isMe } from '@recogito/annotorious-supabase';
import { useDrawerTransition, AnnotationList, DocumentNotesList, LayerConfigurationPanel, DrawerPanel } from '@components/AnnotationDesktop';
import type { Layer, Policies, Translations } from 'src/Types';

import './RightDrawer.css';

interface RightDrawerProps {

  i18n: Translations;

  present: PresentUser[];

  currentPanel?: DrawerPanel;

  policies?: Policies;

  layers?: Layer[];

  style?: (a: ImageAnnotation, state: AnnotationState) => DrawingStyle;

  tagVocabulary?: string[];

  beforeSelectAnnotation(a?: ImageAnnotation): void;

  onChangeAnnotationFilter(fn: ((a: Annotation) => boolean)): void;

  onChangeAnnotationStyle(fn: ((a: Annotation) => DrawingStyle)): void;

}

export const RightDrawer = (props: RightDrawerProps) => {

  const me = props.present.find(isMe)!;

  /*
  const drawerTransition = useDrawerTransition(props.currentPanel, {
    from: { transform: 'translateX(180px)', opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: 'translateX(180px)', opacity: 0 },
    config: {
      duration: 120
    }
  });
  */

  // return drawerTransition((style, panel) => panel && (
  //   <animated.div 
  return (
    <div
      className="ia-drawer ia-right-drawer"
      style={style}>
      <aside>
        {panel === DrawerPanel.ANNOTATIONS ? (
          <AnnotationList 
            currentStyle={props.style}
            i18n={props.i18n}
            present={props.present} 
            layers={props.layers}
            me={me}
            policies={props.policies}
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
    </div>
  ))

}