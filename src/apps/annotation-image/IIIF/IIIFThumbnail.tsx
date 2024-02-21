import type { Resource } from 'manifesto.js';

interface IIIFThumnailProps {
  
  image: Resource;

}

export const IIIFThumbnail = (props: IIIFThumnailProps) => {

  return (
    <div className="thumbnail-wrapper">
      <div className="thumbnail">
        <img src={`${props.image.id}/full/120,/0/default.jpg`} />
      </div>
    </div>
  )

}
