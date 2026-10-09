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

interface RowProps {

  activeUsers: ActiveUsers;

  canvases: CozyCanvas[];

  currentCanvasId?: string;

  language: string;

  onSelect(canvas: CozyCanvas): void;

}

const Row = (props: RowComponentProps<RowProps>) => {
  const canvas = props.canvases[props.index];
  const label = canvas.getLabel(props.language);
  const isSelected = props.currentCanvasId === canvas.id;

  return (
    <div
      className={`thumbnail-strip-item${isSelected ? ' selected': ''}`}
      style={props.style}
      onClick={() => props.onSelect(canvas)}>
      <IIIFThumbnail
        activeUsers={props.activeUsers[canvas.id]}
        canvas={canvas}
      />
      <span className="label">{label}</span>
    </div>
  )
}

export const IIIFThumbnailStrip = (props: IIIFThumbnailStripProps) => {
  const { i18n } = useTranslation([]);

  return (
    <List
      className="ia-thumbnail-strip"
      rowComponent={Row}
      rowCount={props.canvases.length}
      rowHeight={170}
      rowProps={{
        activeUsers: props.activeUsers,
        canvases: props.canvases,
        currentCanvasId: props.currentCanvas?.id,
        language: i18n.language,
        onSelect: props.onSelect
      }}
    />
  )

}
