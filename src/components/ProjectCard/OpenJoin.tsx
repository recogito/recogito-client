import type { Translations } from 'src/Types';
import { SignIn } from '@phosphor-icons/react';

import './OpenJoin.css';

interface OpenJoinProps {
  projectId: string;

  i18n: Translations;

  onJoin(): void;
}
export const OpenJoin = (props: OpenJoinProps) => {
  const { t } = props.i18n;

  return (
    <div className='open-join-bar'>
      <button className='primary sm flat' onClick={props.onJoin}>
        <div>{t['Join']}</div>
        <SignIn size={16} />
      </button>
    </div>
  );
};
