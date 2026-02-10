import { joinProject } from '@backend/helpers';
import type { ExtendedProjectData } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import clientI18next from 'src/i18n/client';
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

export const JoinProjectApp = (props: JoinProjectProps) => (
  <I18nextProvider i18n={clientI18next}>
    <JoinProject {...props} />
  </I18nextProvider>
);