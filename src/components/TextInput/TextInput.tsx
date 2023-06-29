import { ChangeEvent, useState } from 'react';

interface TextInputProps {

  autoComplete?: boolean;

  className?: string;

  error?: boolean;
  
  label: string;

  id?: string;

  name?: string; 

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
        autoComplete={props.autoComplete === false ? 'off' : undefined}
        type={props.type || 'text'}
        name={props.name} 
        id={props.id}
        className={props.className} 
        data-filled={value !== ''}
        value={value}
        onChange={onChange}/>

        <label htmlFor={props.name}>
          <span className="label-background" />
          {props.label}
        </label> 
    </div>
  )

}