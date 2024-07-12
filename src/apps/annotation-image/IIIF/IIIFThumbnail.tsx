import type { Canvas } from '@allmaps/iiif-parser';

interface IIIFThumnailProps {
  
  canvas: Canvas;

}

export const IIIFThumbnail = (props: IIIFThumnailProps) => {

  const src = `${props.canvas.image.uri}/full/120,/0/default.jpg`;

  return (
    <div className="thumbnail-wrapper">
      <div className="thumbnail">
        <img src={src} />
      </div>
    </div>
  )

}
