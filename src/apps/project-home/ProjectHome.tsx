import { useEffect, useState } from 'react';
import { useProjectPolicies } from '@backend/hooks/usePolicies';
import { Toast, ToastProvider } from '@components/Toast';
import type { ToastContent } from '@components/Toast';
import { ProjectHeader } from './ProjectHeader';
import { TopBar } from '@components/TopBar';
import { BackButtonBar } from '@components/BackButtonBar';
import { useAssignments } from '@backend/hooks';
import type { AvailableLayers } from '@backend/Types';
import { DocumentsView } from './DocumentsView';
import { AssignmentsView } from './AssignmentsView';
import type {
  Context,
  Document,
  ExtendedProjectData,
  Invitation,
  JoinRequest,
  MyProfile,
  Translations,
} from 'src/Types';

import './ProjectHome.css';

export interface ProjectHomeProps {
  i18n: Translations;

  project: ExtendedProjectData;

  projects: ExtendedProjectData[];

  documents: Document[];

  invitations: Invitation[];

  requests: JoinRequest[];

  availableLayers: AvailableLayers[];

  user: MyProfile;
}

export const ProjectHome = (props: ProjectHomeProps) => {
  const { t } = props.i18n;

  const projectPolicies = useProjectPolicies(props.project.id);

  const isAdmin = projectPolicies?.get('projects').has('UPDATE');

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [tab, setTab] = useState<'documents' | 'assignments' | undefined>();
  const [documents, setDocuments] = useState<Document[]>(props.documents);
  const [project, setProject] = useState(props.project);

  const { assignments, setAssignments } = useAssignments(project);

  useEffect(() => {
    if (!tab && projectPolicies) {
      if (isAdmin || project.is_open_edit) {
        setTab('documents');
      } else {
        setTab('assignments');
      }
    }
  }, [isAdmin]);

  const handleSwitchTab = (tab: 'documents' | 'assignments') => {
    setTab(tab);
  };

  const handleGotoSettings = () => {
    window.location.href = `/${props.i18n.lang}/projects/${props.project.id}/settings`;
  };

  const handleGotoUsers = () => {
    window.location.href = `/${props.i18n.lang}/projects/${props.project.id}/collaboration`;
  };

  const onError = (error: string) => {
    setToast({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });
  };

  const updateDefaultContext = (
    project: ExtendedProjectData,
    documents: Document[]
  ) => {
    // Make sure we have all documents in the default context
    const defaultContextIdx = project.contexts.findIndex(
      (c) => c.is_project_default
    );
    if (defaultContextIdx > -1) {
      const defaultContext = { ...project.contexts[defaultContextIdx] };

      // Add any new documents
      documents.forEach((doc) => {
        const idx = defaultContext.context_documents.findIndex(
          (d) => d.document.id === doc.id
        );
        if (idx < 0) {
          // @ts-ignore
          defaultContext.context_documents.push({ document: doc });
        }
      });

      // Remove any documents that have been deleted
      defaultContext.context_documents.forEach((doc, index) => {
        const idx = documents.findIndex((d) => d.id === doc.document.id);
        if (idx < 0) {
          defaultContext.context_documents.splice(index, 1);
        }
      });

      const ret = [
        defaultContext,
        ...project.contexts.filter((c) => c.id !== defaultContext.id),
      ];
      return ret;
    }

    return project.contexts;
  };

  const onSetDocuments = (documents: Document[]) => {
    setDocuments(documents);
    const proj = {
      ...project,
      documents: documents,
      contexts: updateDefaultContext(project, documents),
    };
    setProject(proj);
    setAssignments(proj.contexts);
  };

  const removeDocumentFromAssignments = (document: Document) => {
    const copy: ExtendedProjectData = JSON.parse(JSON.stringify(props.project));
    copy.contexts.forEach((context: Context) => {
      context.context_documents = context.context_documents.filter(
        (cd) => cd.document.id !== document.id
      );
    });

    setProject(copy);
  };

  return (
    <>
      <TopBar
        invitations={props.invitations}
        i18n={props.i18n}
        onError={onError}
        projects={props.projects}
        me={props.user}
      />
      <BackButtonBar i18n={props.i18n} showBackToProjects={true} />
      <ProjectHeader
        i18n={props.i18n}
        isAdmin={isAdmin || false}
        name={props.project.name}
        description={props.project.description || ''}
        requests={props.requests}
        currentTab={isAdmin ? tab : undefined}
        onSwitchTab={handleSwitchTab}
        onGotoSettings={handleGotoSettings}
        onGotoUsers={handleGotoUsers}
        showTabs={!props.project.is_open_edit}
        isOpenJoin={Boolean(props.project.is_open_join)}
      />
      <div className='project-home' style={{ marginTop: isAdmin ? 240 : 190 }}>
        <ToastProvider>
          {tab === 'documents' ? (
            <DocumentsView
              isAdmin={isAdmin as boolean}
              documents={documents}
              i18n={props.i18n}
              project={props.project}
              setToast={setToast}
              user={props.user}
              setDocuments={onSetDocuments}
              onRemoveDocument={removeDocumentFromAssignments}
            />
          ) : tab === 'assignments' ? (
            <AssignmentsView
              i18n={props.i18n}
              project={project}
              me={props.user}
              documents={documents}
              assignments={assignments}
              setToast={setToast}
              isAdmin={isAdmin as boolean}
              setAssignments={setAssignments}
              availableLayers={props.availableLayers}
            />
          ) : (
            <div />
          )}
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
        </ToastProvider>
      </div>
    </>
  );
};
