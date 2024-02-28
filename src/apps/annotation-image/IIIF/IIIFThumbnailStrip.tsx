import type { Resource, Sequence } from 'manifesto.js';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { IIIFThumbnail } from './IIIFThumbnail';

import './IIIFThumbnailStrip.css';

interface IIIFThumbnailStripProps {

  currentImage?: string;

  sequence?: Sequence;

  onClick(resource: Resource): void;

}

interface Thumbnail {

  resource: Resource;

  label: string | null;

}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {

  const thumbnails = props.sequence ? props.sequence.getCanvases().reduce<Thumbnail[]>((all, canvas) => {
    return [...all, ...canvas.getImages().map(i => ({ label: canvas.getLabel().getValue(), resource: i.getResource() }))];
  }, []) : [];

  const isSelected = (resource: Resource) => resource.id === props.currentImage;

  const Row = ({ index, style }: { index: number, style: React.CSSProperties}) => {   
    const { resource, label } = thumbnails[index];

    return (
      <div 
        className={`thumbnail-strip-item${isSelected(resource) ? ' selected': ''}`} 
        style={style} 
        onClick={() => props.onClick(resource)}>
        <IIIFThumbnail image={resource} />
        <span className="label">{label}</span>
      </div>
    )
  }

  return (
    <AutoSizer className="ia-thumbnail-strip">
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          itemCount={thumbnails.length}
          width={width}
          itemSize={170}>
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  )

}