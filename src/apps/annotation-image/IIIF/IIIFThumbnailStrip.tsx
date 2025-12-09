import type { Canvas } from '@allmaps/iiif-parser';
import { List, type RowComponentProps } from 'react-window';
import { IIIFThumbnail } from './IIIFThumbnail';
import type { IIIFImage } from './useIIIF';
import type { ActiveUsers } from './useMultiPagePresence';
import { getResourceLabel } from 'src/util';
import { useTranslation } from 'react-i18next';

import './IIIFThumbnailStrip.css';

interface IIIFThumbnailStripProps {

  activeUsers: ActiveUsers;

  canvases: Canvas[];

  currentImage?: IIIFImage;

  onSelect(image: IIIFImage): void;
}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {
  const { i18n } = useTranslation([]);

  const isSelected = (canvas: Canvas) => {
    if (!props.currentImage) return false;

    // Shouldn't ever be the case, unless we want to start
    // showing a thumbnail strip for a (single) Image API image
    // at some point.
    if (typeof props.currentImage === 'string') {
      return props.currentImage?.startsWith(canvas.image.uri);
    } else {
      return props.currentImage.uri === canvas.uri;
    }
  }

  const Row = (arg: RowComponentProps<{ canvases: Canvas[]}>) => {   
    const canvas = props.canvases[arg.index];
    const label = getResourceLabel(canvas.label, i18n.language);
    
    return (
      <div 
        className={`thumbnail-strip-item${isSelected(canvas) ? ' selected': ''}`} 
        style={arg.style} 
        onClick={() => props.onSelect(canvas)}>
        <IIIFThumbnail
          activeUsers={props.activeUsers[canvas.uri]}
          canvas={canvas}
        />
        <span className="label">{label}</span>
      </div>
    )
  }

  return (
    <List
      className="ia-thumbnail-strip"
      rowComponent={Row}
      rowCount={props.canvases.length}
      rowHeight={170}
      rowProps={{ canvases: props.canvases }}
    />
  )

}