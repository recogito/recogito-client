import { CaretDown } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './Interstitial.css';

interface InterstitialProps {

  i18n: Translations;

  count: number;

  onClick?(): void;

}

export const Interstitial = (props: InterstitialProps) => {

  const { t } = props.i18n;

  return (
    <div className="interstitial">
      <button className="label" onClick={props.onClick}>
        {`${t['Show N']} ${props.count} ${props.count === 1 ? t['more reply'] : t['more replies']}`}
        <CaretDown size={12} />
      </button>
    </div>
  )

}