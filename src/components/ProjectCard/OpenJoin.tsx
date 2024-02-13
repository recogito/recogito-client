import type { Translations } from 'src/Types';
import './OpenJoin.css';
import { SignIn } from '@phosphor-icons/react';

interface OpenJoinProps {
  projectId: string;

  i18n: Translations;

  onJoin(): void;
}
export const OpenJoin = (props: OpenJoinProps) => {
  const { t } = props.i18n;

  return (
    <div className='open-join-bar'>
      <button className='open-join-button' onClick={props.onJoin}>
        <div>{t['Join']}</div>
        <SignIn color='white' />
      </button>
    </div>
  );
};
