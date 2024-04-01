import type { Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

import './Instructions.css';

interface InstructionsProps {

  i18n: Translations;

  assignment: AssignmentSpec;

  onChange(description: string): void;

  onCancel(): void;

  onBack(): void;

  onNext(): void;

}

export const Instructions = (props: InstructionsProps) => {

  const { t } = props.i18n;

  return (
    <>
      <div className="row tab-instructions">
        <section className="column">
          <h1>{t['Step']}  3</h1>
          <p>
            {t['Add a message']}
          </p>
        </section>

        <section className="column">
          <textarea 
            rows={10} 
            value={props.assignment.description || ''} 
            onChange={evt => props.onChange(evt.target.value)}/>
        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>{t['Cancel']}</button>

        <button
          onClick={props.onBack}>{t['Back']}</button>

        <button 
          className="primary"
          onClick={props.onNext}>{t['Next']}</button>
      </section>
    </>
  )

}