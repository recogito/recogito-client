import { isMe } from '@recogito/annotorious-supabase';
import type { PresentUser } from '@annotorious/react';
import { Avatar } from '@components/Avatar';
import { PresenceStack } from '@components/Presence';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { DocumentNotesMenuIcon, LayersPanelMenuIcon, DrawerPanel, ErrorBadge } from '@components/AnnotationDesktop';
import { 
  ArrowsOutSimple,
  CaretLeft, 
  Chats, 
  GraduationCap, 
  ListBullets, 
  MagnifyingGlassMinus, 
  MagnifyingGlassPlus, 
} from '@phosphor-icons/react';

interface MenubarProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  present: PresentUser[];

  leftPanel?: DrawerPanel;

  rightPanel?: DrawerPanel;

  onZoom(factor: number): void;

  onToggleBranding(): void;

  onSetLeftDrawer(panel?: DrawerPanel): void;

  onSetRightDrawer(panel?: DrawerPanel): void;

  showConnectionError: boolean;

}

export const Menubar = (props: MenubarProps) => {

  const { t } = props.i18n;
  
  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const back = contextName ? 
    `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
    `/${props.i18n.lang}/projects/${project_id}`;

  const me = props.present.find(isMe)!;

  const toggleLeftDrawer = () => {
    if (props.leftPanel)
      props.onSetLeftDrawer();
    else
      props.onSetLeftDrawer(DrawerPanel.TABLE_OF_CONTENTS);
  }

  const toggleRightDrawer = (panel: DrawerPanel) => {
    if (panel === props.rightPanel)
      props.onSetRightDrawer();
    else
     props.onSetRightDrawer(panel);
  } 

  return (
    <div className="anno-menubar ia-menubar not-annotatable">
      <div className="anno-menubar-left ia-menubar-left">
        <div className="anno-menubar-section anno-menubar-title">
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
        </div>

        <div className="anno-desktop-overlay-divider" />

        <div>
          <button onClick={toggleLeftDrawer}>
            <ListBullets size={17} />
          </button>
        </div>

        {(props.showConnectionError) && (
          <ErrorBadge i18n={props.i18n} />
        )}
      </div>

      <div className="anno-menubar-right ia-menubar-right">
        <div className="anno-menubar-section">
          <button onClick={() => props.onZoom(2)}>
            <MagnifyingGlassPlus size={18} />
          </button>

          <button onClick={() => props.onZoom(0.5)}>
            <MagnifyingGlassMinus size={18} />
          </button>
        </div>

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
            className={props.rightPanel === DrawerPanel.ANNOTATIONS ? 'active' : undefined}
            aria-label={t['Show annotation list']}
            onClick={() => toggleRightDrawer(DrawerPanel.ANNOTATIONS)}>
            <Chats size={17} />
          </button>

          <LayersPanelMenuIcon
            i18n={props.i18n}
            active={props.rightPanel === DrawerPanel.LAYERS}
            onSelect={() => toggleRightDrawer(DrawerPanel.LAYERS)} />

          <DocumentNotesMenuIcon
            i18n={props.i18n}
            active={props.rightPanel === DrawerPanel.DOCUMENT_NOTES}
            onSelect={() => toggleRightDrawer(DrawerPanel.DOCUMENT_NOTES)} />
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