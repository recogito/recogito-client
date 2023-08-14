import { useState } from 'react';
import { updateProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { EditableText } from '@components/EditableText';
import { SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import type { ExtendedProjectData } from 'src/Types';

import './ProjectTitle.css';

interface ProjectTitleProps {

  project: ExtendedProjectData;

  onChanged?(title: string): void;

}

export const ProjectTitle = (props: ProjectTitleProps) => {

  const { project } = props;

  const [saveState, setSaveState] = useState<SaveState>('idle');

  const onRenameProject = (name: string) => {
    setSaveState('saving');

    updateProject(supabase, { id: project.id, name })
      .then(({ error }) => {
        if (error) {
          setSaveState('failed');
        } else {
          setSaveState('success');
        }
      })
  }

  return (
    <h1 className="project-title">
      <EditableText 
        value={project.name} 
        onSubmit={onRenameProject} />

      {saveState !== 'idle' && (
        <TinySaveIndicator 
          state={saveState} 
          fadeOut={1500}/>
      )}
    </h1>
  )

}