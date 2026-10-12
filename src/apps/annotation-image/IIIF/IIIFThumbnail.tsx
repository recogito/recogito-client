import type { CozyCanvas } from 'cozy-iiif';
import type { PresentUser } from '@annotorious/react';
import { useTranslation } from 'react-i18next';

interface IIIFThumnailProps {
  activeUsers?: PresentUser[];

  canvas: CozyCanvas;
}

export const IIIFThumbnail = (props: IIIFThumnailProps) => {
  const { t } = useTranslation(['annotation-common']);

  // For now, just slice at 10
  const activeUsers = (props.activeUsers || []).slice(0, 10);

  const src = props.canvas.getThumbnailURL(240);

  return (
    <div className='thumbnail-wrapper'>
      <div className='thumbnail'>
        <img src={src} />

        {activeUsers.length > 0 && (
          <ul className='source-activity'>
            {activeUsers.map((p) => (
              <li
                title={p.name || t('Anonymous', { ns: 'annotation-common' })}
                key={p.presenceKey}
                style={{ backgroundColor: p.appearance.color }}
              >
                <span>
                  {p.name || t('Anonymous', { ns: 'annotation-common' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
