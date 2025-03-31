import { useEffect, useRef, useState } from 'react';
import { Button } from '@components/Button';
import {
  useFloating,
  shift,
  inline,
  autoUpdate,
  flip,
  offset
} from '@floating-ui/react';

import './TEIMarkupInspector.css';

const HILITE_CLASS = 'r6o-tei-inspector-hi';

interface TEIMarkupInspectorProps {

  enabled: boolean;

}

export const TEIMarkupInspector = (props: TEIMarkupInspectorProps) => {

  const hover = useRef<Element | null>(null);

  const [inspect, setInspect] = useState<Element | null>(null);

  const { refs, floatingStyles } = useFloating({
    open: Boolean(inspect),
    placement: 'bottom-start',
    middleware: [
      inline(), 
      offset(10),
      flip({ crossAxis: true }),
      shift({ crossAxis: true })
    ],
    whileElementsMounted: autoUpdate
  });

  useEffect(() => {
    if (!props.enabled) return;

    const container = document.querySelector('.tei-container') as HTMLDivElement;
    if (!container) return;

    // This simply changes CSS styles. For performance, we'll handle this
    // on the plain DOM, not in React!
    const onPointerOver = (evt: PointerEvent) => {
      if (hover.current)
        hover.current.classList.remove(HILITE_CLASS);
      
      hover.current = evt.target as Element;
      hover.current.classList.add(HILITE_CLASS);
    }

    const onPointerOut = (evt: PointerEvent) => {
      if (evt.relatedTarget === null) {
        if (hover.current) {
          hover.current.classList.remove(HILITE_CLASS);
          hover.current = null;
        }
      }
    }

    const onClick = () => {
      if (hover.current) {
        setInspect(hover.current);
        refs.setReference(hover.current);
      } else {
        setInspect(null);
      }
    }

    container.addEventListener('pointerover', onPointerOver);
    container.addEventListener('pointerout', onPointerOut); 
    container.addEventListener('click', onClick);

    return () => {
      if (hover.current)
        hover.current.classList.remove(HILITE_CLASS);

      container.removeEventListener('pointerover', onPointerOver);
      container.removeEventListener('pointerout', onPointerOut);
      container.removeEventListener('click', onClick);
    }
  }, [props.enabled]);

  return inspect ? (
    <div 
      className="r6o-tei-inspector-popover"
      ref={refs.setFloating}
      style={floatingStyles}>
      

      <Button>Add Annotation</Button>
    </div>
  ) : null;

}