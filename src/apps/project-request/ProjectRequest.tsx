import type { MyProfile } from 'src/Types';
import { requestJoinProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useState } from 'react';
import { Spinner } from '@components/Spinner';
import { RequestResultMessage } from './RequestResultMessage.tsx';
import { TopBar } from '@components/TopBar';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';
import './ProjectRequest.css';

interface ProjectRequestProps {

  projectId: string;

  isAlreadyMember: boolean;

  user: MyProfile;
}

enum RequestState {
  INIT = 'INIT',
  REQUESTING = 'REQUESTING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

const ProjectRequest = (props: ProjectRequestProps) => {
  const { t, i18n } = useTranslation(['project-request', 'common']);

  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.INIT
  );

  const [messageOpen, setMessageOpen] = useState(false);

  const handleRequest = () => {
    setRequestState(RequestState.REQUESTING);
    requestJoinProject(supabase, props.projectId).then((resp) => {
      if (resp) {
        setRequestState(RequestState.SUCCESS);
      } else {
        setRequestState(RequestState.FAILURE);
      }

      setMessageOpen(true);
    });
  };

  const handleClose = () => {
    setMessageOpen(false);
    window.location.href = `/${i18n.language}/projects`;
  };

  const url = new URLSearchParams(window.location.search);
  const projectName = url.get('project-name');

  if (!projectName) {
    window.location.href = `/${i18n.language}/projects`;
    return <div />;
  }
  if (requestState === RequestState.INIT) {
    return (
      <>
        <TopBar onError={() => {}} me={props.user} />
        <div className='project-request-root'>
          {!props.isAlreadyMember ? (
            <>
              <div className='project-request-title'>
                {`${t('Do you wish to request membership for project', { ns: 'project-request' })}: ${projectName}?`}
              </div>

              <div className='project-request-button-container'>
                <button
                  className='project-request-dialog-button-cancel'
                  onClick={() =>
                    (window.location.href = `/${i18n.language}/projects`)
                  }
                >
                  {t('Cancel', { ns: 'common' })}
                </button>
                <button
                  className='project-request-dialog-button-join'
                  onClick={handleRequest}
                >
                  {t('Request', { ns: 'project-request' })}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='project-request-title'>
                {`${t('You are already a member of this project. You can navigate to it from the Projects screen > My Projects', { ns: 'project-request' })} > ${projectName}`}
              </div>
              <div className='project-request-button-container'>
                <button
                  className='primary project-request-dialog-button-cancel'
                  onClick={() =>
                    (window.location.href = `/${i18n.language}/projects/${props.projectId}`)
                  }
                >
                  {t('Go To Project', { ns: 'project-request' })}
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  } else if (requestState === RequestState.REQUESTING) {
    return (
      <>
        <TopBar onError={() => {}} me={props.user} />
        <div className='project-request-spinner-container'>
          <Spinner />
        </div>
      </>
    );
  } else {
    return (
      <>
        <TopBar onError={() => {}} me={props.user} />
        <RequestResultMessage
          open={messageOpen}
          onClose={handleClose}
          state={requestState === RequestState.SUCCESS ? 'success' : 'failure'}
        />
      </>
    );
  }
};

export const ProjectRequestApp = (props: ProjectRequestProps) => (
  <I18nextProvider i18n={clientI18next}>
    <ProjectRequest {...props} />
  </I18nextProvider>
);
