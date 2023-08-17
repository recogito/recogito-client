import { Check, Warning, X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './Verify.css';

interface VerifyProps {

  i18n: Translations;

  onCancel(): void;

  onBack(): void;

}

export const Verify = (props: VerifyProps) => {
 
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
            <li className="valid">
              <Check size={16} weight="bold" /> 2 Documents 
            </li>

            <li className="invalid">
              <X size={16} weight="bold" /> No team members 
            </li>

            <li className="warning">
              <Warning size={16} weight="bold" /> No instructions
            </li>
          </ol>
        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>Cancel</button>
  
        <button 
          onClick={props.onBack}>Back</button>

        <button 
          className="primary">Done</button>
      </section>
    </>
  )

}