import { useEffect } from 'react';
import type { Color, PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useExtensions } from '@recogito/studio-sdk';
import { ExtensionMount } from '@components/Plugins';
import { PresenceStack } from '@components/Presence';
import type {
  DocumentLayer,
  DocumentWithContext,
  Policies,
  Translations,
  VocabularyTerm,
} from 'src/Types';
import {
  ColorCodingSelector,
  ColorLegend,
  DeleteSelected,
  ErrorBadge,
  useCollapsibleToolbar,
  useColorCoding,
} from '@components/AnnotationDesktop';
import { PrivacySelector, type PrivacyMode } from '@components/PrivacySelector';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import { Polygon, Rectangle } from './Icons';
import { MoreTools } from './MoreTools';
import {
  Chats,
  Cursor,
  FunnelSimple,
  GraduationCap,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from '@phosphor-icons/react';

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

  tagVocabulary?: VocabularyTerm[];

  tool?: string;

  onChangePrivacy(mode: PrivacyMode): void;

  onChangeStyle(style?: (a: SupabaseAnnotation) => Color): void;

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

  const extensions = useExtensions('annotation.image.toolbar');

  const colorCoding = useColorCoding();

  const { ref, collapsed } = useCollapsibleToolbar();

  useEffect(() => {
    if (colorCoding?.style) props.onChangeStyle(colorCoding.style);
    else props.onChangeStyle();
  }, [colorCoding]);

  return (
    <div ref={ref} className='anno-toolbar ia-toolbar not-annotatable'>
      <div className='anno-toolbar-slot anno-toolbar-slot-left'>
        <div className='anno-toolbar-group'>
          <div className='with-notification'>
            <button
              className={props.leftDrawerOpen ? 'active' : undefined}
              onClick={props.onToggleLeftDrawer}
              aria-label={t['open or close the filters tab']}
            >
              <FunnelSimple size={18} />
            </button>

            {numConditions > 0 && (
              <span className='notification-bubble'>
                <span>{numConditions}</span>
              </span>
            )}
          </div>
        </div>

        <div className='anno-toolbar-group anno-toolbar-title'>
          {contextName ? (
            <>
              <GraduationCap size={18} />

              <h1>
                <a href={back} title={t['Back to assignment overview']}>
                  <div>{contextName}</div>
                </a>
                <span>/</span>
                <div className='document-title in-assignment'>
                  {props.document.name}
                </div>
              </h1>
            </>
          ) : (
            <h1>
              <div className='document-title'>{props.document.name}</div>
            </h1>
          )}
        </div>

        {props.showConnectionError && <ErrorBadge i18n={props.i18n} />}
      </div>

      <div
        className={`anno-toolbar-slot anno-toolbar-slot-center${
          collapsed ? ' collapsed' : ''
        }`}
      >
        {!props.isLocked && (
          <>
            {!collapsed && (
              <>
                <PrivacySelector
                  mode={props.privacy}
                  i18n={props.i18n}
                  onChangeMode={props.onChangePrivacy}
                />

                <div className='anno-toolbar-divider' />
              </>
            )}

            <button
              className={props.tool === undefined ? 'active' : undefined}
              aria-label={t['Pan and zoom the image, select annotations']}
              onClick={() => props.onChangeTool(undefined)}
            >
              <Cursor size={18} />
            </button>

            <button
              className={props.tool === 'rectangle' ? 'active' : undefined}
              aria-label={t['Create rectangle annotations']}
              onClick={() => props.onChangeTool('rectangle')}
            >
              <Rectangle />
            </button>

            <button
              className={props.tool === 'polygon' ? 'active' : undefined}
              aria-label={t['Create polygon annotations']}
              onClick={() => props.onChangeTool('polygon')}
            >
              <Polygon />
            </button>

            <div className='anno-toolbar-divider' />
          </>
        )}

        <button onClick={() => props.onZoom(2)} aria-label={t['zoom in']}>
          <MagnifyingGlassPlus size={18} />
        </button>

        <button onClick={() => props.onZoom(0.5)}>
          <MagnifyingGlassMinus size={18} aria-label={t['zoom out']} />
        </button>

        {!props.isLocked && (
          <DeleteSelected
            activeLayer={props.layers?.find((l) => l.is_active)}
            i18n={props.i18n}
            policies={props.policies}
          />
        )}

        {collapsed && (
          <MoreTools
            document={props.document}
            i18n={props.i18n}
            layers={props.layers}
            layerNames={props.layerNames}
            present={props.present}
            privacy={props.privacy}
            tagVocabulary={props.tagVocabulary}
            onChangePrivacy={props.onChangePrivacy}
          />
        )}

        <div className='anno-toolbar-divider' />

        {!collapsed && (
          <>
            <ColorCodingSelector
              document={props.document}
              i18n={props.i18n}
              present={props.present}
              layers={props.layers}
              layerNames={props.layerNames}
              tagVocabulary={props.tagVocabulary}
            />

            <ColorLegend i18n={props.i18n} />
          </>
        )}
      </div>

      <div className='anno-toolbar-slot anno-toobar-slot-right ia-toolbar-right'>
        {props.present.length > 1 && (
          <>
            <div className='anno-toolbar-section anno-toolbar-presence'>
              <PresenceStack present={props.present} />
            </div>

            <div className='anno-toolbar-divider' />
          </>
        )}

        {extensions.map(({ extension, config }) => (
          <ExtensionMount
            key={extension.name}
            extension={extension}
            pluginConfig={config}
            settings={config.settings.plugin_settings}
            document={props.document}
          />
        ))}

        {extensions.length > 0 && <div className='anno-toolbar-divider' />}

        <button
          className={props.rightDrawerOpen ? 'active' : undefined}
          aria-label={t['Show annotation list']}
          onClick={props.onToggleRightDrawer}
        >
          <Chats size={17} />
        </button>
      </div>
    </div>
  );
};
