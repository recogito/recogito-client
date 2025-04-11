import type { Canvas } from '@allmaps/iiif-parser';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { IIIFThumbnail } from './IIIFThumbnail';
import type { IIIFImage } from './useIIIF';
import type { ActiveUsers } from './useMultiPagePresence';
import { getCanvasLabel } from 'src/util';
import type { Translations } from 'src/Types';

import './IIIFThumbnailStrip.css';

interface IIIFThumbnailStripProps {

  activeUsers: ActiveUsers;

  canvases: Canvas[];

  currentImage?: IIIFImage;

  i18n: Translations;

  onSelect(image: IIIFImage): void;

}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {

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

  const Row = ({ index, style }: { index: number, style: React.CSSProperties}) => {   
    const canvas = props.canvases[index];
    const label = getCanvasLabel(canvas.label, props.i18n.lang);
    
    return (
      <div 
        className={`thumbnail-strip-item${isSelected(canvas) ? ' selected': ''}`} 
        style={style} 
        onClick={() => props.onSelect(canvas)}>
        <IIIFThumbnail
          activeUsers={props.activeUsers[canvas.uri]}
          canvas={canvas}
          i18n={props.i18n} />
        <span className="label">{label}</span>
      </div>
    )
  }

  return (
    <AutoSizer className="ia-thumbnail-strip">
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          itemCount={props.canvases.length}
          width={width}
          itemSize={170}>
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  )

}