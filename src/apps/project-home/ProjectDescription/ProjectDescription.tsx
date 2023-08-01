import { useRef, useState } from 'react';
import { PlusCircle } from '@phosphor-icons/react';
import type { PostgrestError } from '@supabase/supabase-js';
import TextareaAutosize from 'react-textarea-autosize';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import type { ExtendedProjectData, Translations } from 'src/Types';

import './ProjectDescription.css';

interface ProjectDescriptionProps {

  i18n: Translations;

  project: ExtendedProjectData;

  onChanged(project: ExtendedProjectData): void;

  onError(error: PostgrestError): void;

}

export const ProjectDescription = (props: ProjectDescriptionProps) => {

  const [description, setDescription] = useState(props.project.description);

  const el = useRef<HTMLTextAreaElement>(null);

  const [editable, setEditable] = useState(false);

  const [saveState, setSaveState] = useState<SaveState>('idle');

  const [value, setValue] = useState(description);

  const onSave = () => {
    const description = value.trim();

    setDescription(description);
    setSaveState('saving');
    setEditable(false);

    updateProject(supabase, { id: props.project.id, description })
      .then(({ error }) => {
        if (error) {
          setSaveState('failed');
          setDescription(props.project.description);
          props.onError(error);
        } else {
          setSaveState('success');
          setValue(description);
          props.onChanged({ ...props.project, description });
        }
      });
  }

  // TODO needs an explicit button for accessibility
  return (
    <div className="project-description">
      {editable ? (
        <TextareaAutosize 
          autoFocus
          ref={el}
          rows={1} 
          maxRows={20}
          value={value}
          onChange={evt => setValue(evt.target.value)}
          placeholder="Add a project description..." 
          onBlur={onSave} />
      ) : description ? (
        <p onClick={() => setEditable(true)}>
          {description}
          {saveState !== 'idle' && (
            <TinySaveIndicator 
              state={saveState} 
              fadeOut={1500} />
          )}
        </p>
      ) : (
        <button className="minimal" onClick={() => setEditable(true)}>
          <PlusCircle size={16} /> <span>Add a project description</span>
        </button>
      )}
    </div>
  )

}