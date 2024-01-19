import type { PresentUser, User } from '@annotorious/react';
import { Avatar } from '@components/Avatar';
import { Timestamp } from '@components/Timestamp';
import type { Translations } from 'src/Types';

import './Creator.css';

interface CreatorProps {

  i18n: Translations;

  creator?: User | PresentUser;

  createdAt?: Date;

}

export const Creator = (props: CreatorProps) => {

  const { creator, createdAt } = props;

  const { t, lang } = props.i18n;
  
  const isAnonymous = !creator?.name || creator.isGuest;

  return (
    <div className="annotation-creator">
      {isAnonymous ? (
        <>
          {creator && 'appearance' in creator && (
            <Avatar
              id={creator.id}
              name={creator.appearance.label}
              avatar={creator.appearance.avatar} />
          )}
          
          <div className="annotation-created-by">
            <address className="anonymous">
              {creator && 'appearance' in creator ? (
                creator.appearance.label
              ) : (
                t['Anonymous']
              )}
            </address> 

            <div className="annotation-created-at">
              {createdAt && (
                <Timestamp datetime={createdAt} locale={lang} />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <Avatar
            id={creator.id}
            name={creator.name}
            avatar={creator.avatar} />

          <div className="annotation-created-by">
            <address>
              {creator.name}
            </address>

            <div className="annotation-created-at">
              {createdAt && (
                <Timestamp datetime={createdAt} locale={lang} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )

}