import { CaretDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import './Interstitial.css';

interface InterstitialProps {

  count: number;

  onClick?(): void;

}

export const Interstitial = (props: InterstitialProps) => {

  const { t } = useTranslation(['annotation-common']);

  return (
    <div className="interstitial">
      <button className="label" onClick={props.onClick}>
        {`${t('Show N', { ns: 'annotation-common' })} ${props.count} ${props.count === 1 ? t('more reply', { ns: 'annotation-common' }) : t('more replies', { ns: 'annotation-common' })}`}
        <CaretDown size={12} />
      </button>
    </div>
  )

}