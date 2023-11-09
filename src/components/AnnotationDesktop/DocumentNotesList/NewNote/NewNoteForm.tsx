import { FormEvent, useState } from 'react';
import { Detective } from '@phosphor-icons/react';
import TextareaAutosize from 'react-textarea-autosize';

interface NewNoteFormProps {

  isPublic: boolean;

}

export const NewNoteForm = (props: NewNoteFormProps) => {

  const [value, setValue] = useState('');

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    // TODO

  }

  return (
    <form 
      className="create-new-note-form"
      onSubmit={onSubmit}>
      {!props.isPublic && (
        <Detective className="anonymous" size={20} weight="light" />  
      )}

      <TextareaAutosize
        rows={1} 
        maxRows={10} 
        value={value} 
        onChange={evt => setValue(evt.target.value)} />

      <div className="create-new-note-form-footer">
        <button className="sm primary" type="submit">
          Save
        </button>

        <button className="sm flat outline" type="button">
          Cancel
        </button>
      </div>
    </form>
  )

}