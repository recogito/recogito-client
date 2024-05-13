import { isMe } from '@recogito/annotorious-supabase';
import type { DrawingStyleExpression, ImageAnnotation, PresentUser } from '@annotorious/react';
import { Avatar } from '@components/Avatar';
import { Extension, usePlugins } from '@components/Plugins';
import { PresenceStack } from '@components/Presence';
import type { DocumentWithContext, Translations } from 'src/Types';
import { ErrorBadge } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { 
  ArrowsOutSimple,
  CaretLeft, 
  GraduationCap, 
  MagnifyingGlassMinus, 
  MagnifyingGlassPlus, 
} from '@phosphor-icons/react';

interface ToolbarProps {

  document: DocumentWithContext;

  i18n: Translations;

  leftDrawerOpen: boolean;

  present: PresentUser[];

  privacy: PrivacyMode;

  rightDrawerOpen: boolean;

  showConnectionError: boolean;

  onChangePrivacy(mode: PrivacyMode): void;

  onChangeStyle(style?: DrawingStyleExpression<ImageAnnotation>): void;

  onToggleBranding(): void;

  onToggleLeftDrawer(): void;

  onToggleRightDrawer(): void;

  onZoom(factor: number): void;

}

export const Toolbar = (props: ToolbarProps) => {

  const { t } = props.i18n;
  
  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const back = contextName ? 
    `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
    `/${props.i18n.lang}/projects/${project_id}`;

  const me = props.present.find(isMe)!;

  const plugins = usePlugins('annotation.image.toolbar');

  return (
    <div className="anno-toolbar ia-toolbar not-annotatable">
      <div className="anno-toolbar-slot anno-toolbar-slotleft">
        <div className="anno-toolbar-group">
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

        <div className="anno-toolbar-divider" />

        {/* <div>
          <button onClick={toggleLeftDrawer}>
            <ListBullets size={17} />
          </button>
        </div> */}

        {(props.showConnectionError) && (
          <ErrorBadge i18n={props.i18n} />
        )}
      </div>

      <div className="anno-toolbar-right ia-toolbar-right">
        <div className="anno-toolbar-section">
          <button onClick={() => props.onZoom(2)}>
            <MagnifyingGlassPlus size={18} />
          </button>

          <button onClick={() => props.onZoom(0.5)}>
            <MagnifyingGlassMinus size={18} />
          </button>
        </div>

        <div className="anno-toolbar-divider" />

        {props.present.length > 1 && (
          <>
            <div className="anno-toolbar-section anno-toolbar-presence">
              <PresenceStack present={props.present} />
            </div>

            <div className="anno-toolbar-divider" />
          </>
        )}

        {plugins.map(plugin => (
          <Extension 
            key={plugin.meta.id}
            plugin={plugin} 
            document={props.document}
            extensionPoint="annotation.image.toolbar" />
        ))}

        {plugins.length > 0 && (
          <div className="anno-toolbar-divider" />
        )}

        {/* <div className="anno-menubar-section anno-menubar-actions-right">
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
        </div> */}

        <div className="anno-toolbar-divider" />

        <div className="anno-toolbar-section">
          <button onClick={props.onToggleBranding}>
            <ArrowsOutSimple size={17} />
          </button>
        </div>

        {me && (
          <div className="anno-toolbar-me">
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