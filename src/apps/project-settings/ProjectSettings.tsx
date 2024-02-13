import { useEffect, useState } from 'react';
import {
  clearProjectTagVocabulary,
  getProjectTagVocabulary,
  setProjectTagVocabulary,
  updateProject,
} from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import type { ExtendedProjectData, Translations } from 'src/Types';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';

import './ProjectSettings.css';

interface ProjectSettingsProps {
  i18n: Translations;

  project: ExtendedProjectData;
}

export const ProjectSettings = (props: ProjectSettingsProps) => {
  const { t } = props.i18n;

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [vocabulary, setVocabulary] = useState<string[]>([]);

  const [state, setState] = useState<SaveState>('idle');
  const [openEdit, setOpenEdit] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState<ExtendedProjectData | undefined>();

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

  return (
    <div className='project-settings'>
      <ToastProvider>
        <h1>{t['Project Settings']}</h1>

        <div className='tagging-vocabulary'>
          <h2>{t['Name and Access Settings']}</h2>
          <div className='project-settings-inputs'>
            <Label.Root
              className='project-settings-label-root'
              htmlFor='firstName'
            >
              {t['Project Name']}
            </Label.Root>
            <input
              className='project-settings-input'
              type='text'
              value={name}
              placeholder={t['Name your project']}
              onChange={(evt) => setName(evt.target.value)}
            />
            <Label.Root
              className='project-settings-label-root'
              htmlFor='firstName'
            >
              {t['Project Description']}
            </Label.Root>
            <input
              type='text'
              value={description}
              placeholder={t['Describe your project']}
              onChange={(evt) => setDescription(evt.target.value)}
            />
          </div>
          <div className='project-settings-switch'>
            <label
              className='project-settings-switch-label'
              htmlFor='open-join'
              style={{ paddingRight: 15 }}
            >
              {t['Open Join']}
            </label>
            <Switch.Root
              className='project-settings-switch-root'
              id='open-join'
              checked={openJoin}
              onCheckedChange={() => {
                setOpenJoin(!openJoin);
              }}
            >
              <Switch.Thumb className='project-settings-switch-thumb' />
            </Switch.Root>
            <div className='project-settings-switch-description'>
              {t['open-join-info']}
            </div>
          </div>
          <div style={{ width: 24 }} />
          <div className='project-settings-switch'>
            <label
              className='project-settings-switch-label'
              htmlFor='open-edit'
              style={{ paddingRight: 15 }}
            >
              {t['Open Edit']}
            </label>
            <Switch.Root
              className='project-settings-switch-root'
              id='open-edit'
              checked={openEdit}
              onCheckedChange={() => setOpenEdit(!openEdit)}
            >
              <Switch.Thumb className='project-settings-switch-thumb' />
            </Switch.Root>
            <div className='project-settings-switch-description'>
              {t['open-edit-info']}
            </div>
          </div>
          <div className='buttons'>
            <Button
              busy={state === 'saving'}
              className='primary'
              onClick={saveProjectSettings}
              disabled={saveDisabled}
            >
              <span>{t['Save']}</span>
            </Button>

            <TinySaveIndicator resultOnly state={state} fadeOut={2500} />
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

        <Toast
          content={toast}
          onOpenChange={(open) => !open && setToast(null)}
        />
      </ToastProvider>
    </div>
  );
};
