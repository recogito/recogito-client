import { useState } from 'react';
import type { Document, Layer, Translations } from 'src/Types';
import { Popup } from './Popup';
import { Toolbar } from './Toolbar';
import { PresenceStack } from '@components/PresenceStack';
import {
  Annotorious, 
  OpenSeadragonAnnotator,
  OpenSeadragonPopup,
  OpenSeadragonViewer,
  PresentUser,
  SupabasePlugin
} from '@annotorious/react';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;
const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

const IIIF_SAMPLE = {
  "@context" : "http://iiif.io/api/image/2/context.json",
  "protocol" : "http://iiif.io/api/image",
  "width" : 7808,
  "height" : 5941,
  "sizes" : [
     { "width" : 244, "height" : 185 },
     { "width" : 488, "height" : 371 },
     { "width" : 976, "height" : 742 }
  ],
  "tiles" : [
     { "width" : 256, "height" : 256, "scaleFactors" : [ 1, 2, 4, 8, 16, 32 ] }
  ],
  "@id" : "https://iiif.bodleian.ox.ac.uk/iiif/image/af315e66-6a85-445b-9e26-012f729fc49c",
  "profile" : [
     "http://iiif.io/api/image/2/level2.json",
     { "formats" : [ "jpg", "png", "webp" ],
       "qualities" : ["native","color","gray","bitonal"],
       "supports" : ["regionByPct","regionSquare","sizeByForcedWh","sizeByWh","sizeAboveFull","sizeUpscaling","rotationBy90s","mirroring"],
       "maxWidth" : 1000,
       "maxHeight" : 1000
     }
  ]
};

const OSD_OPTIONS = {
  prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@3.1/build/openseadragon/images/',
  tileSources: IIIF_SAMPLE,
  gestureSettingsMouse: {
    clickToZoom: false
  }, 
  showNavigationControl: false
}

import './ImageAnnotationDesktop.css';

export interface ImageAnnotationDesktopProps {

  i18n: Translations;

  document: Document;

  layers: Layer[];

  channelId: string;

}

export const ImageAnnotationDesktop = (props: ImageAnnotationDesktopProps) => {

  const [tool, setTool] = useState<string | null>(null);

  const [present, setPresent] = useState<PresentUser[]>([]);

  return (
    <div className="anno-desktop ia-desktop">
      <Annotorious>
        <OpenSeadragonAnnotator tool={tool} keepEnabled={true}>
          <SupabasePlugin 
            base={SUPABASE}
            apiKey={SUPABASE_API_KEY} 
            channel={props.channelId}
            layerId={props.layers[0].id} 
            onPresence={setPresent} />

          <OpenSeadragonViewer
            className="ia-osd-container"
            options={OSD_OPTIONS} />

          <OpenSeadragonPopup
            popup ={props => <Popup {...props} />} />

          <div className="anno-desktop-right">
            <PresenceStack present={present} />
          </div>

          <div className="anno-desktop-bottom">
            <Toolbar onChangeTool={setTool}/>
          </div>
        </OpenSeadragonAnnotator>
      </Annotorious>
    </div>
  )

}