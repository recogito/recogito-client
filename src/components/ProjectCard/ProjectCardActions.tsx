import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type { ExtendedProjectData, Translations } from 'src/Types';
import { ProjectDetailsForm } from './ProjectDetailsForm';
import { archiveProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export interface ProjectCardActionsProps {

  i18n: Translations;

  project: ExtendedProjectData;

  onDeleted(): void;

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;

}

export const ProjectCardActions = (props: ProjectCardActionsProps) => {

  const { t } = props.i18n;

  const [editing, setEditing] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const onDetailsSaved = (updated: ExtendedProjectData) => {
    setEditing(false);
    props.onDetailsChanged(updated);
  }

  const onDetailsError = (error: string) => {
    setEditing(false);
    props.onError(error);
  }

  const onDeleteProject = () => {
    setDeleting(true);

    archiveProject(supabase, props.project.id)
      .then(() => {
        props.onDeleted();
        setDeleting(false);
      })
      .catch(error => {
        console.error(error);
        props.onError('Could not delete the project.');
        setDeleting(false);     
      });
  }

  return (
    <ConfirmedAction.Root
      open={confirming}
      onOpenChange={setConfirming}>
      
      <Root>
        <Trigger asChild>
          <button className="unstyled icon-only project-card-actions">
            <DotsThreeVertical weight="bold" size={20}/>
          </button>
        </Trigger>

        <Portal>
          <Content className="dropdown-content no-icons" sideOffset={5} align="start">
            <Item className="dropdown-item" onSelect={() => setEditing(true)}>
              <PencilSimple size={16} /> <span>{t['Edit project details']}</span>
            </Item>

            <ConfirmedAction.Trigger>
              <Item className="dropdown-item">
                <Trash size={16} className="destructive" /> <span>{t['Delete project']}</span>
              </Item>
            </ConfirmedAction.Trigger>
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog 
        busy={deleting}
        title={t['Are you sure?']} 
        description={t['Are you sure you want to delete this project permanently?']}
        cancelLabel={t['Cancel']} 
        confirmLabel={<><Trash size={16} /> <span>{t['Delete project']}</span></>}
        onConfirm={onDeleteProject} />

      <ProjectDetailsForm 
        i18n={props.i18n} 
        project={props.project}
        open={editing}
        onSaved={onDetailsSaved} 
        onCancel={() => setEditing(false)}
        onError={onDetailsError} />
    </ConfirmedAction.Root>
  )

}