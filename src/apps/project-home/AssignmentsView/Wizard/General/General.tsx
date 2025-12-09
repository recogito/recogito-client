import type { AssignmentSpec } from '../AssignmentSpec';
import { Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import './General.css';

interface GeneralProps {

  assignment: AssignmentSpec;

  onChangeDescription(description: string): void;

  onChangeName(name: string): void;

  onCancel(): void;

  onBack(): void;

  onNext(): void;
}

export const General = (props: GeneralProps) => {
  const { t } = useTranslation(['project-assignments', 'common', 'a11y']);

  return (
    <>
      <div className='row tab-general'>
        <section className='column'>
          <h1>{t('Step', { ns: 'project-assignments' })} 1</h1>
          <p>{t('Add a name and instructions for this assignment.', { ns: 'project-assignments' })}</p>
        </section>

        <section className='column'>
          <label className='text-body-small-bold'>{t('Name', { ns: 'common' })}</label>
          <input
            id='name'
            name='name'
            type='email'
            onChange={(evt) => props.onChangeName(evt.target.value)}
            value={props.assignment.name || ''}
            aria-label={t('name your assignment', { ns: 'a11y' })}
            required
          />
          <label className='text-body-small-bold'>{t('Instructions', { ns: 'project-assignments' })}</label>
          <textarea
            rows={10}
            value={props.assignment.description || ''}
            onChange={(evt) => props.onChangeDescription(evt.target.value)}
            aria-label={t('enter instructions for this assignment', { ns: 'a11y' })}
          />
          <div className='wizard-name-check'>
            {(!props.assignment.name || props.assignment.name.length === 0) && (
              <p className='hint warn'>
                <Warning size={16} /> {t('Unnamed assignment.', { ns: 'project-assignments' })}
              </p>
            )}
          </div>
        </section>
      </div>
      <section className='wizard-nav'>
        <button onClick={props.onCancel}>{t('Cancel', { ns: 'common' })}</button>

        <button onClick={props.onBack}>{t('Back', { ns: 'project-assignments' })}</button>

        <button className='primary' onClick={props.onNext}>
          {t('Next', { ns: 'project-assignments' })}
        </button>
      </section>
    </>
  );
};
