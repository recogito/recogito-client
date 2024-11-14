import type { Translations } from 'src/Types.ts';
import  './ProjectGroupEmpty.css';

interface Props {
  i18n: Translations
}

export const ProjectGroupEmpty = (props: Props) => {
  const { t } = props.i18n;

  return (
    <main className='dashboard-project-group-empty'>
      <div className='container'>
        <h1 className='dashboard-projects-tagline'>
          { t['This group doesn\'t have any project files.'] }
        </h1>
      </div>
    </main>
  );
};