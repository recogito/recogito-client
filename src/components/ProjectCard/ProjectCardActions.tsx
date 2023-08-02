import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import type { ExtendedProjectData, Translations } from 'src/Types';
import { ProjectDetailsForm } from './ProjectDetailsForm';

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

  const onDetailsSaved = (updated: ExtendedProjectData) => {
    setEditing(false);
    props.onDetailsChanged(updated);
  }

  const onDetailsError = (error: string) => {
    setEditing(false);
    props.onError(error);
  }

  return (
    <>
      <Root>
        <Trigger asChild>
          <button className="unstyled icon-only project-card-actions">
            <DotsThreeVertical weight="bold" size={20}/>
          </button>
        </Trigger>

        <Portal>
          <Content className="dropdown-content no-icons" sideOffset={5} align="start">
            <Item className="dropdown-item" onSelect={props.onDeleted}>
              <Trash size={16} /> <span>{t['Delete project']}</span>
            </Item>

            <Item className="dropdown-item" onSelect={() => setEditing(true)}>
              <PencilSimple size={16} /> <span>{t['Edit project details']}</span>
            </Item>
          </Content>
        </Portal>
      </Root>

      <ProjectDetailsForm 
        i18n={props.i18n} 
        project={props.project}
        open={editing}
        onSaved={onDetailsSaved} 
        onCancel={() => setEditing(false)}
        onError={onDetailsError} />
    </>
  )

}