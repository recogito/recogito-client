import { useEffect, useState } from 'react';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import {
  clearProjectTagVocabulary,
  getProjectTagVocabulary,
  setProjectTagVocabulary,
} from '@backend/helpers';
import type { SaveState } from '@components/TinySaveIndicator';
import { TagColorPicker } from './TagColorPicker';
import type {
  ExtendedProjectData,
  VocabularyTerm,
} from 'src/Types';
import { useTranslation } from 'react-i18next';

import './TagSettings.css';

interface TagSettingsProps {

  project: ExtendedProjectData;

  onError(message: string): void;
}

export const TagSettings = (props: TagSettingsProps) => {
  const { t } = useTranslation(['project-settings', 'common']);

  const [inputVal, setInputVal] = useState<string>('');

  const [vocabulary, setVocabulary] = useState<VocabularyTerm[] | undefined>();

  const [unsaved, setUnsaved] = useState(false);

  const [addState, setAddState] = useState<SaveState>('idle');

  const [clearState, setClearState] = useState<SaveState>('idle');

  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    getProjectTagVocabulary(supabase, props.project.id).then(
      ({ error, data }) => {
        if (error) {
          props.onError(t('Error loading tag vocabulary.', { ns: 'project-settings' }));
        } else {
          setVocabulary(data);
        }
      }
    );
  }, []);

  const onChangeColor = (term: VocabularyTerm, color?: string) => {
    setUnsaved(true);
    setVocabulary(prev =>
      // Not that we don't allow the same label twice (even with different IDs)
      (prev || []).map(t => (t.label === term.label ? { ...t, color } : t))
    );
  };

  const onClear = () => {
    setClearState('saving');

    const prev = vocabulary;

    setVocabulary([]);

    clearProjectTagVocabulary(supabase, props.project.id)
      .then(() => {
        setClearState('success');
      })
      .catch(() => {
        setClearState('failed');
        props.onError(t('Error saving tag vocabulary.', { ns: 'project-settings' }));

        // Roll back
        setVocabulary(prev);
      });
  };

  const onSave = () => {
    setSaveState('saving');

    setProjectTagVocabulary(supabase, props.project.id, vocabulary || [])
      .then(() => {
        setSaveState('success');
        setUnsaved(false);
      })
      .catch((error) => {
        console.error(error);
        setSaveState('failed');
        props.onError(t('Error saving tag vocabulary.', { ns: 'project-settings' }));
      });
  };

  const onAddTerms = () => {
    const prev = vocabulary || [];

    const existingTermLabels = new Set(prev.map((t) => t.label));

    const toAdd = inputVal
      .split('\n')
      .map(line => {
        const [label, id] = line.split(',').map(str => str.trim());
        return { label, id } as VocabularyTerm;
      })
      .filter(t => t.label) // Remove empty
      .filter(term => !existingTermLabels.has(term.label)); // De-duplicate by label
      
    if (toAdd.length === 0) return;

    const next = [...prev, ...toAdd];

    setAddState('saving');
    setVocabulary(next);

    setProjectTagVocabulary(supabase, props.project.id, next)
      .then(() => {
        setAddState('success');
        setInputVal('');
      })
      .catch((error) => {
        console.error(error);
        setAddState('failed');

        // Roll back
        setVocabulary(prev);

        props.onError(t('Error saving tag vocabulary.', { ns: 'project-settings' }));
      });
  };

  return (
    <div className='tag-settings tab-container'>
      <h2>{t('Tagging Vocabulary', { ns: 'project-settings' })}</h2>

      <p>{t('You can pre-define a tagging vocabulary', { ns: 'project-settings' })}</p>

      {vocabulary &&
        (vocabulary.length === 0 ? (
          <div className='no-vocabulary'>{t('No tagging vocabulary', { ns: 'project-settings' })}</div>
        ) : (
          <div className='current-vocabulary'>
            <table>
              <thead>
                <tr>
                  <th>{t('Tag', { ns: 'common' })}</th>
                  <th>{t('ID', { ns: 'common' })}</th>
                  <th>{t('Color', { ns: 'common' })}</th>
                </tr>
              </thead>
              <tbody>
                {vocabulary.map((term) => (
                  <tr key={term.label}>
                    <td>{term.label}</td>
                    <td>{term.id}</td>
                    <td>
                      <TagColorPicker
                        color={term.color}
                        onChange={(color) => onChangeColor(term, color)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className='button-container'>
              <Button
                className='sm'
                busy={clearState === 'saving'}
                onClick={onClear}
              >
                <span>{t('Clear All', { ns: 'project-settings' })}</span>
              </Button>

              <Button
                disabled={!unsaved}
                className='sm primary'
                busy={saveState === 'saving'}
                onClick={onSave}
              >
                <span>{t('Save Changes', { ns: 'project-settings' })}</span>
              </Button>
            </div>
          </div>
        ))}

      <div>
        <p>{t('Add vocabulary terms below', { ns: 'project-settings' })}</p>

        <div>
          <textarea
            placeholder={t('VOCABULARY_PLACEHOLDER', { ns: 'project-settings' })}
            value={inputVal}
            onChange={(evt) => setInputVal(evt.target.value)}
          />
        </div>

        <div className='button-container'>
          <Button
            className='primary'
            busy={addState === 'saving'}
            onClick={onAddTerms}
          >
            {t('Add to Vocabulary', { ns: 'project-settings' })}
          </Button>
        </div>
      </div>
    </div>
  );
};
