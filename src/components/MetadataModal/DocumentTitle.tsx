import { Check, PencilSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import './DocumentTitle.css';
import type { Translations } from 'src/Types';

interface Props {
  onChange(title: string): void;

  readOnly?: boolean;

  i18n: Translations;

  value: string;
}

export const DocumentTitle = (props: Props) => {
  const [editable, setEditable] = useState(false);

  const { t } = props.i18n;

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
          aria-label={t['edit document title']}
        >
          <Check />
        </button>
      </div>
    );
  }

  return (
    <div className='document-title'>
      <span>{props.value}</span>
      {!props.readOnly && (
        <button
          className='unstyled icon-only'
          onClick={() => setEditable(true)}
          aria-label={t['edit document title']}
        >
          <PencilSimple />
        </button>
      )}
    </div>
  );
};
