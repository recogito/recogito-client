import { useEffect, useState } from 'react';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { clearProjectTagVocabulary, getProjectTagVocabulary, setProjectTagVocabulary } from '@backend/helpers';
import { TinySaveIndicator, type SaveState } from '@components/TinySaveIndicator';
import type { ExtendedProjectData, Translations } from 'src/Types';

import './TagSettings.css';
import { TagColorPicker } from './TagColorPicker';

interface TagSettingsProps {

  i18n: Translations;

  project: ExtendedProjectData;

  onError(message: string): void;

}

export const TagSettings = (props: TagSettingsProps) => {

  const { t } = props.i18n;

  const [vocabulary, setVocabulary] = useState<string[]>([]);

  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    getProjectTagVocabulary(supabase, props.project.id).then(
      ({ error, data }) => {
        if (error) {
          props.onError(t['Error loading tag vocabulary']);
        } else {
          setVocabulary(data.map((t) => t.name));
        }
      }
    );
  }, []);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setVocabulary(value.split('\n'));
  };

  const saveVocabulary = () => {
    setSaveState('saving');

    setProjectTagVocabulary(supabase, props.project.id, vocabulary)
      .then(() => {
        setSaveState('success');
      }).catch((error) => {
        setSaveState('failed');
        props.onError(t['Error saving tag vocabulary.']);
      });
  };

  const clearVocabulary = () => {
    setSaveState('saving');

    const prev = vocabulary;

    setVocabulary([]);

    clearProjectTagVocabulary(supabase, props.project.id)
      .then(() => {
        setSaveState('success');
      })
      .catch(() => {
        setSaveState('failed');
        props.onError(t['Error saving tag vocabulary.']);

        // Roll back
        setVocabulary(prev);
      });
  };

  return (
    <div className='tag-settings tab-container'>
      <h2>{t['Tagging Vocabulary']}</h2>

      <p>{t['You can pre-define a tagging vocabulary']}</p>

      <p>{t['The terms will appear as autocomplete options']}</p>

      {vocabulary.length > 0 && (
        <table>
          <tbody>
            {vocabulary.map(term => (
              <tr>
                <td>{term}</td>

                <td>
                  <TagColorPicker />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <textarea 
        value={vocabulary.join('\n')} onChange={onChange} />

      <div className='buttons'>
        <Button onClick={clearVocabulary}>
          <span>{t['Clear']}</span>
        </Button>

        <Button
          busy={saveState === 'saving'}
          className='primary'
          onClick={saveVocabulary}>
          <span>{t['Save']}</span>
        </Button>

        <TinySaveIndicator 
          resultOnly 
          state={saveState} 
          fadeOut={2500} />
      </div>
    </div>
  )

}