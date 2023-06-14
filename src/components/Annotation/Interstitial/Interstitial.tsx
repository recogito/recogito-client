import { CaretDown } from '@phosphor-icons/react';

import './Interstitial.css';

interface InterstitialProps {

  label: string;

  onClick?(): void;

}

export const Interstitial = (props: InterstitialProps) => {

  return (
    <div className="annotation-card-comments-interstitial no-drag">
      <div className="divider" />
      <button className="label" onClick={props.onClick}>
        {props.label}
        <CaretDown size={12} />
      </button>
    </div>
  )

}