import { useState } from 'react';
import { RocketLaunch } from '@phosphor-icons/react';
import type { ExtendedProjectData } from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { CreateProjectDialog } from '@components/CreateProjectDialog';
import { useTranslation } from 'react-i18next';

export interface ProjectsEmptyProps {

  canCreateProjects: boolean;

  onProjectCreated(project: ExtendedProjectData): void;

  onError(error: string): void;
}

export const ProjectsEmpty = (props: ProjectsEmptyProps) => {
  const { canCreateProjects } = props;

  const { t, i18n } = useTranslation(['dashboard-projects']);

  const [busy, setBusy] = useState(false);

  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const handleSaveProject = (
    name: string,
    description: string,
    openJoin: boolean,
    openEdit: boolean
  ) => {
    setBusy(true);

    supabase
      .rpc('create_project_rpc', {
        _description: description,
        _is_open_edit: openEdit,
        _is_open_join: openJoin,
        _name: name,
      })
      .then(({ data, error }) => {
        if (error) {
          setBusy(false);
          props.onError('Something went wrong');
        } else {
          setBusy(false);
          props.onProjectCreated(data);
          window.location.href = `/${i18n.language}/projects/${data[0].id}`;
        }
      });
  };

  return (
    <main className='dashboard-projects-empty'>
      <div className='container'>
        <h1 className='dashboard-projects-tagline'>
          {canCreateProjects
            ? t('Empty Dashboard? Infinite possibilities!', { ns: 'dashboard-projects' })
            : t('Empty Dashboard? Bear with us!', { ns: 'dashboard-projects' })}
        </h1>

        <div className='dashboard-projects-empty-cta'>
          {canCreateProjects ? (
            <Button
              className='primary lg'
              onClick={() => setCreateProjectOpen(true)}
              busy={busy}
            >
              <RocketLaunch size={20} />{' '}
              <span>{t('Start Your First Annotation Project', { ns: 'dashboard-projects' })}</span>
            </Button>
          ) : (
            <p className='no-creator-rights'>
              {t("You don't have creator rights", { ns: 'dashboard-projects' })}{' '}
            </p>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onSaveProject={handleSaveProject}
      />
    </main>
  );
};
