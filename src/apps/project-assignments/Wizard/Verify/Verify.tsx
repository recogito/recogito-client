import { Check, Warning, X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

import './Verify.css';

interface VerifyProps {

  i18n: Translations;

  assignment: AssignmentSpec;

  onCancel(): void;

  onBack(): void;

  onCreateAssignment(): void;

}

export const Verify = (props: VerifyProps) => {

  const { t } = props.i18n;

  const { name, documents, team, description } = props.assignment;

  const isValid = name && documents.length > 0 && team.length > 0;
 
  return (
    <>
      <div className="row tab-verify">
        <section className="column">
          <h1>{t['Almost Ready!']}</h1>
          <p>
            {t['Verify and confirm this assignment.']}
          </p>
        </section>

        <section className="column">
          <ol>
            {!name ? (
              <li className="invalid">
                <X size={16} weight="bold" /> {t['Unnamed assignment.']}
              </li>
            ) : (
              <li className="valid">
                <Check size={16} weight="bold" /> {t['Name:']} {name}
              </li>
            )}

            {documents.length === 0 ? (
              <li className="invalid">
                <X size={16} weight="bold" /> {t['No documents.']}
              </li> 
            ) : (
              <li className="valid">
                <Check size={16} weight="bold" /> {documents.length === 1 ? (
                  t['1 document']
                ) : (
                  t['${n} documents'].replace('${n}', documents.length.toString())
                )}
              </li> 
            )}

            {team.length === 0 ? (
              <li className="invalid">
                <X size={16} weight="bold" /> {t['No team members.']}
              </li>
            ) : (
              <li className="valid">
                <Check size={16} weight="bold" /> {team.length === 1 ? (
                  t['1 team member']
                ) : (
                  t['${n} team members'].replace('${n}', team.length.toString())
                )}
              </li>
            )}

            {description ? (
              <li className="valid">
                <Check size={16} weight="bold" /> {t['Instructions provided.']}
              </li>
            ) : (
              <li className="warning">
                <Warning size={16} weight="bold" /> {t['Please consider adding instructions.']}
              </li>
            )}
          </ol>
        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>{t['Cancel']}</button>
  
        <button 
          onClick={props.onBack}>{t['Back']}</button>

        <button 
          className="primary"
          disabled={!isValid}
          onClick={props.onCreateAssignment}>{t['Create Assignment']}</button>
      </section>
    </>
  )

}