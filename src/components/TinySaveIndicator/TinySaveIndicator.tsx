import { useEffect, useState } from 'react';
import { Check, X } from '@phosphor-icons/react';
import { Spinner } from '../Spinner';

import './TinySaveIndicator.css';

export type SaveState = 'saving' | 'success' | 'failed' | 'idle';

interface TinySaveIndicatorProps {
  
  state: SaveState;

  fadeOut?: number;

}

export const TinySaveIndicator = (props: TinySaveIndicatorProps) => {

  const { fadeOut, state } = props;

  const [opacity, setOpacity] = useState(1);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!fadeOut)
      return;

    if (timer)
      clearTimeout(timer);

    if (state === 'success') {
      setTimer(setTimeout(() => setOpacity(0), fadeOut));
    } else {
      setOpacity(1);
    }
  }, [state]);

  return (
    <div className={`tiny-save-indicator ${state}`} style={{ opacity }}>
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