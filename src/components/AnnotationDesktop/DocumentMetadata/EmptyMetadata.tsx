import { useTranslation } from 'react-i18next';
import './EmptyMetadata.css';

export const EmptyMetadata = () => {
  const { t } = useTranslation(['annotation-common']);

  return (
    <div className='empty-metadata'>{t('No document metadata available.', { ns: 'annotation-common' })}</div>
  );
};