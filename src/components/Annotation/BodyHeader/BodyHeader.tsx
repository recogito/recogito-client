import TimeAgo from 'timeago-react';
import type { User } from '@annotorious/react';
import { Avatar } from '@components/Avatar';

import './BodyHeader.css';

interface BodyHeaderProps {

  creator: User;

  createdAt?: Date;

}

export const BodyHeader = (props: BodyHeaderProps) => {

  const { creator, createdAt } = props;

  return (
    <div className="creator-label">
      <Avatar user={creator} size={38} />

      <div>
        {creator.isGuest ? (
          <div className="guest">Guest</div> 
        ) : (
          <address>
            {creator.name || creator.email?.substring(0, creator.email.indexOf('@')) || creator.email}
          </address>
        )}

        <div className="created-at">
          {createdAt && (
            <TimeAgo datetime={createdAt} />
          )}
        </div>
      </div>
    </div>
  )

}