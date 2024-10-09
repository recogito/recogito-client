import type { Translations } from 'src/Types';
import { Lock } from '@phosphor-icons/react';

import './LockedPill.css';

interface LockedPillProps {
  i18n: Translations;
}

export const LockedPill = (props: LockedPillProps) => {
  return (
    <div className='locked-pill text-body-tiny'>
      <Lock /> {props.i18n.t['Locked']}
    </div>
  );
};
