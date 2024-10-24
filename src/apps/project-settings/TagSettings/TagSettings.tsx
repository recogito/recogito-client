import { useEffect, useState } from 'react';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { clearProjectTagVocabulary, getProjectTagVocabulary, setProjectTagVocabulary } from '@backend/helpers';
import type { SaveState } from '@components/TinySaveIndicator';
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

  const [inputVal, setInputVal] = useState<string>('');

  const [vocabulary, setVocabulary] = useState<string[] | undefined>();

  const [addState, setAddState] = useState<SaveState>('idle');

  const [clearState, setClearState] = useState<SaveState>('idle');

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

  const onAddTags = () => {
    const prev = vocabulary;

    const existingTerms = new Set(prev || []);

    const toAdd = inputVal.split('\n')
      .filter(Boolean) // Remove empty string
      .filter(term => !existingTerms.has(term)); // De-duplicate
      
    if (toAdd.length === 0) return;

    const next = [...(vocabulary || []), ...toAdd];

    setAddState('saving');
    setVocabulary(next);

    setProjectTagVocabulary(supabase, props.project.id, next)
      .then(() => {
        setAddState('success');
        setInputVal('');
      }).catch((error) => {
        console.error(error);
        setAddState('failed');

        // Roll back
        setVocabulary(prev);

        props.onError(t['Error saving tag vocabulary.']);
      });
  };

  const clearVocabulary = () => {
    setClearState('saving');

    const prev = vocabulary;

    setVocabulary([]);

    clearProjectTagVocabulary(supabase, props.project.id)
      .then(() => {
        setClearState('success');
      })
      .catch(() => {
        setClearState('failed');
        props.onError(t['Error saving tag vocabulary.']);

        // Roll back
        setVocabulary(prev);
      });
  };


  return (
    <div className='tag-settings tab-container'>
      <h2>{t['Tagging Vocabulary']}</h2>

      <p>
        {t['You can pre-define a tagging vocabulary']}
      </p>

      {vocabulary && (
        vocabulary.length === 0 ? (
          <div className="no-vocabulary">
            {t['No tagging vocabulary']}
          </div>
        ) : (
          <div className="current-vocabulary">
            <table>
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Color</th>
                </tr>
              </thead>
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

            <div className="button-container">
              <Button 
                className="sm"
                busy={clearState === 'saving'}
                onClick={clearVocabulary}>
                <span>Clear All</span>
              </Button>

              <Button 
                disabled
                className="sm primary"
                busy={clearState === 'saving'}
                onClick={clearVocabulary}>
                <span>Save</span>
              </Button>
            </div>
          </div>
        )
      )}

      <div>
        <p>
          {t['Add vocabulary terms below']}
        </p>

        <div>
          <textarea 
            placeholder={'Tag A\nTag B\n...'} 
            value={inputVal}
            onChange={evt => setInputVal(evt.target.value)} />
        </div>

        <div className="button-container">
          <Button 
            className="primary"
            busy={addState === 'saving'}
            onClick={onAddTags}>
            {t['Add to Vocabulary']}
          </Button>
        </div>
      </div>
    </div>
  )

}