import { useLayoutEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

import './AutosizeInput.css';

export const AutosizeInput = (props: InputHTMLAttributes<HTMLInputElement>) => {

  const measure = useRef<HTMLSpanElement>(null);

  const [width, setWidth] = useState(1);

  useLayoutEffect(() => {
    if (measure.current)
      setWidth(measure.current.offsetWidth);
  }, [props.value]);

  return (
    <div className="autosize-input">
      <span 
        ref={measure}
        className="autosize-input-measure">{props.value}</span>

      <input 
        {...props}
        style={{ width: Math.max(width, 10)}} />
    </div>
  )

}