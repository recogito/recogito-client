import TimeAgo from 'timeago-react';
import type { User } from '@annotorious/react';
import { Avatar } from '@components/Avatar';

import './BodyHeader.css';

interface BodyHeaderProps {

  creator?: User;

  createdAt?: Date;

}

export const BodyHeader = (props: BodyHeaderProps) => {

  const { creator, createdAt } = props;

  const isGuest = !creator || creator.isGuest;

  return (
    <div className="annotation-body-header">
      {creator && (
        <Avatar
          id={creator.id}
          name={creator.name}
          avatar={creator.avatar} />
      )}

      <div>
        {isGuest ? (
          <div className="guest">Guest</div> 
        ) : (
          <address>
            {creator.name}
          </address>
        )}

        <div className="annotation-body-created-at">
          {createdAt && (
            <TimeAgo datetime={createdAt} />
          )}
        </div>
      </div>
    </div>
  )

}