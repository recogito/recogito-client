import { useEffect, useState } from 'react';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { clearProjectTagVocabulary, getProjectTagVocabulary, setProjectTagVocabulary } from '@backend/helpers';
import type { SaveState } from '@components/TinySaveIndicator';
import { TagColorPicker } from './TagColorPicker';
import type { ExtendedProjectData, Translations, VocabularyTerm } from 'src/Types';

import './TagSettings.css';

interface TagSettingsProps {

  i18n: Translations;

  project: ExtendedProjectData;

  onError(message: string): void;

}

export const TagSettings = (props: TagSettingsProps) => {

  const { t } = props.i18n;

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
          props.onError(t['Error loading tag vocabulary']);
        } else {
          setVocabulary(data);
        }
      }
    );
  }, []);

  const onChangeColor = (term: VocabularyTerm, color?: string) => {
    setUnsaved(true);
    setVocabulary(vocab => vocab?.map(t => 
      t === term ? ({ label: t.label, color }) : t));
  }

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
        props.onError(t['Error saving tag vocabulary.']);

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
      }).catch((error) => {
        console.error(error);
        setSaveState('failed');
        props.onError(t['Error saving tag vocabulary.']);
      });
  }

  const onAddTerms = () => {
    const prev = vocabulary;

    const existingTerms = new Set(prev?.map(t => t.label) || []);

    const toAdd = inputVal.split('\n')
      .filter(Boolean) // Remove empty string
      .filter(term => !existingTerms.has(term)); // De-duplicate
      
    if (toAdd.length === 0) return;

    const next = [...(vocabulary || []), ...toAdd.map(label => ({ label }))];

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
                  <th>{t['Tag']}</th>
                  <th>{t['Color']}</th>
                </tr>
              </thead>
              <tbody>
                {vocabulary.map(term => (
                  <tr key={term.label}>
                    <td>{term.label}</td>

                    <td>
                      <TagColorPicker 
                        color={term.color} 
                        onChange={color => onChangeColor(term, color)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="button-container">
              <Button 
                className="sm"
                busy={clearState === 'saving'}
                onClick={onClear}>
                <span>{t['Clear All']}</span>
              </Button>

              <Button 
                disabled={!unsaved}
                className="sm primary"
                busy={saveState === 'saving'}
                onClick={onSave}>
                <span>{t['Save']}</span>
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
            onClick={onAddTerms}>
            {t['Add to Vocabulary']}
          </Button>
        </div>
      </div>
    </div>
  )

}