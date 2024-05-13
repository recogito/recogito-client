import { ArrowsOutSimple, Chats, FunnelSimple, GraduationCap } from '@phosphor-icons/react';
import type { Annotation, DrawingStyleExpression, PresentUser } from '@annotorious/react';
import { isMe } from '@recogito/annotorious-supabase';
import { ColorCodingSelector, ErrorBadge } from '@components/AnnotationDesktop';
import { Avatar } from '@components/Avatar';
import { Extension, usePlugins } from '@components/Plugins';
import { PresenceStack } from '@components/Presence';
import { PrivacyMode, PrivacySelector } from '@components/PrivacySelector';
import { PDFControls } from './PDFControls';
import type { DocumentWithContext, Translations } from 'src/Types';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';

interface ToolbarProps {

  document: DocumentWithContext;

  i18n: Translations;

  leftDrawerOpen: boolean;

  present: PresentUser[];

  privacy: PrivacyMode;

  rightDrawerOpen: boolean;

  showConnectionError: boolean;

  onChangePrivacy(mode: PrivacyMode): void;

  onChangeStyle(style?: HighlightStyleExpression): void;

  onToggleBranding(): void;

  onToggleLeftDrawer(): void;

  onToggleRightDrawer(): void;

}

export const Toolbar = (props: ToolbarProps) => {

  const { t } = props.i18n;

  const contextName = props.document.context.name;

  const { project_id } = props.document.context;

  const isPDF = props.document.content_type === 'application/pdf';

  const { numConditions } = useFilter();
  
  const back = `/${props.i18n.lang}/projects/${project_id}`;

  const me = props.present.find(isMe)!;

  const plugins = usePlugins('annotation.text.toolbar');

  return (
    <div className="anno-toolbar ta-toolbar">
      <div className="anno-toolbar-slot anno-toolbar-slot-left">
        <div className="anno-toolbar-group">
          <div 
            className="with-notification">
            <button 
              className={props.leftDrawerOpen ? 'active' :  undefined}
              onClick={props.onToggleLeftDrawer}>
              <FunnelSimple size={18} />
            </button>

            {numConditions > 0 && (
              <span className="notification-bubble">
                <span>{numConditions}</span>
              </span>
            )}
          </div>
        </div>

        <div className="anno-toolbar-group">
          {contextName ? (
            <h1>
              <a 
                href={back} 
                className="assignment-icon"
                title={t['Back to assignment overview']}>
                <GraduationCap size={18} />
                {contextName}
              </a>
              
              <span>/</span>
              <span>{props.document.name}</span>
            </h1>
          ) : (
            <h1>
              <span>{props.document.name}</span>
            </h1>
          )}
        </div>

        {isPDF && (
          <>
            <div className="anno-toolbar-divider" />

            <PDFControls i18n={props.i18n} />
          </>
        )}

        {props.showConnectionError && (
          <ErrorBadge i18n={props.i18n} />
        )}
      </div>

      <div className="anno-toolbar-slot anno-toolbar-slot-center">
        <PrivacySelector
          mode={props.privacy}
          i18n={props.i18n}
          onChangeMode={props.onChangePrivacy} />

        <div className="anno-toolbar-divider" />

        <ColorCodingSelector 
          i18n={props.i18n} 
          onChange={props.onChangeStyle} />
      </div>

      <div className="anno-toolbar-slot anno-toolbar-slot-right">  
        {props.present.length > 1 && (
          <>
            <div className="anno-toolbar-section anno-toolbar-presence">
              <PresenceStack present={props.present} />
            </div>

            <div className="anno-desktop-overlay-divider" />
          </>
        )}

        {me && (
          <div className="anno-toolbar-me">
            <Avatar 
              id={me.id}
              name={me.appearance.label}
              color={me.appearance.color} 
              avatar={me.appearance.avatar} />
          </div>
        )}

        <div className="anno-toolbar-divider" />

        {plugins.map(plugin => (
          <Extension 
            key={plugin.meta.id}
            plugin={plugin} 
            document={props.document}
            extensionPoint="annotation.text.toolbar" />
        ))}

        {plugins.length > 0 && (
          <div className="anno-toolbar-divider" />
        )}

        {/* <button onClick={props.onToggleBranding}>
          <ArrowsOutSimple size={17} />
        </button>

        <div className="anno-toolbar-divider" /> */}

        <button
          className={props.rightDrawerOpen ? 'active' : undefined}
          aria-label={t['Show annotation list']}
          onClick={props.onToggleRightDrawer}>
          <Chats size={17} />
        </button>
      </div>
    </div>
  )

}