import type { ReactNode } from 'react';
import { Spinner } from '../Spinner';

import './Button.css';

interface ButtonProps {

  busy?: boolean;

  children: ReactNode;

  className?: string;

  disabled?: boolean;

  type?: 'submit' | 'button';

  onClick?(evt: React.MouseEvent): void;

}

export const Button = (props: ButtonProps) => {
  
  const className = 
    `${props.className || ' '} ${props.busy ? 'busy' : ''}`.trim();
    
  return (
    <button
      className={className} 
      disabled={props.disabled}
      type={props.type} 
      onClick={props.onClick}>

      {props.children}

      {props.busy && (
        <Spinner className="button-busy-spinner" size={16} />
      )}
    </button>
  )

}