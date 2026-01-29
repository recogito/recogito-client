import { useRef, useState } from 'react';
import { Check, PlusCircle, TrashSimple, X } from '@phosphor-icons/react';
import type { PostgrestError } from '@supabase/supabase-js';
import TextareaAutosize from 'react-textarea-autosize';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { type SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import type { ExtendedProjectData } from 'src/Types';
import { useTranslation } from 'react-i18next';

import './ProjectDescription.css';

interface ProjectDescriptionProps {

  editable?: boolean;

  project: ExtendedProjectData;

  onChanged(project: ExtendedProjectData): void;

  onError(error: PostgrestError): void;

}

export const ProjectDescription = (props: ProjectDescriptionProps) => {

  const { t } = useTranslation(['project-home', 'common']);

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
            placeholder={t('Add a project description...', { ns: 'project-home' })} />

          <div className="buttons">
            <button 
              className="unstyled flat tiny"
              disabled={saveState === 'saving'}
              onClick={onSave}>
              <Check size={16} weight="bold" /> <span>{t('Save', { ns: 'common' })}</span>
            </button>

            <button 
              className="unstyled flat tiny"
              disabled={saveState === 'saving'}
              onClick={onCancel}>
              <X size={16} weight="bold" /> <span>{t('Cancel', { ns: 'common' })}</span>
            </button>

            <button 
              className="unstyled flat tiny"
              disabled={saveState === 'saving' || !value}
              onClick={onClear}>
              <TrashSimple size={16} weight="bold" /> <span>{t('Clear', { ns: 'project-home' })}</span>
            </button>
          </div>
        </>
      ) : description ? (
        <p 
          className={props.editable ? 'editable' : undefined}
          onClick={props.editable ? () => setEditable(true) : undefined}>
          {description}
          {saveState !== 'idle' && (
            <TinySaveIndicator 
              state={saveState} 
              fadeOut={1500} />
          )}
        </p>
      ) : props.editable && (
        <button className="minimal" onClick={() => setEditable(true)}>
          <PlusCircle size={16} /> <span>{t('Add a project description', { ns: 'project-home' })}</span>
        </button>
      )}
    </div>
  )

}