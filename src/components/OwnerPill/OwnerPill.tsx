import type { Translations } from 'src/Types';
import { UserCircle } from '@phosphor-icons/react';

import './OwnerPill.css';

interface OwnerPillProps {
  i18n: Translations;
}

export const OwnerPill = (props: OwnerPillProps) => {
  return (
    <div className='owner-pill text-body-tiny'>
      <UserCircle /> {props.i18n.t['Owner']}
    </div>
  );
};
