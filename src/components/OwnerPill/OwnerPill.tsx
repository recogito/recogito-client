import { UserCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import './OwnerPill.css';


export const OwnerPill = () => {
  const { t } = useTranslation(['common'])
  return (
    <div className='owner-pill text-body-tiny'>
      <UserCircle /> {t('Owner', { ns: 'common' })}
    </div>
  );
};
