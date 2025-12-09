import { SignIn } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import './OpenJoin.css';

interface OpenJoinProps {
  projectId: string;

  onJoin(): void;
}
export const OpenJoin = (props: OpenJoinProps) => {
  const { t } = useTranslation(['dashboard-projects']);

  return (
    <div className='open-join-bar'>
      <button className='primary sm flat' onClick={props.onJoin}>
        <div>{t('Join', { ns: 'dashboard-projects' })}</div>
        <SignIn size={16} />
      </button>
    </div>
  );
};
