import type { Resource } from 'manifesto.js';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { IIIFThumbnail } from './IIIFThumbnail';

import './IIIFThumbnailStrip.css';

interface IIIFThumbnailStripProps {

  images?: Resource[];

  onClick(resource: Resource): void;

}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {

  const Row = ({ index, style }: { index: number, style: React.CSSProperties}) => {   
    const resource = props.images![index];

    return (
      <div style={style} onClick={() => props.onClick(resource)}>
        <IIIFThumbnail image={resource} />
      </div>
    )
  }

  return (
    <AutoSizer className="ia-thumbnail-strip">
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          itemCount={props.images ? props.images.length : 0}
          width={width}
          itemSize={140}>
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  )

}