import type { Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';
import { Warning } from '@phosphor-icons/react';

import './General.css';

interface GeneralProps {
  i18n: Translations;

  assignment: AssignmentSpec;

  onChangeDescription(description: string): void;

  onChangeName(name: string): void;

  onCancel(): void;

  onBack(): void;

  onNext(): void;
}

export const General = (props: GeneralProps) => {
  const { t } = props.i18n;

  return (
    <>
      <div className='row tab-general'>
        <section className='column'>
          <h1>{t['Step']} 1</h1>
          <p>{t['Add a name and instructions for this assignment.']}</p>
        </section>

        <section className='column'>
          <label className='text-body-small-bold'>{t['Name']}</label>
          <input
            id='name'
            name='name'
            type='email'
            onChange={(evt) => props.onChangeName(evt.target.value)}
            value={props.assignment.name || ''}
            required
          />
          <label className='text-body-small-bold'>{t['Instructions']}</label>
          <textarea
            rows={10}
            value={props.assignment.description || ''}
            onChange={(evt) => props.onChangeDescription(evt.target.value)}
          />
          <div className='wizard-name-check'>
            {(!props.assignment.name || props.assignment.name.length === 0) && (
              <p className='hint warn'>
                <Warning size={16} /> {t['Unnamed assignment.']}
              </p>
            )}
          </div>
        </section>
      </div>
      <section className='wizard-nav'>
        <button onClick={props.onCancel}>{t['Cancel']}</button>

        <button onClick={props.onBack}>{t['Back']}</button>

        <button className='primary' onClick={props.onNext}>
          {t['Next']}
        </button>
      </section>
    </>
  );
};
