import { useState } from 'react';
import { joinProject } from '@backend/helpers';
import type { ExtendedProjectData } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createClientI18n, type PreloadedI18nProps } from 'src/i18n/client';
import { useTranslation, I18nextProvider } from 'react-i18next';

import './JoinProject.css';

interface JoinProjectProps {

  project: ExtendedProjectData;
}

const JoinProject = (props: JoinProjectProps) => {
  const { t, i18n } = useTranslation(['dashboard-projects', 'common']);

  const handleJoin = () => {
    joinProject(supabase, props.project.id).then((resp) => {

      if (resp) {
        // redirect to project on success
        window.location.href = `/${i18n.language}/projects/${props.project.id}`;
      } else {
        window.location.href = `/${i18n.language}/projects`;
      }
    });
  }

  return (
    <main className='join-project-root' id='main'>

      <div className='join-project-title'>
        {`${t('Join', { ns: 'dashboard-projects' })}: ${['Project']} ${props.project.name}?`}
      </div>

      <div className='join-project-description'>
        {t('You are not a member message', { ns: 'dashboard-projects' })}
      </div>

      <div className='join-project-button-container'>
        <button
          className='join-project-dialog-button-cancel'
          onClick={() => (window.location.href = `/${i18n.language}/projects`)}
        >
          {t('Cancel', { ns: 'common' })}
        </button>
        <button
          className='join-project-dialog-button-join'
          onClick={handleJoin}
        >
          {t('Join', { ns: 'dashboard-projects' })}
        </button>
      </div>
    </main>
  )
}

export const JoinProjectApp = (
  { lng, resources, ...props }: JoinProjectProps & PreloadedI18nProps
) => {
  const [i18n] = useState(() => createClientI18n(lng, resources));

  return (
    <I18nextProvider i18n={i18n}>
      <JoinProject {...props} />
    </I18nextProvider>
  );
};