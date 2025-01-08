import type { Translations } from 'src/Types';
import './EmptyMetadata.css';

interface Props {
  i18n: Translations
}

export const EmptyMetadata = (props: Props) => {
  const { t } = props.i18n;

  return (
    <div className='empty-metadata'>{t['No document metadata available.']}</div>
  );
};