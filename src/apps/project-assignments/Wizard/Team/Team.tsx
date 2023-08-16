import type { Translations } from 'src/Types';

interface TeamProps {

  i18n: Translations;

  onCancel(): void;

  onBack(): void;

  onNext(): void;

}

export const Team = (props: TeamProps) => {

  return (
    <>
      <div className="row tab-team">
        <section className="column">
          <h1>Step 2</h1>
          <p>
            Add people to the assignment.
          </p>
        </section>

        <section className="column">

        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>Cancel</button>

        <button
          onClick={props.onBack}>Back</button>

        <button 
          className="primary"
          onClick={props.onNext}>Next</button>
      </section>
    </>
  )

}