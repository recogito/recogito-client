import type { PresentUser, User } from '@annotorious/react';
import { Timestamp } from '@components/Timestamp';
import { useTranslation } from 'react-i18next';

import './AuthorDetails.css';

interface AuthorDetailsProps {

  isPrivate?: boolean;

  creator?: PresentUser | User;

  createdAt?: Date;

}

export const AuthorDetails = (props: AuthorDetailsProps) => {
  
  const { creator, createdAt } = props;

  const { t, i18n } = useTranslation(['annotation-common']);

  const authorName = creator && 'appearance' in creator ? 
    creator.appearance.label : creator?.name || t('Anonymous', { ns: 'annotation-common' });

  return (
    <div className="author-details">
      <div className="created-by">
        {props.isPrivate ? 'Private' : authorName}
      </div>

      <div className="created-at">
        {createdAt && (
          <Timestamp datetime={createdAt} locale={i18n.language} />
        )}
      </div>
    </div>
  )

}