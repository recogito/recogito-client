import { FormEvent, useState } from 'react';
import { Detective } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface NewNoteFormProps {

  i18n: Translations;

  isPrivate: boolean;

  onCancel(): void;

}

export const NewNoteForm = (props: NewNoteFormProps) => {

  const { t } = props.i18n;

  const [value, setValue] = useState('');

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    // TODO

  }

  return (
    <form 
      className={props.isPrivate ? 
        'create-new-note-form private' : 'create-new-note-form'}
      onSubmit={onSubmit}>

      {props.isPrivate && (
        <div className="privacy-label">
          <Detective className="anonymous" size={18} weight="light" /> 
          <span>{t['Private note']}</span>
        </div>
      )}

      <textarea
        rows={4} 
        value={value} 
        onChange={evt => setValue(evt.target.value)} />

      <div className="create-new-note-form-footer">
        <button 
          className="cancel sm flat outline" 
          type="button"
          onClick={props.onCancel}>
          Cancel
        </button>

        <button 
          className="sm primary" 
          type="submit">
          Save
        </button>
      </div>
    </form>
  )

}