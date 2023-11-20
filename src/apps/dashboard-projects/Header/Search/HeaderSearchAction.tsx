import { MagnifyingGlass } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface HeaderSearchActionProps {

  i18n: Translations;

}

export const HeaderSearchAction = (props: HeaderSearchActionProps) => {

  const { t } = props.i18n;

  return (
    <button>
      <MagnifyingGlass size={16} /> <span>{t['Search']}</span>
    </button>
  )

}