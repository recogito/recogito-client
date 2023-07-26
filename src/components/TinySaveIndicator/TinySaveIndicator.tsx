import { Check, X } from '@phosphor-icons/react';
import { Spinner } from '../Spinner';

import './TinySaveIndicator.css';

interface TinySaveIndicatorProps {
  
  state: 'saving' | 'success' | 'failed' | 'idle'; 

}

export const TinySaveIndicator = (props: TinySaveIndicatorProps) => {

  const { state } = props;

  return (
    <div className={`tiny-save-indicator ${state}`}>
      {state === 'idle' ? (
        <div />
      ) : state === 'success' ? (
        <Check size={16} weight="bold" />
      ) : state === 'failed' ? (
        <X size={16} weight="bold" />
      ) : (
        <Spinner className="button-busy-spinner" size={16} />
      )}
    </div>
  )

}