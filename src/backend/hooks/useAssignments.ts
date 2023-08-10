import { getTagsForContexts } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useEffect, useState } from 'react';
import type { Context, ExtendedProjectData } from 'src/Types';

<<<<<<< HEAD
export const useAssignments = (project: ExtendedProjectData, onError?: (arg: string) => void) => {

  const [assignments, setAssignments] = useState<Context[] | undefined>(undefined);
=======
export const useAssignments = (project: ExtendedProjectData) => {

  const [assignments, setAssignments] = useState<Context[]>([]);
>>>>>>> 44dd8e2 (Cleanup + some preparatory scaffolding for Assignments)

  useEffect(() => {
    const contextIds = project.contexts.map(c => c.id);

    getTagsForContexts(supabase, contextIds)
      .then(({ error, data }) => {
        if (error) {
          console.error(error);
<<<<<<< HEAD
          onError && onError('Error loading context tags');
=======
>>>>>>> 44dd8e2 (Cleanup + some preparatory scaffolding for Assignments)
        } else {
          // We now know the tags for all the contexts in this project.
          // Use this information to filter out the DEFAULT_CONTEXT

          // Note: for now, we know that all untagged contexts are
          // assignments
          const tagTargets = new Set(data.map(t => t.target_id));

          const assignments = project.contexts.filter(c => !tagTargets.has(c.id));
          if (assignments.length > 0)
            setAssignments(assignments);
<<<<<<< HEAD
          else
            setAssignments([]);
=======
>>>>>>> 44dd8e2 (Cleanup + some preparatory scaffolding for Assignments)
        } 
      })
  }, []);

  return assignments;

}