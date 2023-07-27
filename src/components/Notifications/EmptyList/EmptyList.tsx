import type { Translations } from 'src/Types';

import './EmptyList.css';

interface EmptyListProps {

  i18n: Translations;

}

export const EmptyList = (props: EmptyListProps) => {

  const { t } = props.i18n;

  return (
    <section className="notifications-empty">
      <h1>{t['You\'re up to date!']}</h1>
      <p>{t['No notifications']}</p>
    </section>
  )

}