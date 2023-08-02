import { useRef, useState } from 'react';
import { Check, PlusCircle, TrashSimple, X } from '@phosphor-icons/react';
import type { PostgrestError } from '@supabase/supabase-js';
import TextareaAutosize from 'react-textarea-autosize';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import type { ExtendedProjectData, Policies, Translations } from 'src/Types';

import './ProjectDescription.css';

interface ProjectDescriptionProps {

  i18n: Translations;

  project: ExtendedProjectData;

  policies?: Policies;

  onChanged(project: ExtendedProjectData): void;

  onError(error: PostgrestError): void;

}

export const ProjectDescription = (props: ProjectDescriptionProps) => {

  const canEdit = props.policies?.get('projects').has('UPDATE');

  const el = useRef<HTMLTextAreaElement>(null);

  const [description, setDescription] = useState<string | undefined>(props.project.description);

  const [editable, setEditable] = useState(false);

  const [saveState, setSaveState] = useState<SaveState>('idle');

  const [value, setValue] = useState(description);

  const updateDescription = (text?: string) => {
    const current = description;

    const next = text?.trim();

    if (next === current)
      return; // Don't update unncessesarily

    setEditable(false);
    setDescription(next);
    setValue(next);
    setSaveState('saving');

    updateProject(supabase, { id: props.project.id, description: next || null })
      .then(({ error }) => {
        if (error) {
          setSaveState('failed');
          setDescription(current);
          setValue(current);
          props.onError(error);
        } else {
          setSaveState('success');
          props.onChanged({ ...props.project, description });
        }
      });
  }

  const onSave = () => updateDescription(value);

  const onCancel = () => {
    setEditable(false);
    setValue(description);
    setSaveState('idle');
  }

  const onClear = () => updateDescription(undefined);

  // TODO needs an explicit button for accessibility
  return (
    <div className="project-description">
      {editable ? (
        <>
          <TextareaAutosize 
            autoFocus
            ref={el}
            rows={1} 
            maxRows={20}
            value={value}
            onChange={evt => setValue(evt.target.value)}
            placeholder="Add a project description..." />

          <div className="buttons">
            <button 
              className="unstyled flat tiny"
              disabled={saveState === 'saving'}
              onClick={onSave}>
              <Check size={16} weight="bold" /> <span>Save</span>
            </button>

            <button 
              className="unstyled flat tiny"
              disabled={saveState === 'saving'}
              onClick={onCancel}>
              <X size={16} weight="bold" /> <span>Cancel</span>
            </button>

            <button 
              className="unstyled flat tiny"
              disabled={saveState === 'saving' || !value}
              onClick={onClear}>
              <TrashSimple size={16} weight="bold" /> <span>Clear</span>
            </button>
          </div>
        </>
      ) : description ? (
        <p 
          className={canEdit ? 'editable' : undefined}
          onClick={canEdit ? () => setEditable(true) : undefined}>
          {description}
          {saveState !== 'idle' && (
            <TinySaveIndicator 
              state={saveState} 
              fadeOut={1500} />
          )}
        </p>
      ) : canEdit && (
        <button className="minimal" onClick={() => setEditable(true)}>
          <PlusCircle size={16} /> <span>Add a project description</span>
        </button>
      )}
    </div>
  )

}