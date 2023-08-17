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

  const { name, documents, team, description } = props.assignment;
 
  return (
    <>
      <div className="row tab-verify">
        <section className="column">
          <h1>Almost Ready!</h1>
          <p>
            Verify and confirm this assignment.
          </p>
        </section>

        <section className="column">
          <ol>
            {name === 'Untitled Assignment' ? (
              <li className="invalid">
                <X size={16} weight="bold" /> Unnamed assignment. Please add a name, so this assignment is easier to find.
              </li>
            ) : (
              <li className="valid">
                <Check size={16} weight="bold" /> Name: {name}
              </li>
            )}

            {documents.length === 0 ? (
              <li className="invalid">
                <X size={16} weight="bold" /> No documents. Please select at least one document for the assignment.
              </li> 
            ) : (
              <li className="valid">
                <Check size={16} weight="bold" /> {documents.length === 1 ? (
                  <>1 document</>
                ) : (
                  <>{documents.length} documents</>
                )}
              </li> 
            )}

            {team.length === 0 ? (
              <li className="invalid">
                <X size={16} weight="bold" /> No team members 
              </li>
            ) : (
              <li className="valid">
                <Check size={16} weight="bold" /> {team.length === 1 ? (
                  <>1 team member</>
                ) : (
                  <>{team.length} team members</>
                )}
              </li>
            )}

            {description ? (
              <li className="valid">
                <Check size={16} weight="bold" /> Instructions
              </li>
            ) : (
              <li className="warning">
                <Warning size={16} weight="bold" /> No instructions
              </li>
            )}
          </ol>
        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>Cancel</button>
  
        <button 
          onClick={props.onBack}>Back</button>

        <button 
          className="primary"
          onClick={props.onCreateAssignment}>Create Assignment</button>
      </section>
    </>
  )

}