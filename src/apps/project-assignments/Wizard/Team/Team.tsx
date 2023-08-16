import type { Translations } from 'src/Types';

interface TeamProps {

  i18n: Translations;

  onBack(): void;

  onNext(): void;

}

export const Team = (props: TeamProps) => {

  return (
    <>
      <div className="row">
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
        <button>Cancel</button>
        <button onClick={props.onBack}>Back</button>
        <button 
          className="primary"
          onClick={props.onNext}>Next</button>
      </section>
    </>
  )

}