import { Check, PencilSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DocumentTitle.css';

interface Props {
  onChange(title: string): void;

  readOnly?: boolean;

  value: string;
}

export const DocumentTitle = (props: Props) => {
  const [editable, setEditable] = useState(false);

  const { t } = useTranslation(['a11y']);

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
          aria-label={t('edit document title', { ns: 'a11y' })}
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
          aria-label={t('edit document title', { ns: 'a11y' })}
        >
          <PencilSimple />
        </button>
      )}
    </div>
  );
};
