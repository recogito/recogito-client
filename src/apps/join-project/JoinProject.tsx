import { joinProject } from '@backend/helpers';
import type { ExtendedProjectData, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';

import './JoinProject.css';

interface JoinProjectProps {
  i18n: Translations;

  project: ExtendedProjectData;
}

export const JoinProject = (props: JoinProjectProps) => {
  const { t } = props.i18n;

  const handleJoin = () => {
    joinProject(supabase, props.project.id).then((resp) => {

      if (resp) {
        const url = new URLSearchParams(window.location.search);
        const redirectUrl = url.get('redirect-to');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = `/${props.i18n.lang}/projects`;
        }
      } else {
        window.location.href = `/${props.i18n.lang}/projects`;
      }
    });
  }

  return (
    <div className='join-project-root'>

      <div className='join-project-title'>
        {`${t['Join']} ${['Project']} ${props.project.name}?`}
      </div>

      <div className='join-project-description'>
        {t['You are not a member message']}
      </div>

      <div className='join-project-button-container'>
        <button
          className='join-project-dialog-button-cancel'
          onClick={() => (window.location.href = `/${props.i18n.lang}/projects`)}
        >
          {t['Cancel']}
        </button>
        <button
          className='join-project-dialog-button-join'
          onClick={handleJoin}
        >
          {t['Join']}
        </button>
      </div>
    </div>
  )
}