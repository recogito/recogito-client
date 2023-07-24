import type { Translations } from 'src/Types';

import './EmptyList.css';

interface EmptyListProps {

  i18n: Translations;

}

export const EmptyList = (props: EmptyListProps) => {

  return (
    <section className="notifications-empty">
      <h1>You're up to date!</h1>
      <p>No notifications</p>
    </section>
  )

}