import { ArrowsOutSimple, CaretLeft, Chats, GraduationCap, ListBullets } from '@phosphor-icons/react';
import type { PresentUser } from '@annotorious/react';
import { isMe } from '@recogito/annotorious-supabase';
import { DocumentNotesMenuIcon, LayersPanelMenuIcon, RightDrawerPanel } from '@components/AnnotationDesktop';
import { Avatar } from '@components/Avatar';
import { PresenceStack } from '@components/Presence';
import type { DocumentInTaggedContext, Translations } from 'src/Types';

import './Menubar.css';

interface MenubarProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  present: PresentUser[];

  rightPanel?: RightDrawerPanel;

  onToggleBranding(): void;

  onSetRightDrawer(panel?: RightDrawerPanel): void;

}

export const Menubar = (props: MenubarProps) => {

  const { t } = props.i18n;

  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;
  
  const back = contextName ? 
    `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
    `/${props.i18n.lang}/projects/${project_id}`;

  const me = props.present.find(isMe)!;

  const toggleRightDrawer = (panel: RightDrawerPanel) => {
    if (panel === props.rightPanel)
      props.onSetRightDrawer();
    else
     props.onSetRightDrawer(panel);
  } 

  return (
    <div className="anno-menubar ta-menubar">
      <div className="anno-menubar-left ta-menubar-left">
        {contextName ? (
          <>
            <a 
              href={back} 
              className="assignment-icon"
              title={t['Back to assignment overview']}>
              <GraduationCap size={20} />
            </a>

            <h1>
              <a href={back}>{contextName}</a> / <span>{props.document.name}</span>
            </h1>
          </>
        ) : (
          <>
            <a 
              href={back} 
              className="back-to-project"
              title={t['Back to project overview']}>
              <CaretLeft size={20} />
            </a>

            <h1>
              <span>{props.document.name}</span>
            </h1>
          </>
        )}

        <div className="anno-desktop-overlay-divider" />

        <div>
          <button>
            <ListBullets size={17} />
          </button>
        </div>
      </div>

      <div className="anno-menubar-right ta-menubar-right">  
        {props.present.length > 1 && (
          <>
            <div className="anno-desktop-overlay-divider" />
          
            <div className="anno-menubar-section anno-menubar-presence">
              <PresenceStack present={props.present} />
            </div>
          </>
        )}

        <div className="anno-desktop-overlay-divider" />

        <div className="anno-menubar-section anno-menubar-actions-right">
          <button
            className={props.rightPanel === RightDrawerPanel.ANNOTATIONS ? 'active' : undefined}
            aria-label={t['Show annotation list']}
            onClick={() => toggleRightDrawer(RightDrawerPanel.ANNOTATIONS)}>
            <Chats size={17} />
          </button>

          <LayersPanelMenuIcon
            i18n={props.i18n}
            active={props.rightPanel === RightDrawerPanel.LAYERS}
            onSelect={() => toggleRightDrawer(RightDrawerPanel.LAYERS)} />

          <DocumentNotesMenuIcon
            i18n={props.i18n}
            active={props.rightPanel === RightDrawerPanel.DOCUMENT_NOTES}
            onSelect={() => toggleRightDrawer(RightDrawerPanel.DOCUMENT_NOTES)} />
        </div>

        <div className="anno-desktop-overlay-divider" />

        <div className="anno-menubar-section">
          <button onClick={props.onToggleBranding}>
            <ArrowsOutSimple size={17} />
          </button>
        </div>

        {me && (
          <div className="anno-menubar-me">
            <Avatar 
              id={me.id}
              name={me.appearance.label}
              color={me.appearance.color} 
              avatar={me.appearance.avatar} />
          </div>
        )}
      </div>
    </div>
  )

}