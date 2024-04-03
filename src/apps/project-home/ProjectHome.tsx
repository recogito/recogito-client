import { useEffect, useState } from 'react';
import { useProjectPolicies } from '@backend/hooks/usePolicies';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { ProjectHeader } from './ProjectHeader';

import type {
  Document,
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Translations,
} from 'src/Types';

import './ProjectHome.css';
import { TopBar } from '@components/TopBar';
import { BackButtonBar } from '@components/BackButtonBar';
import { DocumentsView } from './DocumentsView';
import { AssignmentsView } from './AssignmentsView';

export interface ProjectHomeProps {
  i18n: Translations;

  project: ExtendedProjectData;

  projects: ExtendedProjectData[];

  documents: Document[];

  invitations: Invitation[];

  user: MyProfile;
}

export const ProjectHome = (props: ProjectHomeProps) => {

  const projectPolicies = useProjectPolicies(props.project.id);

  const isAdmin = projectPolicies?.get('projects').has('UPDATE');

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [tab, setTab] = useState<'documents' | 'assignments' | undefined>();

  const { t } = props.i18n;

  useEffect(() => {
    if (!tab && projectPolicies) {
      if (isAdmin) {
        setTab('documents');
      } else {
        setTab('assignments')
      }
    }
  }, [isAdmin])

  const handleSwitchTab = (tab: 'documents' | 'assignments') => {
    setTab(tab);
  }

  const handleGotoSettings = () => {
    window.location.href = `/${props.i18n.lang}/projects/${props.project.id}/settings`;
  }

  const handleGotoUsers = () => {
    window.location.href = `/${props.i18n.lang}/projects/${props.project.id}/collaboration`;
  }

  const onError = (error: string) => {
    setToast({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });
  };

  return (
    <>
      <TopBar invitations={props.invitations} i18n={props.i18n} onError={onError} projects={props.projects} me={props.user} />
      <BackButtonBar i18n={props.i18n} showBackToProjects={true} />
      <ProjectHeader
        i18n={props.i18n} isAdmin={isAdmin || false}
        name={props.project.name}
        description={props.project.description || ''}
        currentTab={isAdmin ? tab : undefined}
        onSwitchTab={handleSwitchTab}
        onGotoSettings={handleGotoSettings}
        onGotoUsers={handleGotoUsers}
      />
      <div className='project-home'>
        <ToastProvider>
          {tab === 'documents' ?
            <DocumentsView
              isAdmin={isAdmin as boolean}
              documents={props.documents}
              i18n={props.i18n}
              project={props.project}
              setToast={setToast}
              user={props.user}
            />
            :
            <AssignmentsView
              i18n={props.i18n}
              project={props.project}
              me={props.user}
              documents={props.documents}
              setToast={setToast}
              isAdmin={isAdmin as boolean}
            />
          }
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
        </ToastProvider >
      </div >
    </>
  );
};
