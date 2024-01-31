import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  DotsThreeVertical,
  PencilSimple,
  SignOut,
  Trash,
} from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveProject, leaveGroup } from '@backend/crud';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type {
  ExtendedProjectData,
  MyProfile,
  Policies,
  Translations,
} from 'src/Types';
import { ProjectDetailsForm } from './ProjectDetailsForm';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export interface ProjectCardActionsProps {
  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  onDeleted(): void;

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;

  orgPolicies: Policies | undefined;
}

export const ProjectCardActions = (props: ProjectCardActionsProps) => {
  const { t } = props.i18n;

  const { me } = props;

  const [editing, setEditing] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const [busy, setBusy] = useState(false);

  const isMine = props.me.id === props.project.created_by?.id;

  const onDetailsSaved = (updated: ExtendedProjectData) => {
    setEditing(false);
    props.onDetailsChanged(updated);
  };

  const onDetailsError = (error: string) => {
    setEditing(false);
    props.onError(error);
  };

  const onDeleteProject = () => {
    setBusy(true);

    archiveProject(supabase, props.project.id)
      .then(() => {
        props.onDeleted();
        setBusy(false);
      })
      .catch((error) => {
        console.error(error);
        props.onError('Could not delete the project.');
        setBusy(false);
      });
  };

  const onLeaveProject = () => {
    setBusy(true);

    const myGroup = props.project.groups.find((g) =>
      g.members.find((m) => m.user.id === me.id)
    )?.id;

    if (myGroup) {
      leaveGroup(supabase, me.id, myGroup).then(({ error }) => {
        if (error) props.onError(error.details);
        else props.onDeleted();
      });
    } else {
      props.onError('Error leaving the group');
    }
  };

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root>
        <Trigger asChild>
          <button
            className='unstyled icon-only project-card-actions'
            aria-label={`${t['Show menu actions menu for project:']} ${props.project.name}`}
          >
            <DotsThreeVertical weight='bold' size={20} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            <Item className='dropdown-item' onSelect={() => setEditing(true)}>
              <PencilSimple size={16} />{' '}
              <span>{t['Edit project details']}</span>
            </Item>

            <ConfirmedAction.Trigger>
              <Item className='dropdown-item'>
                {isMine ||
                (props.orgPolicies &&
                  props.orgPolicies.get('projects').has('UPDATE')) ? (
                  <>
                    <Trash size={16} className='destructive' />{' '}
                    <span>{t['Delete project']}</span>
                  </>
                ) : (
                  <>
                    <SignOut size={16} className='destructive' />{' '}
                    <span>{t['Leave project']}</span>
                  </>
                )}
              </Item>
            </ConfirmedAction.Trigger>
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        i18n={props.i18n}
        busy={busy}
        title={t['Are you sure?']}
        description={
          isMine
            ? t['Are you sure you want to delete this project permanently?']
            : t['Are you sure you want to leave this project']
        }
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <Trash size={16} />
            <span>{isMine ? t['Delete project'] : t['Leave project']}</span>
          </>
        }
        onConfirm={isMine ? onDeleteProject : onLeaveProject}
      />

      <ProjectDetailsForm
        i18n={props.i18n}
        project={props.project}
        open={editing}
        onSaved={onDetailsSaved}
        onCancel={() => setEditing(false)}
        onError={onDetailsError}
      />
    </ConfirmedAction.Root>
  );
};
