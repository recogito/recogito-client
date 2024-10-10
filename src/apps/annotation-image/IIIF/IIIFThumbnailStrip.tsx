import type { Canvas } from '@allmaps/iiif-parser';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { IIIFThumbnail } from './IIIFThumbnail';
import type { ActiveUsers } from './useMultiPagePresence';
import { getCanvasLabel } from 'src/util';
import type { Translations } from 'src/Types';

import './IIIFThumbnailStrip.css';

interface IIIFThumbnailStripProps {

  activeUsers: ActiveUsers;

  canvases: Canvas[];

  currentImage?: string;

  i18n: Translations;

  onSelect(url: string): void;

}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {

  const isSelected = (canvas: Canvas) => props.currentImage?.startsWith(canvas.image.uri);

  const Row = ({ index, style }: { index: number, style: React.CSSProperties}) => {   
    const canvas = props.canvases[index];

    const source = `${canvas.image.uri}/info.json`;

    const label = getCanvasLabel(canvas.label, props.i18n.lang);
    
    return (
      <div 
        className={`thumbnail-strip-item${isSelected(canvas) ? ' selected': ''}`} 
        style={style} 
        onClick={() => props.onSelect(source)}>
        <IIIFThumbnail 
          activeUsers={props.activeUsers[source]}
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