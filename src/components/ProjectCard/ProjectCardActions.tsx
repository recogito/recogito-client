import { SelectRecordsDialog } from '@components/SelectRecordsDialog';
import { TagContext } from '@components/TagContext';
import {
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  ArrowRight,
  DotsThreeVertical,
  PencilSimple,
  SignOut,
  Trash
} from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveProject, leaveProject } from '@backend/crud';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type {
  ExtendedProjectData,
  Member,
  MyProfile,
  Policies,
  Tag,
  TagDefinition,
  Translations
} from 'src/Types';
import { ProjectDetailsForm } from './ProjectDetailsForm';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export interface ProjectCardActionsProps {
  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  onDeleted(): void;

  onLeaveProject(): void;

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;

  orgPolicies: Policies | undefined;
}

export const ProjectCardActions = (props: ProjectCardActionsProps) => {
  const { t } = props.i18n;

  const [editing, setEditing] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const [busy, setBusy] = useState(false);

  const [addToGroup, setAddToGroup] = useState(false);

  const isMine = props.me.id === props.project.created_by?.id;
  const isOrgAdmin = props.me.isOrgAdmin;

  const {
    loadTagDefinitions,
    onSaveTagsForTagDefinitions,
    setToast,
    tagDefinitions
  } = useContext(TagContext);

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
      .then(loadTagDefinitions)
      .catch((error) => {
        console.error(error);
        props.onError('Could not delete the project.');
        setBusy(false);
      });
  };

  const onLeaveProject = () => {
    setBusy(true);

    leaveProject(supabase, props.project.id).then((result) => {
      if (!result) props.onError('Failed to leave project.');
      else props.onLeaveProject();
    });
  };

  const allowAddToGroup = useMemo(() => {
    return !(props.project.is_open_join && !props.project.users.find(({ user }: Member) => user.id === props.me.id))
  }, [props.project, props.me]);

  const onTagsSaved = useCallback((tagDefinitionIds: string[]) => (
    onSaveTagsForTagDefinitions(tagDefinitionIds, props.project.id)
      .then(() => setAddToGroup(false))
      .then(() => setToast({
        title: t['Success'],
        description: t['Successfully updated groups for project'].replace('${name}', props.project.name),
        type: 'success'
      }))
  ), [props.project]);

  const selectedTagDefinitions = useMemo(() => {
    const tagDefinitionIds = tagDefinitions
      .map((tagDefinition) => tagDefinition.tags)
      .flat(Infinity)
      .filter(Boolean)
      .filter((tag: Tag) => tag.target_id === props.project.id)
      .map((tag: Tag) => tag.tag_definition_id);

    return tagDefinitionIds;
  }, [props.project, tagDefinitions]);

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root>
        <Trigger asChild>
          <button
            className='unstyled icon-only project-card-actions'
            aria-label={`${t['Show menu actions menu for project:']} ${props.project.name}`}
          >
            <DotsThreeVertical weight='bold' size={20} color='black' />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            {(isMine || isOrgAdmin) && (
              <Item
                className='dropdown-item'
                onSelect={() => setEditing(true)}
              >
                <PencilSimple size={16} />{' '}
                <span>{t['Edit project details']}</span>
              </Item>
            )}

            { allowAddToGroup && tagDefinitions && tagDefinitions.length > 0 && (
              <Item
                className='dropdown-item'
                onSelect={() => setAddToGroup(true)}
              >
                <ArrowRight size={16} className='dark' />{' '}
                <span>{t['Add to group']}</span>
              </Item>
            )}

            <ConfirmedAction.Trigger>
              <Item className='dropdown-item'>
                {isMine || isOrgAdmin ? (
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
          isMine || isOrgAdmin
            ? t['Are you sure you want to delete this project permanently?']
            : t['Are you sure you want to leave this project']
        }
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <Trash size={16} />
            <span>
              {isMine || isOrgAdmin ? t['Delete project'] : t['Leave project']}
            </span>
          </>
        }
        onConfirm={isMine || isOrgAdmin ? onDeleteProject : onLeaveProject}
      />

      <ProjectDetailsForm
        i18n={props.i18n}
        project={props.project}
        open={editing}
        onSaved={onDetailsSaved}
        onCancel={() => setEditing(false)}
        onError={onDetailsError}
      />

      <SelectRecordsDialog
        columns={[{
          name: 'name',
          label: t['Name'],
          resolve: ({ name }: TagDefinition) => name
        }, {
          name: 'count',
          label: t['Number of Projects'],
          resolve: ({ tags }: TagDefinition) => tags?.length || 0
        }]}
        description={t['Select Groups']}
        filterBy={['name']}
        header={t['All Groups']}
        i18n={props.i18n}
        onCancel={() => setAddToGroup(false)}
        onSave={onTagsSaved}
        open={addToGroup}
        records={tagDefinitions}
        selected={selectedTagDefinitions}
        subtite={t['Select group(s) to add project to']}
        title={t['Add project to group'].replace('${name}', props.project.name)}
      />

    </ConfirmedAction.Root>
  );
};
