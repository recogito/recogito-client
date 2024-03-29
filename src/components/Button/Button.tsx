import type { ReactNode } from 'react';
import ConfettiExplosion from 'confetti-explosion-react';
import { Spinner } from '../Spinner';

import './Button.css';

interface ButtonProps {

  busy?: boolean;

  confetti?: boolean;

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

      {props.busy && props.confetti && (
        <div className="confetti">
          <ConfettiExplosion
            force={0.4}
            duration={3000}
            particleCount={60}
            height={1000}
            width={1000} />
        </div>
      )}
      
      {props.children}

      {props.busy && (
        <Spinner className="button-busy-spinner" size={16} />
      )}
    </button>
  )

}