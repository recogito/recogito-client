import { Check, PencilSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import './DocumentTitle.css';

interface Props {
  onChange(title: string): void;

  readOnly?: boolean;

  value: string;
};

export const DocumentTitle = (props: Props) => {
  const [editable, setEditable] = useState(false);

  if (editable && !props.readOnly) {
    return (
      <div className='document-title'>
        <input
          autoFocus
          onChange={(e) => props.onChange(e.target.value)}
          value={props.value}
        />
        <button
          className='unstyled icon-only'
          onClick={() => setEditable(false)}
        >
          <Check />
        </button>
      </div>
    );
  }

  return (
    <div className='document-title'>
      <span>
        {props.value}
      </span>
      {!props.readOnly && (
        <button
          className='unstyled icon-only'
          onClick={() => setEditable(true)}
        >
          <PencilSimple />
        </button>
      )}
    </div>
  );
};