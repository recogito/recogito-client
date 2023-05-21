import { ChangeEvent, useState } from 'react';

export interface TextInputProps {

  className?: string;

  error?: boolean;
  
  label: string;

  name: string; 

  type?: 'text' | 'password';

  value?: string;

  onChange?(value: string): void

}

export const TextInput = (props: TextInputProps) => {
  
  const [value, setValue] = useState(props.value || '');

  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setValue(value);
    props.onChange && props.onChange(value);
  }

  return (
    <div
      className={props.error ? "input-wrapper error" : "input-wrapper"}>
      <input 
        type={props.type || 'text'}
        name={props.name} 
        id={props.name}
        className={props.className} 
        data-filled={value !== ''}
        value={value}
        onChange={onChange}/>

        <label htmlFor="email">
          <span className="label-background" />
          {props.label}
        </label> 
    </div>
  )

}