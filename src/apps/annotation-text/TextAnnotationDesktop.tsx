import { useState } from 'react';
import { Annotorious, SupabasePlugin } from '@annotorious/react';
import type { PresentUser } from '@annotorious/react';
import { TextAnnotator, TextAnnotatorPopup } from '@recogito/react-text-annotator';
import type { Document, Layer, Translations } from 'src/Types';
import { PresenceStack, createAppearenceProvider } from '@components/Presence';
import { Annotation } from '@components/Annotation';

import './TextAnnotationDesktop.css';

import '@recogito/react-text-annotator/dist/react-text-annotator.css';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface TextAnnotationDesktopProps {

  i18n: Translations;

  document: Document;

  layers: Layer[];

  channelId: string;

}

export const TextAnnotationDesktop = (props: TextAnnotationDesktopProps) => {

  const { i18n } = props;

  const [present, setPresent] = useState<PresentUser[]>([]);

  return (
    <div className="anno-desktop ta-desktop">
      <Annotorious>
        <TextAnnotator 
          element="annotatable" 
          presence={{
            font: "500 12px Inter, Arial, Helvetica, sans-serif"
          }} />

        <SupabasePlugin 
          base={SUPABASE}
          apiKey={SUPABASE_API_KEY} 
          channel={props.channelId}
          layerId={props.layers[0].id} 
          appearanceProvider={createAppearenceProvider()}
          onPresence={setPresent} />

        <Annotation.LifecycleLogger />

        <TextAnnotatorPopup
          popup={props => (
            <Annotation.Popup 
              {...props} 
              present={present} 
              i18n={i18n} />
          )} />

        <div className="anno-desktop-right">
          <PresenceStack present={present} />
        </div>

        <div className="anno-desktop-bottom">
          
        </div>
      </Annotorious>
    </div>
  )

}