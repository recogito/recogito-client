import { useEffect } from 'react';
import { Chats, FunnelSimple, GraduationCap } from '@phosphor-icons/react';
import type { PresentUser } from '@annotorious/react';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import { ColorCodingSelector, DeleteSelected, ColorLegend, ErrorBadge, useColorCoding, useFilter } from '@components/AnnotationDesktop';
import { Extension, usePlugins } from '@components/Plugins';
import { PresenceStack } from '@components/Presence';
import { PrivacyMode, PrivacySelector } from '@components/PrivacySelector';
import { PDFControls } from './PDFControls';
import type { DocumentLayer, DocumentWithContext, Policies, Translations } from 'src/Types';

interface ToolbarProps {

  activeLayer?: DocumentLayer;

  document: DocumentWithContext;

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  leftDrawerOpen: boolean;

  policies?: Policies;

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

  const plugins = usePlugins('annotation.text.toolbar');

  const colorCoding = useColorCoding();

  useEffect(() => {
    if (colorCoding?.style)
      props.onChangeStyle(colorCoding.style);
    else
      props.onChangeStyle();
  }, [colorCoding]);

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

        {isPDF && (
          <div className="anno-toolbar-group">
            <PDFControls i18n={props.i18n} />
            <div className="anno-toolbar-divider" />
          </div>
        )}

        <DeleteSelected
          activeLayer={props.activeLayer}
          i18n={props.i18n}
          policies={props.policies} />

        <ColorCodingSelector 
          i18n={props.i18n} 
          present={props.present} 
          layers={props.layers}
          layerNames={props.layerNames} />

        <ColorLegend 
          i18n={props.i18n} />
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