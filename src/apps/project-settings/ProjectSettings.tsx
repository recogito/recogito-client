import { useState } from 'react';
import type { Translations } from 'src/Types';

import './ProjectSettings.css';

interface ProjectSettingsProps {

  i18n: Translations;

};

export const ProjectSettings = (props: ProjectSettingsProps) => {

  const { t } = props.i18n;

  const [vocabulary, setVocabulary] = useState<string[]>([]);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.target;
    setVocabulary(value.split('\n'));
  }

  return (
    <div className="project-collaboration">
      <h1>{t['Project Settings']}</h1>

      <h2>Tagging Vocabulary</h2>
      <p>
        One per line...
      </p>
      <textarea 
        value={vocabulary.join('\n')} 
        onChange={onChange} />
    </div>
  )

}