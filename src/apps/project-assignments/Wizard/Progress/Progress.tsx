import { useEffect } from 'react';
import { createAssignmentContext, createLayerInContext } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Layer, ExtendedProjectData, Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

import './Progress.css';

interface ProgressProps {

  i18n: Translations;

  project: ExtendedProjectData;

  assignment: AssignmentSpec;

}

export const Progress = (props: ProgressProps) => {

  const { name, description, documents, team } = props.assignment;
  
  useEffect(() => {
    // TODO just a hack for now!
    const projectId = props.project.id;

    // Step 1. Create a new context for this assignment
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
  }, []);

  return (
    <div className="creating-assignment">
      Please wait while we're creating your assignment.
    </div>
  )

}