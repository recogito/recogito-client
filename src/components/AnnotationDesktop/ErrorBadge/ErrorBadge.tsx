import { useTranslation } from 'react-i18next';
import './ErrorBadge.css';

export const ErrorBadge = () => {

  const { t } = useTranslation(['annotation-common']);

  const onRefresh = () => location.reload();

  return (
    <>
      <div className="anno-error-badge">
        <div className="anno-error-badge-message">
          {t('Connection Lost.', { ns: 'annotation-common' })}
        </div>

        <button 
          className="anno-error-refresh link"
          onClick={onRefresh}>
          {t('Try refreshing the page.', { ns: 'annotation-common' })}
        </button>
      </div>

      <div className="anno-error-clicktrap" />
    </>
  )

}