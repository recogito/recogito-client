import { useEffect, useState } from 'react';
import { createAssignmentContext, createLayerInContext } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Layer, ExtendedProjectData, Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

import './Progress.css';
import { Spinner } from '@components/Spinner';
import { AnimatedCheck } from '@components/AnimatedIcons';

interface ProgressProps {

  i18n: Translations;

  project: ExtendedProjectData;

  assignment: AssignmentSpec;

  onClose(): void;

}

type ProgressState = 'idle' | 'creating_assignment' | 'success' | 'failed';

export const Progress = (props: ProgressProps) => {

  const { name, description, documents, team } = props.assignment;

  const [state, setState] = useState<ProgressState>('idle');
  
  useEffect(() => {
    // TODO just a hack for now!
    const projectId = props.project.id;

    setTimeout(() => {
      setState('success');
    }, 1000);

    /* Step 1. Create a new context for this assignment
    createAssignmentContext(supabase, name, projectId)
      .then(({ error, data }) => {
        if (error) {
          console.error('ERROR creating Assignment Context', error);
        } else {
          const context = data;

          console.log('Succesfully created Assignment context', context);

          // Step 2. For each document, create a layer in this context
          documents.reduce((promise, document) => {
            return promise.then(layers => {
              return createLayerInContext(supabase, document.id, projectId, context.id)
                .then(layer => ([...layers, layer]))
            });
          }, Promise.resolve<Layer[]>([])).then(layers => {

            console.log('Successfully created Layers for each document', layers);

            // TODO add team members to layer groups
          }).catch(error => {
            console.log('ERROR creating Layers', error);
          })
        }
      });
      */
  }, []);

  return (
    <div className="creating-assignment">
      {state === 'idle' || state === 'creating_assignment' ? (
        <Spinner />
      ) : state === 'success' ? (
        <>
          <AnimatedCheck size={40} />
          <h1>Assignment created</h1>
          <button className="primary" onClick={props.onClose}>Ok</button>
        </>
      ) : (
        <h1>Something went wrong</h1>
      )}
    </div>
  )

}