import { useMemo, useState } from 'react';
import { Annotation } from '@components/Annotation';
import { AnnotationDesktop } from '@components/AnnotationDesktop';
import { createAppearenceProvider } from '@components/Presence';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import type { DocumentInTaggedContext, Layer, Policies, Translations } from 'src/Types';
import { Toolpanel } from '../Toolpanel';
import { 
  AnnotoriousOpenSeadragonAnnotator, 
  DrawingStyle, 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonPopup, 
  OpenSeadragonViewer, 
  PointerSelectAction, 
  PresentUser, 
  useAnnotator 
} from '@annotorious/react';

const SUPABASE: string = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY: string = import.meta.env.PUBLIC_SUPABASE_API_KEY;

interface AnnotatedImageProps {

  channelId: string;

  defaultLayer?: Layer;

  document: DocumentInTaggedContext;

  filter?: (a: ImageAnnotation) => boolean;

  i18n: Translations;

  layers?: Layer[];

  policies: Policies;

  present: PresentUser[];

  style?: (a: ImageAnnotation) => DrawingStyle;

  tagVocabulary: string[];

  usePopup: boolean;

  onChangePresent(present: PresentUser[]): void;

  onConnectError(): void;

  onLoad(): void;

}

export const AnnotatedImage = (props: AnnotatedImageProps) => {

  const { i18n, policies, present, tagVocabulary } = props;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const [tool, setTool] = useState<string>('rectangle');

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const appearance = useMemo(() => createAppearenceProvider(), []);

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: props.document.meta_data?.url,
    gestureSettingsMouse: {
      clickToZoom: false
    },
    showNavigationControl: false,
    crossOriginPolicy: 'Anonymous'
  }), [props.document.meta_data?.url]);

  const selectAction = (annotation: ImageAnnotation) => {
    // Annotation targets are editable for creators and admins
    const me = anno?.getUser()?.id;

    const canEdit = annotation.target.creator?.id === me ||
      policies.get('layers').has('INSERT');

    return canEdit ? PointerSelectAction.EDIT : PointerSelectAction.SELECT;
  }

  const onChangeTool = (tool: string | null) => {
    if (tool) {
      if (!drawingEnabled) setDrawingEnabled(true);
      setTool(tool);
    } else {
      setDrawingEnabled(false);
    }
  }

  return (
    <OpenSeadragonAnnotator
      autoSave
      drawingEnabled={drawingEnabled}
      pointerSelectAction={selectAction}
      tool={tool} 
      filter={props.filter}
      style={props.style}>
  
      <AnnotationDesktop.UndoStack 
        undoEmpty={true} />

      {props.layers && 
        <SupabasePlugin
          supabaseUrl={SUPABASE}
          apiKey={SUPABASE_API_KEY} 
          channel={props.channelId}
          defaultLayer={props.defaultLayer?.id} 
          layerIds={props.layers.map(layer => layer.id)}
          appearanceProvider={appearance}
          onInitialLoad={props.onLoad}
          onPresence={props.onChangePresent} 
          onConnectError={props.onConnectError}
          privacyMode={privacy === 'PRIVATE'} />
      }

      <OpenSeadragonViewer
        className="ia-osd-container"
        options={options} />

      {props.usePopup && (
        <OpenSeadragonPopup
          popup ={props => (
            <Annotation.Popup 
              {...props} 
              i18n={i18n}
              policies={policies}
              present={present} 
              tagVocabulary={tagVocabulary} /> )} />
      )}

      <Toolpanel 
        i18n={i18n}
        isAdmin={policies.get('layers').has('INSERT')}
        privacy={privacy}
        onChangeTool={onChangeTool} 
        onChangePrivacy={setPrivacy} />
    </OpenSeadragonAnnotator>
  )

}