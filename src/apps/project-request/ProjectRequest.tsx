import type { Translations, MyProfile } from 'src/Types';
import { requestJoinProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useState } from 'react';
import { Spinner } from '@components/Spinner';
import { RequestResultMessage } from './RequestResultMessage.tsx';
import { TopBar } from '@components/TopBar';
import './ProjectRequest.css';

interface ProjectRequestProps {
  i18n: Translations;

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

export const ProjectRequest = (props: ProjectRequestProps) => {
  const { t } = props.i18n;

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
    window.location.href = `/${props.i18n.lang}/projects`;
  };

  const url = new URLSearchParams(window.location.search);
  const projectName = url.get('project-name');

  if (!projectName) {
    window.location.href = `/${props.i18n.lang}/projects`;
    return <div />;
  }
  if (requestState === RequestState.INIT) {
    return (
      <>
        <TopBar i18n={props.i18n} onError={() => {}} me={props.user} />
        <div className='project-request-root'>
          {!props.isAlreadyMember ? (
            <>
              <div className='project-request-title'>
                {`${t['Do you wish to request membership for project']}: ${projectName}?`}
              </div>

              <div className='project-request-button-container'>
                <button
                  className='project-request-dialog-button-cancel'
                  onClick={() =>
                    (window.location.href = `/${props.i18n.lang}/projects`)
                  }
                >
                  {t['Cancel']}
                </button>
                <button
                  className='project-request-dialog-button-join'
                  onClick={handleRequest}
                >
                  {t['Request']}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='project-request-title'>
                {`${t['You are already a member of this project. You can navigate to it from the Projects screen > My Projects']} > ${projectName}`}
              </div>
              <div className='project-request-button-container'>
                <button
                  className='primary project-request-dialog-button-cancel'
                  onClick={() =>
                    (window.location.href = `/${props.i18n.lang}/projects/${props.projectId}`)
                  }
                >
                  {t['Go To Project']}
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
        <TopBar i18n={props.i18n} onError={() => {}} me={props.user} />
        <div className='project-request-spinner-container'>
          <Spinner />
        </div>
      </>
    );
  } else {
    return (
      <>
        <TopBar i18n={props.i18n} onError={() => {}} me={props.user} />
        <RequestResultMessage
          i18n={props.i18n}
          open={messageOpen}
          onClose={handleClose}
          state={requestState === RequestState.SUCCESS ? 'success' : 'failure'}
        />
      </>
    );
  }
};
