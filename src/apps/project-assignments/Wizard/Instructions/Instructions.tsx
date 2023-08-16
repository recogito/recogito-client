import type { Translations } from 'src/Types';

import './Instructions.css';

interface InstructionsProps {

  i18n: Translations;

  onBack(): void;

}

export const Instructions = (props: InstructionsProps) => {

  return (
    <>
      <div className="row tab-instructions">
        <section className="column">
          <h1>Step 3</h1>
          <p>
            Provide additional instructions to the team (optional).
          </p>
        </section>

        <section className="column">
          <textarea rows={10} />
        </section>
      </div>

      <section className="wizard-nav">
        <button>Cancel</button>
        <button onClick={props.onBack}>Back</button>
        <button 
          className="primary">Done</button>
      </section>
    </>
  )


}