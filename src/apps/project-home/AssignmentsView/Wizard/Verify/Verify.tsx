import { Check, Warning, X } from '@phosphor-icons/react';
import type { AssignmentSpec } from '../AssignmentSpec';
import { useTranslation } from 'react-i18next';

import './Verify.css';

interface VerifyProps {
  assignment: AssignmentSpec;

  isUpdate: boolean;

  onCancel(): void;

  onBack(): void;

  onSaveAssignment(): void;
}

export const Verify = (props: VerifyProps) => {
  const { t } = useTranslation(['project-assignments', 'common']);

  const { name, documents, team, description } = props.assignment;

  const isValid = name && documents.length > 0;

  return (
    <>
      <div className='row tab-verify'>
        <section className='column'>
          <h1>{t('Almost Ready!', { ns: 'project-assignments' })}</h1>
          <p>
            {t('Verify and confirm this assignment.', {
              ns: 'project-assignments',
            })}
          </p>
        </section>

        <section className='column'>
          <ol>
            {!name ? (
              <li className='invalid'>
                <X size={16} weight='bold' />{' '}
                {t('Unnamed assignment.', { ns: 'project-assignments' })}
              </li>
            ) : (
              <li className='valid'>
                <Check size={16} weight='bold' />{' '}
                {t('Name:', { ns: 'project-assignments' })} {name}
              </li>
            )}

            {documents.length === 0 ? (
              <li className='invalid'>
                <X size={16} weight='bold' />{' '}
                {t('No documents.', { ns: 'project-assignments' })}
              </li>
            ) : (
              <li className='valid'>
                <Check size={16} weight='bold' />{' '}
                {t('documentsCount', {
                  ns: 'project-assignments',
                  count: documents.length,
                })}
              </li>
            )}

            <li
              className={
                team.length || props.assignment.assign_all_members
                  ? 'valid'
                  : 'warning'
              }
            >
              {team.length === 0 && !props.assignment.assign_all_members ? (
                <>
                  <Warning size={16} weight='bold' />
                  {t('You have not added any team members.', {
                    ns: 'project-assignments',
                  })}
                </>
              ) : (
                <>
                  <Check size={16} weight='bold' />{' '}
                  {props.assignment.assign_all_members
                    ? t(
                        'All current and future team members will be added to the assignment.',
                        { ns: 'project-assignments' }
                      )
                    : t('teamMembersCount', {
                        ns: 'project-assignments',
                        count: team.length,
                      })}
                </>
              )}
            </li>

            {description ? (
              <li className='valid'>
                <Check size={16} weight='bold' />{' '}
                {t('Instructions provided.', { ns: 'project-assignments' })}
              </li>
            ) : (
              <li className='warning'>
                <Warning size={16} weight='bold' />{' '}
                {t('Please consider adding instructions.', {
                  ns: 'project-assignments',
                })}
              </li>
            )}
          </ol>
        </section>
      </div>

      <section className='wizard-nav'>
        <button onClick={props.onCancel}>
          {t('Cancel', { ns: 'common' })}
        </button>

        <button onClick={props.onBack}>
          {t('Back', { ns: 'project-assignments' })}
        </button>

        <button
          className='primary'
          disabled={!isValid}
          onClick={props.onSaveAssignment}
        >
          {props.isUpdate
            ? t('Update Assignment', { ns: 'project-assignments' })
            : t('Create Assignment', { ns: 'project-assignments' })}
        </button>
      </section>
    </>
  );
};
