import { useEffect } from 'react';
import { Chats, FunnelSimple, GraduationCap } from '@phosphor-icons/react';
import type { Color, PresentUser } from '@annotorious/react';
import { ColorCodingSelector, DeleteSelected, ColorLegend, ErrorBadge, useColorCoding, useFilter, useCollapsibleToolbar } from '@components/AnnotationDesktop';
import { Extension, usePlugins } from '@components/Plugins';
import { PresenceStack } from '@components/Presence';
import { type PrivacyMode, PrivacySelector } from '@components/PrivacySelector';
import { PDFControls } from './PDFControls';
import type { DocumentLayer, DocumentWithContext, Policies, Translations, VocabularyTerm } from 'src/Types';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { MoreTools } from './MoreTools';

interface ToolbarProps {

  document: DocumentWithContext;

  i18n: Translations;

  isLocked: boolean;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  leftDrawerOpen: boolean;

  policies?: Policies;

  present: PresentUser[];

  privacy: PrivacyMode;

  rightDrawerOpen: boolean;

  showConnectionError: boolean;

  tagVocabulary: VocabularyTerm[];

  onChangePrivacy(mode: PrivacyMode): void;

  onChangeStyle(style?: (a: SupabaseAnnotation) => Color): void;

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

  const { ref, collapsed } = useCollapsibleToolbar();

  useEffect(() => {
    if (colorCoding?.style)
      props.onChangeStyle(colorCoding.style);
    else
      props.onChangeStyle();
  }, [colorCoding]);

  return (
    <div
      ref={ref}
      className="anno-toolbar ta-toolbar">
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

        <div className="anno-toolbar-group anno-toolbar-title">
          {contextName ? (
            <>
              <GraduationCap size={18} />

              <h1>
                <a 
                  href={back} 
                  title={t['Back to assignment overview']}>
                  <div>{contextName}</div>
                </a>
                <span>/</span>
                <div className="document-title in-assignment">{props.document.name}</div>
              </h1>
            </>
          ) : (
            <h1>
              <div className="document-title">{props.document.name}</div>
            </h1>
          )}
        </div>

        {props.showConnectionError && (
          <ErrorBadge i18n={props.i18n} />
        )}
      </div>

      <div className={`anno-toolbar-slot anno-toolbar-slot-center${collapsed? ' collapsed': ''}`}>     
        {!props.isLocked && (
          <PrivacySelector
            mode={props.privacy}
            i18n={props.i18n}
            onChangeMode={props.onChangePrivacy} />
        )}

        {!collapsed && (
          <div className="anno-toolbar-divider" />
        )}

        {(isPDF && !collapsed) && (
          <div className="anno-toolbar-group">
            <PDFControls i18n={props.i18n} />
          </div>
        )}

        {!props.isLocked && (
          <DeleteSelected
            activeLayer={props.layers?.find(l => l.is_active)}
            i18n={props.i18n}
            policies={props.policies} />
        )}

        {!collapsed && (
          <>
            <div className="anno-toolbar-divider" />

            <ColorCodingSelector 
              document={props.document}
              i18n={props.i18n} 
              present={props.present} 
              layers={props.layers}
              layerNames={props.layerNames} 
              tagVocabulary={props.tagVocabulary} />

            <ColorLegend 
              i18n={props.i18n} />
          </>
        )}
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

        {collapsed ? (
          <MoreTools
            document={props.document}
            i18n={props.i18n}
            isPDF={isPDF} 
            layers={props.layers}
            layerNames={props.layerNames}
            present={props.present}
            tagVocabulary={props.tagVocabulary} />
        ) : (
          <div className="anno-toolbar-divider" />
        )}

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