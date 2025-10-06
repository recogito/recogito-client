import { type ChangeEvent, useState } from 'react';

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
    props.onChange?.(value);
  }

  return (
    <div
      className={props.error ? "field error" : "field"}
    >
      <label
        htmlFor={props.name}
      >
        { props.label }
      </label>
      <input 
        autoComplete={props.autoComplete === false ? 'off' : undefined}
        type={props.type || 'text'}
        name={props.name} 
        id={props.id}
        className={props.className} 
        data-filled={value !== ''}
        value={value}
        onChange={onChange}
      />
    </div>
  )

}