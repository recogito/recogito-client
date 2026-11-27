import { useEffect, useState } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { LockIcon } from '@phosphor-icons/react';
import * as Label from '@radix-ui/react-label';
import * as RadioGroup from '@radix-ui/react-radio-group';
import type { Plugin, PluginInstallationConfig } from '@recogito/studio-sdk';
import { supabase } from '@backend/supabaseBrowserClient';
import { lockProject, updateProject } from '@backend/helpers';
import { BackButtonBar } from '@components/BackButtonBar';
import {
  type SaveState,
  TinySaveIndicator,
} from '@components/TinySaveIndicator';
import { Button } from '@components/Button';
import { TopBar } from '@components/TopBar';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { LockWarningMessage } from './LockWarningMessage';
import { PluginSettings } from './PluginSettings';
import { SettingsHeader } from './SettingsHeader';
import { TagSettings } from './TagSettings';
import clientI18next from 'src/i18n/client';
import { DocumentViewRight } from 'src/Types';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
} from 'src/Types';

import './ProjectSettings.css';

interface ProjectSettingsProps {
  invitations: Invitation[];

  me: MyProfile;

  project: ExtendedProjectData;

  availablePlugins: Plugin[];

  installedPlugins: PluginInstallationConfig[];
}

const ProjectSettings = (props: ProjectSettingsProps) => {
  const { t, i18n } = useTranslation([
    'common',
    'project-sidebar',
    'dashboard-projects',
    'a11y',
    'project-settings',
  ]);

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [state, setState] = useState<SaveState>('idle');

  const [openEdit, setOpenEdit] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState<ExtendedProjectData | undefined>();
  const [tab, setTab] = useState<
    'settings' | 'plugins' | 'tagging' | undefined
  >('settings');
  const [lockOpen, setLockOpen] = useState(false);
  const [documentViewRight, setDocumentViewRight] = useState<DocumentViewRight>(
    DocumentViewRight.closed
  );

  useEffect(() => {
    if (props.project) {
      setOpenEdit(props.project.is_open_edit || false);
      setOpenJoin(props.project.is_open_join || false);
      setName(props.project.name);
      setDescription(props.project.description || '');
      setProject(props.project);
      setDocumentViewRight(props.project.document_view_right);
    }
  }, [props.project]);

  const saveProjectSettings = () => {
    setState('saving');

    updateProject(
      supabase,
      props.project.id,
      name,
      description,
      openJoin,
      openEdit,
      props.project.is_locked || false,
      documentViewRight
    ).then((result) => {
      if (result) {
        setProject({
          ...props.project,
          name: name,
          description: description,
          is_open_join: openJoin,
          is_open_edit: openEdit,
          document_view_right: documentViewRight,
        });
        setState('success');
      } else {
        setState('failed');
      }
    });
  };

  const handleRequestLockProject = () => {
    setLockOpen(true);
  };

  const handleRequestUnlockProject = () => {
    setLockOpen(true);
  };

  const handleLockProject = () => {
    setState('saving');
    setLockOpen(false);

    if (project?.is_locked) {
      updateProject(
        supabase,
        props.project.id,
        name,
        description,
        openJoin,
        openEdit,
        !project?.is_locked,
        documentViewRight
      ).then((result) => {
        if (result) {
          setProject({
            ...props.project,
            name: name,
            description: description,
            is_open_join: openJoin,
            is_open_edit: openEdit,
            is_locked: !project?.is_locked,
          });
          setState('success');
        } else {
          setState('failed');
        }
      });
    } else {
      lockProject(supabase, props.project.id).then((result) => {
        if (result) {
          setState('success');
          window.location.href = `/${i18n.language}/projects`;
        } else {
          setState('failed');
        }
      });
    }
  };

  const saveDisabled =
    project &&
    project.name === name &&
    project.description === description &&
    project.is_open_join === openJoin &&
    project.is_open_edit === openEdit &&
    project.document_view_right === documentViewRight;

  const onError = (error: string) => {
    setToast({
      title: t('Something went wrong', { ns: 'common' }),
      description: error,
      type: 'error',
    });
  };

  const visibility = openJoin ? 'public' : 'private';
  const type = openEdit ? 'single_team' : 'assignments';

  return (
    <>
      <TopBar onError={onError} me={props.me} />
      <BackButtonBar
        showBackToProjects={false}
        crumbs={[
          { label: t('Projects', { ns: 'common' }), href: `/${i18n.language}/projects/` },
          {
            label: props.project.name,
            href: `/${i18n.language}/projects/${props.project.id}`,
          },
          { label: t('Settings', { ns: 'project-sidebar' }), href: undefined },
        ]}
      />
      <main className='project-settings' id='main'>
        <ToastProvider>
          <SettingsHeader
            onSwitchTab={setTab}
            currentTab={tab}
          />
          {tab === 'settings' && (
            <div className='tab-container'>
              <div className='project-settings-root'>
                <Label.Root
                  className='project-settings-label-detail text-body-large-bold'
                  htmlFor='firstName'
                >
                  {t('Project Details', { ns: 'dashboard-projects' })}
                </Label.Root>
                <Label.Root className='project-settings-label text-body-small-bold'>
                  {t('Name', { ns: 'common' })}
                </Label.Root>
                <input
                  className='project-settings-input'
                  type='text'
                  value={name}
                  placeholder={t('Name your project', { ns: 'dashboard-projects' })}
                  onChange={(evt) => setName(evt.target.value)}
                />
                <Label.Root className='project-settings-label text-body-small-bold'>
                  {t('Description', { ns: 'dashboard-projects' })}
                </Label.Root>
                <input
                  type='text'
                  value={description}
                  placeholder={t('Describe your project', { ns: 'dashboard-projects' })}
                  onChange={(evt) => setDescription(evt.target.value)}
                />
                <div className='project-settings-visibility'>
                  <Label.Root
                    className='project-settings-label-detail text-body-large-bold'
                    htmlFor='firstName'
                  >
                    {t('Project Visibility', { ns: 'dashboard-projects' })}
                  </Label.Root>
                  <div className='project-settings-switches'>
                    <RadioGroup.Root
                      className='project-settings-radio-group-root'
                      defaultValue='private'
                      value={visibility}
                      aria-label={t('set project visibility', { ns: 'a11y' })}
                      onValueChange={(value) =>
                        value === 'public'
                          ? setOpenJoin(true)
                          : setOpenJoin(false)
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RadioGroup.Item
                          className='project-settings-radio-group-item'
                          value='private'
                          id='visibility-private'
                        >
                          <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                        </RadioGroup.Item>
                        <label
                          className='project-settings-radio-group-label text-body-small-bold'
                          htmlFor='visibility-private'
                        >
                          {t('Private', { ns: 'common' })}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t('Project admins choose the users that can join this project', { ns: 'dashboard-projects' })
                        }
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RadioGroup.Item
                          className='project-settings-radio-group-item'
                          value='public'
                          id='visibility-public'
                        >
                          <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                        </RadioGroup.Item>
                        <label
                          className='project-settings-radio-group-label text-body-small-bold'
                          htmlFor='visibility-public'
                        >
                          {t('Public', { ns: 'common' })}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t('Any registered user can join this project without an invitation', { ns: 'dashboard-projects' })
                        }
                      </div>
                    </RadioGroup.Root>
                    <div className='project-settings-switches'>
                      <Label.Root
                        className='project-settings-label-detail text-body-large-bold'
                        htmlFor='firstName'
                      >
                        {t('Project Type', { ns: 'dashboard-projects' })}
                      </Label.Root>
                      <RadioGroup.Root
                        className='project-settings-radio-group-root'
                        defaultValue='assignments'
                        value={type}
                        aria-label={t('set project type', { ns: 'a11y' })}
                        onValueChange={(value) =>
                          value === 'assignments'
                            ? setOpenEdit(false)
                            : setOpenEdit(true)
                        }
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <RadioGroup.Item
                            className='project-settings-radio-group-item'
                            value='assignments'
                            id='type-assignments'
                          >
                            <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                          </RadioGroup.Item>
                          <label
                            className='project-settings-radio-group-label text-body-small-bold'
                            htmlFor='type-assignments'
                          >
                            {t('Assignments', { ns: 'common' })}
                          </label>
                        </div>
                        <div className='project-settings-radio-group-helper text-body-small'>
                          {
                            t('Project admins create assignments with specific documents and team members', { ns: 'dashboard-projects' })
                          }
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <RadioGroup.Item
                            className='project-settings-radio-group-item'
                            value='single_team'
                            id='type-single-team'
                          >
                            <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                          </RadioGroup.Item>
                          <label
                            className='project-settings-radio-group-label text-body-small-bold'
                            htmlFor='type-single-team'
                          >
                            {t('Single Team', { ns: 'dashboard-projects' })}
                          </label>
                        </div>
                        <div className='project-settings-radio-group-helper text-body-small'>
                          {t('Project members can annotate any document', { ns: 'dashboard-projects' })}
                        </div>
                      </RadioGroup.Root>
                    </div>
                  </div>
                  <div className='project-settings-documents-view'>
                    <Label.Root className='project-settings-label-detail text-body-large-bold'>
                      {t('Document View (Right Panel)', { ns: 'project-settings' })}
                    </Label.Root>
                    <RadioGroup.Root
                      className='project-settings-radio-group-root'
                      defaultValue='closed'
                      value={documentViewRight}
                      aria-label={t('document view right', { ns: 'a11y' })}
                      onValueChange={(value: DocumentViewRight) =>
                        setDocumentViewRight(value)
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RadioGroup.Item
                          className='project-settings-radio-group-item'
                          value='closed'
                          id='documents-view-closed'
                        >
                          <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                        </RadioGroup.Item>
                        <label
                          className='project-settings-radio-group-label text-body-small-bold'
                          htmlFor='documents-view-closed'
                        >
                          {t('Closed', { ns: 'project-settings' })}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t('Right panel will be closed by default when opening a document', { ns: 'project-settings' })
                        }
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RadioGroup.Item
                          className='project-settings-radio-group-item'
                          value='annotations'
                          id='documents-view-annotations'
                        >
                          <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                        </RadioGroup.Item>
                        <label
                          className='project-settings-radio-group-label text-body-small-bold'
                          htmlFor='documents-view-annotations'
                        >
                          {t('Annotations', { ns: 'common' })}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t('Right panel will display annotations when opening a document', { ns: 'project-settings' })
                        }
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RadioGroup.Item
                          className='project-settings-radio-group-item'
                          value='notes'
                          id='documents-view-notes'
                        >
                          <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                        </RadioGroup.Item>
                        <label
                          className='project-settings-radio-group-label text-body-small-bold'
                          htmlFor='documents-view-notes'
                        >
                          {t('Notes', { ns: 'common' })}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t('Right panel will display notes when opening a document', { ns: 'project-settings' })
                        }
                      </div>
                    </RadioGroup.Root>
                  </div>
                  <div className='buttons project-settings-buttons'>
                    <Button
                      busy={state === 'saving'}
                      className='primary'
                      onClick={saveProjectSettings}
                      disabled={saveDisabled}
                    >
                      <span>{t('Save Changes', { ns: 'project-settings' })}</span>
                    </Button>

                    <TinySaveIndicator
                      resultOnly
                      state={state}
                      fadeOut={2500}
                    />
                  </div>
                </div>
              </div>
              <div className='project-settings-divider' />
              <Label.Root
                className='project-settings-label-detail text-body-large-bold'
                htmlFor='projectStatus'
              >
                {t('Project Status', { ns: 'project-settings' })}
              </Label.Root>
              <div className='project-settings-status-helper text-body-small'>
                {t('status_message', { ns: 'project-settings' })}
              </div>
              <div className='project-settings-status-row'>
                <div className='text-body-small-bold'>
                  {`${t('Current Status', { ns: 'project-settings' })}:`}
                </div>
                <div
                  className={
                    project?.is_locked
                      ? 'project-status-locked'
                      : 'project-status-active'
                  }
                >
                  {project?.is_locked ? (
                    <>
                      <LockIcon size={16} />
                      <div className='text-body-small'>{t('Locked', { ns: 'common' })}</div>
                    </>
                  ) : (
                    <div className='text-body-small'>{t('Active', { ns: 'common' })}</div>
                  )}
                </div>
              </div>
              <div className='buttons project-settings-buttons'>
                <Button
                  busy={state === 'saving'}
                  className='primary'
                  onClick={
                    project?.is_locked
                      ? handleRequestUnlockProject
                      : handleRequestLockProject
                  }
                >
                  <LockIcon size={16} />
                  <span>
                    {project?.is_locked
                      ? t('Unlock Project', { ns: 'common' })
                      : t('Lock Project', { ns: 'project-settings' })}
                  </span>
                </Button>
                <TinySaveIndicator resultOnly state={state} fadeOut={2500} />
              </div>
            </div>
          )}
          {tab === 'tagging' && (
            <TagSettings
              project={props.project}
              onError={onError}
            />
          )}
          {tab === 'plugins' && (
            <PluginSettings 
              project={props.project} 
              availablePlugins={props.availablePlugins} 
              installedPlugins={props.installedPlugins}
              onError={onError}/>
          )}

          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
          <LockWarningMessage
            open={lockOpen}
            isLocked={!!project?.is_locked}
            onCancel={() => setLockOpen(false)}
            onConfirm={handleLockProject}
          />
        </ToastProvider>
      </main>
    </>
  );
};

export const ProjectSettingsApp = (props: ProjectSettingsProps) => (
  <I18nextProvider i18n={clientI18next}>
    <ProjectSettings {...props} />
  </I18nextProvider>
);
