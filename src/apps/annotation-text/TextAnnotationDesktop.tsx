import { useState } from 'react';
import { Annotorious, SupabasePlugin } from '@annotorious/react';
import type { PresentUser } from '@annotorious/react';
import { TextAnnotator } from '@recogito/react-text-annotator';
import type { Document, Layer, Translations } from 'src/Types';
import { createAppearenceProvider } from '@components/Presence';

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

  const [present, setPresent] = useState<PresentUser[]>([]);

  return (
    <div className="anno-desktop ta-desktop">
      <Annotorious>
        <TextAnnotator element="annotatable" />

        <SupabasePlugin 
          base={SUPABASE}
          apiKey={SUPABASE_API_KEY} 
          channel={props.channelId}
          layerId={props.layers[0].id} 
          appearanceProvider={createAppearenceProvider()}
          onPresence={setPresent} />

        <div className="anno-desktop-bottom">
          
        </div>
      </Annotorious>
    </div>
  )

}