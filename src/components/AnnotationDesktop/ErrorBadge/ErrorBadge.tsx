import type { Translations } from 'src/Types';

import './ErrorBadge.css';

interface ErrorBadgeProps {

  i18n: Translations;

}

export const ErrorBadge = (props: ErrorBadgeProps) => {

  const { t } = props.i18n;

  const onRefresh = () => location.reload();

  return (
    <div className="anno-error-badge">
      <div className="anno-error-badge-message">
        {t['Connection Lost.']}
      </div>

      <button 
        className="anno-error-refresh link"
        onClick={onRefresh}>
        {t['Try refreshing the page.']}
      </button>
    </div>
  )

}