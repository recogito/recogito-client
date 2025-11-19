import { Lock } from '@phosphor-icons/react';

import './LockedPill.css';
import { useTranslation } from 'react-i18next';


export const LockedPill = () => {
  const { t } = useTranslation(['common']);
  return (
    <div className='locked-pill text-body-tiny'>
      <Lock /> {t('Locked', { ns: 'common' })}
    </div>
  );
};
