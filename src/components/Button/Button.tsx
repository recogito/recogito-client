import type { ReactNode } from 'react';

export interface ButtonProps {

  children: ReactNode;

  className?: string;

  disabled?: boolean;

  type?: 'submit';

  onClick?(evt: React.MouseEvent): void;

}

export const Button = (props: ButtonProps) => {

  return (
    <button 
      className={props.className} 
      disabled={props.disabled}
      type={props.type} 
      onClick={props.onClick}>
      {props.children}
    </button>
  )

}