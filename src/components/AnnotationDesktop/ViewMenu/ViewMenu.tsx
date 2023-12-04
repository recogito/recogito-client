import { useState } from 'react';
import { Chats, StackSimple, X } from '@phosphor-icons/react';
import { useTransition, animated } from '@react-spring/web'
import { Avatar } from '@components/Avatar';
import { isMe } from '@recogito/annotorious-supabase';
import type { Annotation, DrawingStyle, PresentUser } from '@annotorious/react';
import type { Layer, Policies, Translations } from 'src/Types';
import { ViewMenuPanel } from './ViewMenuPanel';
import { AnnotationList } from '../AnnotationList';
import { LayersPanel } from '../LayersPanel';
import { DocumentNotes, DocumentNotesList, DocumentNotesMenuIcon } from '../DocumentNotes';
import type { PostgrestError } from '@supabase/supabase-js';

import './ViewMenu.css';

interface ViewMenuProps {

  i18n: Translations;

  present: PresentUser[];

  policies?: Policies;

  layers?: Layer[];

  channel: string;

  defaultLayer?: string;

  sorting?: ((a: Annotation, b: Annotation) => number);

  tagVocabulary?: string[];

  onChangePanel(panel: ViewMenuPanel | undefined): void;

  beforeSelectAnnotation(a?: Annotation): void;

  onChangeAnnotationStyle(fn: ((a: Annotation) => DrawingStyle)): void;

}

export const ViewMenu = (props: ViewMenuProps) => {

  const { t } = props.i18n;

  const me = props.present.find(isMe)!;

  const [panel, _setPanel] = useState<ViewMenuPanel | undefined>();

  const headerTransition = useTransition([panel], {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 140 },
    leave: { opacity: 0, width: 0 }, 
    config: {
      duration: 125
    }
  });

  const panelTransition = useTransition([panel], {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }, 
    config: {
      duration: 100
    }
  });

  const setPanel = (p: ViewMenuPanel | undefined) => {
    _setPanel(p);
    props.onChangePanel(p);
  }

  const togglePanel = (p: ViewMenuPanel) =>
    panel === p ? setPanel(undefined) : setPanel(p);

  const onError = (error: Error | PostgrestError) => {
    console.error(error);
    // TODO UI feedback
  }

  return (
    <div 
      className="anno-sidebar-container"
      data-collapsed={panel ? undefined : 'true'}>

      <DocumentNotes
        channelId={props.channel}
        layerId={props.defaultLayer}
        present={props.present}
        onError={onError}>

        <div 
          className="anno-menubar anno-desktop-overlay view-menu">
          <section>
            <button 
              className={panel === ViewMenuPanel.ANNOTATIONS ? 'active' : undefined}
              aria-label={t['Show annotation list']}
              onClick={() => togglePanel(ViewMenuPanel.ANNOTATIONS)}>
              <Chats />
            </button>

            <button
              className={panel === ViewMenuPanel.LAYERS ? 'active' : undefined}
              aria-label={t['Show annotation filter and color configuration']}
              onClick={() => togglePanel(ViewMenuPanel.LAYERS)}>
              <StackSimple />
            </button>

            <DocumentNotesMenuIcon
              i18n={props.i18n}
              active={panel === ViewMenuPanel.DOCUMENT_NOTES}
              onSelect={() => togglePanel(ViewMenuPanel.DOCUMENT_NOTES)} />
          </section>

          {me && (
            <section>
              <Avatar 
                id={me.id}
                name={me.appearance.label}
                color={me.appearance.color} 
                avatar={me.appearance.avatar} />
            </section>
          )}

          {headerTransition((style, panel) => panel && (
            <animated.section className="close" style={style}>
              <button onClick={() => setPanel(undefined)}>
                <X />
              </button>
            </animated.section>
          ))}
        </div>

        {panelTransition((style, panel) => panel && (
          <animated.aside style={style}>
            {panel === ViewMenuPanel.ANNOTATIONS ? (
              <AnnotationList 
                i18n={props.i18n}
                present={props.present} 
                me={me}
                policies={props.policies}
                sorting={props.sorting}
                tagVocabulary={props.tagVocabulary}
                beforeSelect={props.beforeSelectAnnotation} />
            ) : panel === ViewMenuPanel.LAYERS ? (
              <LayersPanel
                i18n={props.i18n}
                layers={props.layers}
                present={props.present}
                onChange={props.onChangeAnnotationStyle} />
            ) : panel === ViewMenuPanel.DOCUMENT_NOTES ? props.defaultLayer && (
              <DocumentNotesList 
                i18n={props.i18n}
                present={props.present}
                policies={props.policies} 
                tagVocabulary={props.tagVocabulary} />
            ) : undefined}
          </animated.aside>
        ))}
        
      </DocumentNotes>
    </div>
  )

}