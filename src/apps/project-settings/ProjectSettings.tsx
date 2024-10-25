import { GetPlugins } from '@apps/project-plugins/GetPlugins';
import {
  deleteInstalledPlugin,
  lockProject,
  updatePluginSettings,
  updateProject
} from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { BackButtonBar } from '@components/BackButtonBar';
import { Button } from '@components/Button';
import type { PluginInstallationConfig, PluginMetadata } from '@components/Plugins';
import { Extension } from '@components/Plugins';
import { TagSettings } from './TagSettings';
import { type SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import { Lock, Trash } from '@phosphor-icons/react';
import * as Label from '@radix-ui/react-label';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useEffect, useState } from 'react';
import type { ExtendedProjectData, Invitation, MyProfile, Translations } from 'src/Types';
import { DocumentViewRight } from 'src/Types';
import { SettingsHeader } from './SettingsHeader';
import { LockWarningMessage } from './LockWarningMessage';

import './ProjectSettings.css';

interface ProjectSettingsProps {

  invitations: Invitation[];

  me: MyProfile;

  i18n: Translations;

  project: ExtendedProjectData;

  availablePlugins: PluginMetadata[];

  installedPlugins: PluginInstallationConfig[];

}

export const ProjectSettings = (props: ProjectSettingsProps) => {
  
  const { t } = props.i18n;

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [installedPlugins, setInstalledPlugins] = useState(
    props.installedPlugins
  );

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
  const [documentViewRight, setDocumentViewRight] = useState<DocumentViewRight>(DocumentViewRight.closed);

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

  const onPluginInstalled = (installed: PluginInstallationConfig) =>
    setInstalledPlugins((all) => [...all, installed]);

  const onPluginRemoved = (removed: PluginInstallationConfig) =>
    setInstalledPlugins((all) => all.filter((i) => i !== removed));

  const onChangeUserSettings =
    (plugin: PluginInstallationConfig) => (settings: any) => {
      const before = [...installedPlugins];

      // Optimistic update
      const next: PluginInstallationConfig = {
        ...plugin,
        settings: {
          ...plugin.settings,
          plugin_settings: settings,
        },
      };

      setInstalledPlugins((all) =>
        all.map((p) => (p.meta.id === plugin.meta.id ? next : p))
      );

      updatePluginSettings(
        supabase,
        props.project.id,
        plugin.meta.id,
        settings
      ).then(({ error }) => {
        if (error) {
          onError(error.message);

          // Rollback
          setInstalledPlugins(before);
        }
      });
    };

  const onRemovePlugin = (installed: PluginInstallationConfig) => () => {
    const before = [...installedPlugins];

    // Optimistic update
    onPluginRemoved(installed);

    deleteInstalledPlugin(supabase, props.project.id, installed.meta.id).then(
      ({ error }) => {
        if (error) {
          onError(error.message);

          // Rollback
          setInstalledPlugins(before);
        }
      }
    );
  };

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
          document_view_right: documentViewRight
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
          window.location.href = `/${props.i18n.lang}/projects`;
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
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });
  };

  const visibility = openJoin ? 'public' : 'private';
  const type = openEdit ? 'single_team' : 'assignments';

  return (
    <>
      <TopBar
        invitations={props.invitations}
        i18n={props.i18n}
        onError={onError}
        me={props.me}
      />
      <BackButtonBar
        i18n={props.i18n}
        showBackToProjects={false}
        crumbs={[
          { label: t['Projects'], href: `/${props.i18n.lang}/projects/` },
          {
            label: props.project.name,
            href: `/${props.i18n.lang}/projects/${props.project.id}`,
          },
          { label: t['Settings'], href: undefined },
        ]}
      />
      <div className='project-settings'>
        <ToastProvider>
          <SettingsHeader
            i18n={props.i18n}
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
                  {t['Project Details']}
                </Label.Root>
                <Label.Root className='project-settings-label text-body-small-bold'>
                  {t['Name']}
                </Label.Root>
                <input
                  className='project-settings-input'
                  type='text'
                  value={name}
                  placeholder={t['Name your project']}
                  onChange={(evt) => setName(evt.target.value)}
                />
                <Label.Root className='project-settings-label text-body-small-bold'>
                  {t['Description']}
                </Label.Root>
                <input
                  type='text'
                  value={description}
                  placeholder={t['Describe your project']}
                  onChange={(evt) => setDescription(evt.target.value)}
                />
                <div className='project-settings-visibility'>
                  <Label.Root
                    className='project-settings-label-detail text-body-large-bold'
                    htmlFor='firstName'
                  >
                    {t['Project Visibility']}
                  </Label.Root>
                  <div className='project-settings-switches'>
                    <RadioGroup.Root
                      className='project-settings-radio-group-root'
                      defaultValue='private'
                      value={visibility}
                      aria-label='View density'
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
                          {t['Private']}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t[
                            'Project admins choose the users that can join this project'
                          ]
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
                          {t['Public']}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {
                          t[
                            'Any registered user can join this project without an invitation'
                          ]
                        }
                      </div>
                    </RadioGroup.Root>
                    <div className='project-settings-switches'>
                      <Label.Root
                        className='project-settings-label-detail text-body-large-bold'
                        htmlFor='firstName'
                      >
                        {t['Project Type']}
                      </Label.Root>
                      <RadioGroup.Root
                        className='project-settings-radio-group-root'
                        defaultValue='assignments'
                        value={type}
                        aria-label='View density'
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
                            {t['Assignments']}
                          </label>
                        </div>
                        <div className='project-settings-radio-group-helper text-body-small'>
                          {
                            t[
                              'Project admins create assignments with specific documents and team members'
                            ]
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
                            {t['Single Team']}
                          </label>
                        </div>
                        <div className='project-settings-radio-group-helper text-body-small'>
                          {t['Project members can annotate any document']}
                        </div>
                      </RadioGroup.Root>
                    </div>
                  </div>
                  <div className='project-settings-documents-view'>
                    <Label.Root
                      className='project-settings-label-detail text-body-large-bold'
                    >
                      {t['Document View (Right Panel)']}
                    </Label.Root>
                    <RadioGroup.Root
                      className='project-settings-radio-group-root'
                      defaultValue='closed'
                      value={documentViewRight}
                      aria-label='Document view right'
                      onValueChange={(value: DocumentViewRight) => setDocumentViewRight(value)}
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
                          {t['Closed']}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {t['Right panel will be closed by default when opening a document']}
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
                          {t['Annotations']}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {t['Right panel will display annotations when opening a document']}
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
                          {t['Notes']}
                        </label>
                      </div>
                      <div className='project-settings-radio-group-helper text-body-small'>
                        {t['Right panel will display notes when opening a document']}
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
                      <span>{t['Save']}</span>
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
                {t['Project Status']}
              </Label.Root>
              <div className='project-settings-status-helper text-body-small'>
                {t['status_message']}
              </div>
              <div className='project-settings-status-row'>
                <div className='text-body-small-bold'>
                  {`${t['Current Status']}:`}
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
                      <Lock size={16} />
                      <div className='text-body-small'>{t['Locked']}</div>
                    </>
                  ) : (
                    <div className='text-body-small'>{t['Active']}</div>
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
                  <Lock size={32} />
                  <span>
                    {project?.is_locked
                      ? t['Unlock Project']
                      : t['Lock Project']}
                  </span>
                </Button>
                <TinySaveIndicator resultOnly state={state} fadeOut={2500} />
              </div>
            </div>
          )}
          {tab === 'tagging' && (
            <TagSettings 
              i18n={props.i18n} 
              project={props.project}
              onError={onError} />
          )}
          {tab === 'plugins' && (
            <div className='project-plugins'>
              <div className='browse-plugins'>
                <h1>Plugins</h1>

                <p className='hint'>
                  Add super-powers to your annotation project with Plugins.
                </p>

                <GetPlugins
                  project={props.project}
                  availablePlugins={props.availablePlugins}
                  installedPlugins={installedPlugins}
                  onPluginInstalled={onPluginInstalled}
                  onPluginRemoved={onPluginRemoved}
                  onError={onError}
                />
              </div>

              <div>
                <h2>Installed Plugins ({installedPlugins.length})</h2>

                {installedPlugins.map((p) => (
                  <section key={p.meta.id} className='plugin-admin-tile'>
                    <div className='plugin-meta'>
                      <h3>{p.meta.name}</h3>

                      <p className='description'>{p.meta.description}</p>

                      <div className='uninstall'>
                        <button
                          className='sm flat danger'
                          onClick={onRemovePlugin(p)}
                        >
                          <Trash size={16} /> <span>Uninstall</span>
                        </button>
                      </div>

                      {(p.meta.author || p.meta.homepage) && (
                        <p className='author'>
                          Author:{' '}
                          {p.meta.author && p.meta.homepage ? (
                            <a
                              href={p.meta.homepage}
                              target='_blank'
                              rel='noreferrer'
                            >
                              {p.meta.author}
                            </a>
                          ) : p.meta.homepage ? (
                            <a
                              href={p.meta.homepage}
                              target='_blank'
                              rel='noreferrer'
                            >
                              {p.meta.homepage}
                            </a>
                          ) : (
                            <span>{p.meta.author}</span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className='plugin-admin'>
                      <Extension
                        plugin={p}
                        extensionPoint='admin'
                        onChangeUserSettings={onChangeUserSettings(p)}
                      />
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
          <LockWarningMessage
            open={lockOpen}
            i18n={props.i18n}
            isLocked={!!project?.is_locked}
            onCancel={() => setLockOpen(false)}
            onConfirm={handleLockProject}
          />
        </ToastProvider>
      </div>
    </>
  );
};
