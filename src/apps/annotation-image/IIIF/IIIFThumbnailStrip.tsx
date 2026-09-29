import type { CozyCanvas } from 'cozy-iiif';
import { List, type RowComponentProps } from 'react-window';
import { IIIFThumbnail } from './IIIFThumbnail';
import type { ActiveUsers } from './useMultiPagePresence';
import { useTranslation } from 'react-i18next';

import './IIIFThumbnailStrip.css';

interface IIIFThumbnailStripProps {

  activeUsers: ActiveUsers;

  canvases: CozyCanvas[];

  currentCanvas?: CozyCanvas;

  onSelect(canvas: CozyCanvas): void;
}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {
  const { i18n } = useTranslation([]);

  const isSelected = (canvas: CozyCanvas) =>
    props.currentCanvas?.id === canvas.id;

  const Row = (arg: RowComponentProps<{ canvases: CozyCanvas[]}>) => {
    const canvas = props.canvases[arg.index];
    const label = canvas.getLabel(i18n.language);

    return (
      <div
        className={`thumbnail-strip-item${isSelected(canvas) ? ' selected': ''}`}
        style={arg.style}
        onClick={() => props.onSelect(canvas)}>
        <IIIFThumbnail
          activeUsers={props.activeUsers[canvas.id]}
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
