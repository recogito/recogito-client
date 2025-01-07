import type { Canvas } from '@allmaps/iiif-parser';
import type { PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';

interface IIIFThumnailProps {

  activeUsers?: PresentUser[]
  
  canvas: Canvas;

  i18n: Translations;

}

export const IIIFThumbnail = (props: IIIFThumnailProps) => {

  const { t } = props.i18n; 

  // For now, just slice at 10
  const activeUsers = (props.activeUsers || []).slice(0, 10);

  const { uri } = props.canvas.image;

  const src = `${uri.endsWith('/') ? uri : `${uri}/`}full/240,/0/default.jpg`;

  return (
    <div className="thumbnail-wrapper">
      <div className="thumbnail">
        <img src={src} />

        {(activeUsers.length > 0) && (
          <ul className="source-activity">
            {activeUsers.map(p => (
              <li 
                title={p.name || t['Anonymous']} 
                key={p.presenceKey} 
                style={{ backgroundColor: p.appearance.color}}>
                <span>{p.name || t['Anonymous']}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}
