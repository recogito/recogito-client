import { useState } from 'react';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { EditableText } from '@components/EditableText';
import { type SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import type { ExtendedProjectData } from 'src/Types';

import './ProjectTitle.css';

interface ProjectTitleProps {

  editable?: boolean;

  project: ExtendedProjectData;

  onChanged?(title: string): void;

}

export const ProjectTitle = (props: ProjectTitleProps) => {

  const { project } = props;

  const [title, setTitle] = useState(project.name);

  const [saveState, setSaveState] = useState<SaveState>('idle');

  const onRenameProject = (name: string) => {
    setTitle(name);
    setSaveState('saving');

    updateProject(supabase, { id: project.id, name })
      .then(({ error }) => {
        if (error) {
          setTitle(project.name);
          setSaveState('failed');
        } else {
          setSaveState('success');
        }
      });
  }

  return (
    <h1 className="project-title">
      {props.editable ? (
        <EditableText
          value={title} 
          onSubmit={onRenameProject} />
      ) : (
        title
      )}

      {saveState !== 'idle' && (
        <TinySaveIndicator 
          state={saveState} 
          fadeOut={1500}/>
      )}
    </h1>
  )

}