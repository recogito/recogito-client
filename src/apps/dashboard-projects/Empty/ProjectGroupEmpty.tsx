import { useTranslation } from 'react-i18next';
import './ProjectGroupEmpty.css';

export const ProjectGroupEmpty = () => {
  const { t } = useTranslation(['dashboard-projects']);

  return (
    <main className='dashboard-project-group-empty'>
      <div className='container'>
        <h1 className='dashboard-projects-tagline'>
          {t("This group doesn't have any project files.", {
            ns: 'dashboard-projects',
          })}
        </h1>
      </div>
    </main>
  );
};
