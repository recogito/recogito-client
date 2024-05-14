import { useEffect, useState } from 'react';
import {
  clearProjectTagVocabulary,
  getProjectTagVocabulary,
  setProjectTagVocabulary,
  updateProject,
  deleteInstalledPlugin,
  updatePluginSettings,
} from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import type {
  ExtendedProjectData,
  Invitation,
  Translations,
  MyProfile,
} from 'src/Types';
import * as Label from '@radix-ui/react-label';
import { TopBar } from '@components/TopBar';
import { BackButtonBar } from '@components/BackButtonBar';
import * as RadioGroup from '@radix-ui/react-radio-group';

import './ProjectSettings.css';
import { SettingsHeader } from './SettingsHeader';
import {
  PluginMetadata,
  PluginInstallationConfig,
  Extension,
} from '@components/Plugins';
import { Trash } from '@phosphor-icons/react';
import { GetPlugins } from '@apps/project-plugins/GetPlugins';

interface ProjectSettingsProps {
  invitations: Invitation[];
  projects: ExtendedProjectData[];

  me: MyProfile;
  i18n: Translations;

  project: ExtendedProjectData;

  availablePlugins: PluginMetadata[];

  installedPlugins: PluginInstallationConfig[];
}

export const ProjectSettings = (props: ProjectSettingsProps) => {
  const { t } = props.i18n;

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState(
    props.installedPlugins
  );
  const [state, setState] = useState<SaveState>('idle');
  const [openEdit, setOpenEdit] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState<ExtendedProjectData | undefined>();
  const [tab, setTab] = useState<'settings' | 'plugins' | undefined>(
    'settings'
  );

  useEffect(() => {
    getProjectTagVocabulary(supabase, props.project.id).then(
      ({ error, data }) => {
        if (error) {
          setToast({
            title: t['Something went wrong'],
            description: t['Error loading tag vocabulary.'],
            type: 'error',
          });
        } else {
          setVocabulary(data.map((t) => t.name));
        }
      }
    );
  }, []);

  useEffect(() => {
    if (props.project) {
      setOpenEdit(props.project.is_open_edit || false);
      setOpenJoin(props.project.is_open_join || false);
      setName(props.project.name);
      setDescription(props.project.description || '');
      setProject(props.project);
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

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setVocabulary(value.split('\n'));
  };

  const saveVocabulary = () => {
    setState('saving');

    setProjectTagVocabulary(supabase, props.project.id, vocabulary)
      .then(() => {
        setState('success');
      })
      .catch((error) => {
        console.error(error);

        setToast({
          title: t['Something went wrong'],
          description: t['Error saving tag vocabulary.'],
          type: 'error',
        });

        setState('failed');
      });
  };

  const saveProjectSettings = () => {
    setState('saving');

    updateProject(
      supabase,
      props.project.id,
      name,
      description,
      openJoin,
      openEdit
    ).then((result) => {
      if (result) {
        setProject({
          ...props.project,
          name: name,
          description: description,
          is_open_join: openJoin,
          is_open_edit: openEdit,
        });
        setState('success');
      } else {
        setState('failed');
      }
    });
  };

  const clearVocabulary = () => {
    setState('saving');

    const prev = vocabulary;

    setVocabulary([]);

    clearProjectTagVocabulary(supabase, props.project.id)
      .then(() => {
        setState('success');
      })
      .catch(() => {
        setToast({
          title: t['Something went wrong'],
          description: t['Error saving tag vocabulary.'],
          type: 'error',
        });

        setState('failed');

        // Roll back
        setVocabulary(prev);
      });
  };

  const saveDisabled =
    project &&
    project.name === name &&
    project.description === description &&
    project.is_open_join === openJoin &&
    project.is_open_edit === openEdit;

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
        projects={props.projects}
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
            <>
              <div className='tagging-vocabulary'>
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
                            id='r1'
                          >
                            <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                          </RadioGroup.Item>
                          <label
                            className='project-settings-radio-group-label text-body-small-bold'
                            htmlFor='r1'
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
                            id='r2'
                          >
                            <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                          </RadioGroup.Item>
                          <label
                            className='project-settings-radio-group-label text-body-small-bold'
                            htmlFor='r2'
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
                          {t['Project Visibility']}
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
                          <div
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <RadioGroup.Item
                              className='project-settings-radio-group-item'
                              value='assignments'
                              id='r1'
                            >
                              <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                            </RadioGroup.Item>
                            <label
                              className='project-settings-radio-group-label text-body-small-bold'
                              htmlFor='r1'
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
                          <div
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <RadioGroup.Item
                              className='project-settings-radio-group-item'
                              value='single_team'
                              id='r2'
                            >
                              <RadioGroup.Indicator className='project-settings-radio-group-indicator' />
                            </RadioGroup.Item>
                            <label
                              className='project-settings-radio-group-label text-body-small-bold'
                              htmlFor='r2'
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
              </div>

              <div className='tagging-vocabulary'>
                <h2>{t['Tagging Vocabulary']}</h2>

                <p>{t['You can pre-define a tagging vocabulary']}</p>

                <p>{t['The terms will appear as autocomplete options']}</p>

                <textarea value={vocabulary.join('\n')} onChange={onChange} />

                <div className='buttons'>
                  <Button onClick={clearVocabulary}>
                    <span>{t['Clear']}</span>
                  </Button>
                  <Button
                    busy={state === 'saving'}
                    className='primary'
                    onClick={saveVocabulary}
                  >
                    <span>{t['Save']}</span>
                  </Button>

                  <TinySaveIndicator resultOnly state={state} fadeOut={2500} />
                </div>
              </div>
            </>
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
        </ToastProvider>
      </div>
    </>
  );
};
