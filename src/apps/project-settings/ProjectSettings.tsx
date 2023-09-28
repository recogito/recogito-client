import { useEffect, useState } from 'react';
import { getProjectTagVocabulary, setProjectTagVocabulary } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { SaveState, TinySaveIndicator } from '@components/TinySaveIndicator';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import type { ExtendedProjectData, Translations } from 'src/Types';

import './ProjectSettings.css';

interface ProjectSettingsProps {

  i18n: Translations;

  project: ExtendedProjectData;

};

export const ProjectSettings = (props: ProjectSettingsProps) => {

  const { t } = props.i18n;

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [vocabulary, setVocabulary] = useState<string[]>([]);

  const [state, setState] = useState<SaveState>('idle');

  useEffect(() => {
    getProjectTagVocabulary(supabase, props.project.id)
      .then(({ error, data }) => {
        if (error) {
          setToast({ 
            title: t['Something went wrong'], 
            description: t['Error loading tag vocabulary.'], 
            type: 'error' 
          });
        } else {
          setVocabulary(data.map(t => t.name));
        }
      });
  }, []);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setVocabulary(value.split('\n'));
  }

  const saveVocabulary = () => {
    setState('saving')

    setProjectTagVocabulary(supabase, props.project.id, vocabulary)
      .then(() => { 
        setState('success');
      })
      .catch(error => {
        console.error(error);

        setToast({ 
          title: t['Something went wrong'], 
          description: t['Error saving tag vocabulary.'], 
          type: 'error' 
        });

        setState('failed');
      });
  }

  return (
    <div className="project-settings">
      <ToastProvider>
        <h1>{t['Project Settings']}</h1>

        <h2>Tagging Vocabulary</h2>
        <p>
          One per line...
        </p>
        <textarea 
          value={vocabulary.join('\n')} 
          onChange={onChange} />

        <div>
          <Button
            busy={state === 'saving'}
            className="primary"
            onClick={saveVocabulary}>
            <span>Save</span>
          </Button>

          <TinySaveIndicator 
            resultOnly
            state={state} 
            fadeOut={2500} />
        </div>

        <Toast
          content={toast}
          onOpenChange={open => !open && setToast(null)} />
      </ToastProvider>
    </div>
  )

}