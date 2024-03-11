import type { Resource } from 'manifesto.js';

interface IIIFThumnailProps {
  
  image: Resource;

}

export const IIIFThumbnail = (props: IIIFThumnailProps) => {

  const src = `${props.image.getServices()[0].id}/full/120,/0/default.jpg`;

  return (
    <div className="thumbnail-wrapper">
      <div className="thumbnail">
        <img src={src} />
      </div>
    </div>
  )

}
