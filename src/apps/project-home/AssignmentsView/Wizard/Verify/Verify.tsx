import { Check, Warning, X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

import './Verify.css';

interface VerifyProps {
  i18n: Translations;

  assignment: AssignmentSpec;

  isUpdate: boolean;

  onCancel(): void;

  onBack(): void;

  onSaveAssignment(): void;
}

export const Verify = (props: VerifyProps) => {
  const { t } = props.i18n;

  const { name, documents, team, description } = props.assignment;

  const isValid = name && documents.length > 0;

  return (
    <>
      <div className='row tab-verify'>
        <section className='column'>
          <h1>{t['Almost Ready!']}</h1>
          <p>{t['Verify and confirm this assignment.']}</p>
        </section>

        <section className='column'>
          <ol>
            {!name ? (
              <li className='invalid'>
                <X size={16} weight='bold' /> {t['Unnamed assignment.']}
              </li>
            ) : (
              <li className='valid'>
                <Check size={16} weight='bold' /> {t['Name:']} {name}
              </li>
            )}

            {documents.length === 0 ? (
              <li className='invalid'>
                <X size={16} weight='bold' /> {t['No documents.']}
              </li>
            ) : (
              <li className='valid'>
                <Check size={16} weight='bold' />{' '}
                {documents.length === 1
                  ? t['1 document']
                  : t['${n} documents'].replace(
                      '${n}',
                      documents.length.toString()
                    )}
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
                  {t['You have not added any team members.']}
                </>
              ) : (
                <>
                  <Check size={16} weight='bold' />{' '}
                  {props.assignment.assign_all_members
                    ? t[
                        'All current and future team members will be added to the assignment.'
                      ]
                    : t['${n} team members'].replace(
                        '${n}',
                        team.length.toString()
                      )}
                </>
              )}
            </li>

            {description ? (
              <li className='valid'>
                <Check size={16} weight='bold' /> {t['Instructions provided.']}
              </li>
            ) : (
              <li className='warning'>
                <Warning size={16} weight='bold' />{' '}
                {t['Please consider adding instructions.']}
              </li>
            )}
          </ol>
        </section>
      </div>

      <section className='wizard-nav'>
        <button onClick={props.onCancel}>{t['Cancel']}</button>

        <button onClick={props.onBack}>{t['Back']}</button>

        <button
          className='primary'
          disabled={!isValid}
          onClick={props.onSaveAssignment}
        >
          {props.isUpdate ? t['Update Assignment'] : t['Create Assignment']}
        </button>
      </section>
    </>
  );
};
