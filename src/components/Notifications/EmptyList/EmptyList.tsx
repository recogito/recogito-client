import { useTranslation } from 'react-i18next';
import './EmptyList.css';

export const EmptyList = () => {

  const { t } = useTranslation(['notifications']);

  return (
    <section className="notifications-empty">
      <h2>{t("You're up to date!", { ns: 'notifications' })}</h2>
      <p>{t('No notifications', { ns: 'notifications' })}</p>
    </section>
  )

}