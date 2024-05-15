import { useEffect } from 'react';
import { isMe } from '@recogito/annotorious-supabase';
import type { DrawingStyleExpression, ImageAnnotation, PresentUser } from '@annotorious/react';
import { Avatar } from '@components/Avatar';
import { Extension, usePlugins } from '@components/Plugins';
import { PresenceStack } from '@components/Presence';
import type { DocumentLayer, DocumentWithContext, Translations } from 'src/Types';
import { ColorCodingSelector, ColorLegend, ErrorBadge, useColorCoding } from '@components/AnnotationDesktop';
import { PrivacySelector, type PrivacyMode } from '@components/PrivacySelector';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import { Polygon, Rectangle } from './Icons';
import { 
  Chats, 
  Cursor, 
  FunnelSimple, 
  GraduationCap, 
  MagnifyingGlassMinus, 
  MagnifyingGlassPlus
} from '@phosphor-icons/react';

interface ToolbarProps {

  document: DocumentWithContext;

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  leftDrawerOpen: boolean;

  present: PresentUser[];

  privacy: PrivacyMode;

  rightDrawerOpen: boolean;

  showConnectionError: boolean;
  
  tool?: string;

  onChangePrivacy(mode: PrivacyMode): void;

  onChangeStyle(style?: DrawingStyleExpression<ImageAnnotation>): void;

  onChangeTool(tool?: string): void;

  onToggleBranding(): void;

  onToggleLeftDrawer(): void;

  onToggleRightDrawer(): void;

  onZoom(factor: number): void;

}

export const Toolbar = (props: ToolbarProps) => {

  const { t } = props.i18n;
  
  const contextName = props.document.context.name;

  const { project_id } = props.document.context;

  const { numConditions } = useFilter();

  const back = `/${props.i18n.lang}/projects/${project_id}`;

  const me = props.present.find(isMe)!;

  const plugins = usePlugins('annotation.image.toolbar');

  const colorCoding = useColorCoding();

  useEffect(() => {
    if (colorCoding?.style)
      props.onChangeStyle(colorCoding.style as DrawingStyleExpression<ImageAnnotation>);
    else
      props.onChangeStyle();
  }, [colorCoding])

  return (
    <div className="anno-toolbar ia-toolbar not-annotatable">
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
                <GraduationCap size={20} />
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

        {(props.showConnectionError) && (
          <ErrorBadge i18n={props.i18n} />
        )}
      </div>

      <div className="anno-toolbar-slot anno-toolbar-slot-center">
        <PrivacySelector
          mode={props.privacy}
          i18n={props.i18n}
          onChangeMode={props.onChangePrivacy} />

        <div className="anno-toolbar-divider" />

        <button
          className={props.tool === undefined ? 'active' : undefined}
          aria-label={t['Pan and zoom the image, select annotations']}
          onClick={() => props.onChangeTool(undefined)}>
          <Cursor size={18} />
        </button>

        <button
          className={props.tool === 'rectangle' ? 'active' : undefined}
          aria-label={t['Create rectangle annotations']}
          onClick={() => props.onChangeTool('rectangle')}>
          <Rectangle />
        </button>

        <button
          className={props.tool === 'polygon' ? 'active' : undefined}
          aria-label={t['Create polygon annotations']}
          onClick={() => props.onChangeTool('polygon')}>
          <Polygon />
        </button>

        <div className="anno-toolbar-divider" />
        
        <button onClick={() => props.onZoom(2)}>
          <MagnifyingGlassPlus size={18} />
        </button>

        <button onClick={() => props.onZoom(0.5)}>
          <MagnifyingGlassMinus size={18} />
        </button>

        <div className="anno-toolbar-divider" />

        <ColorCodingSelector 
          i18n={props.i18n} 
          present={props.present} 
          layers={props.layers}
          layerNames={props.layerNames} />

        <ColorLegend 
          i18n={props.i18n} />
      </div>

      <div className="anno-toolbar-slot anno-toobar-slot-right ia-toolbar-right">
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