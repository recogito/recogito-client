import type { Translations } from 'src/Types';
import type { PresentUser, User } from '@annotorious/react';
import { Timestamp } from '@components/Timestamp';

import './AuthorDetails.css';

interface AuthorDetailsProps {

  i18n: Translations;

  isPrivate?: boolean;

  creator?: PresentUser | User;

  createdAt?: Date;

}

export const AuthorDetails = (props: AuthorDetailsProps) => {
  
  const { creator, createdAt } = props;

  const { t, lang } = props.i18n;

  const authorName = creator && 'appearance' in creator ? 
    creator.appearance.label : t['Anonymous'];

  return (
    <div className="author-details">
      <div className="created-by">
        {props.isPrivate ? 'Private' : authorName}
      </div>

      <div className="created-at">
        {createdAt && (
          <Timestamp datetime={createdAt} locale={lang} />
        )}
      </div>
    </div>
  )

}