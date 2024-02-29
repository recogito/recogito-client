import type { Resource, Sequence } from 'manifesto.js';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { IIIFThumbnail } from './IIIFThumbnail';

import './IIIFThumbnailStrip.css';
import { getImageManifestURL } from './useIIIF';

interface IIIFThumbnailStripProps {

  currentImage?: string;

  sequence?: Sequence;

  onSelect(url: string): void;

}

interface Thumbnail {

  resource: Resource;

  label: string | null;

}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {

  const thumbnails = props.sequence ? props.sequence.getCanvases().reduce<Thumbnail[]>((all, canvas) => {
    return [...all, ...canvas.getImages().map(i => ({ label: canvas.getLabel().getValue(), resource: i.getResource() }))];
  }, []) : [];

  const isSelected = (resource: Resource) =>
    getImageManifestURL(resource) === props.currentImage;

  const Row = ({ index, style }: { index: number, style: React.CSSProperties}) => {   
    const { resource, label } = thumbnails[index];

    return (
      <div 
        className={`thumbnail-strip-item${isSelected(resource) ? ' selected': ''}`} 
        style={style} 
        onClick={() => props.onSelect(getImageManifestURL(resource))}>
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