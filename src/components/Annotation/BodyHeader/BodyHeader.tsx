import TimeAgo from 'timeago-react';
import type { PresentUser, User } from '@annotorious/react';
import { Avatar } from '@components/Avatar';

import './BodyHeader.css';

interface BodyHeaderProps {

  creator?: User | PresentUser;

  createdAt?: Date;

}

export const BodyHeader = (props: BodyHeaderProps) => {

  const { creator, createdAt } = props;

  const isAnonymous = !creator?.name || creator.isGuest;

  return (
    <div className="annotation-body-header">
      {isAnonymous ? (
        <>
           {creator && 'appearance' in creator && (
            <Avatar
              id={creator.id}
              name={creator.appearance.label}
              avatar={creator.appearance.avatar} />
          )}
          
          <div className="annotation-body-created">
            <div className="anonymous">
              {creator && 'appearance' in creator ? (
                creator.appearance.label
              ) : (
                'Anonymous'
              )}
            </div> 

            <div className="annotation-body-created-at">
              {createdAt && (
                <TimeAgo datetime={createdAt} />
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

          <div>
            <address>
              {creator.name}
            </address>

            <div className="annotation-body-created-at">
              {createdAt && (
                <TimeAgo datetime={createdAt} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )

}