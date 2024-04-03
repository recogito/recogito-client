import { getTagsForContexts } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useEffect, useState } from 'react';
import type { Context, ExtendedProjectData } from 'src/Types';

export const useAssignments = (
  project: ExtendedProjectData,
  onError?: (arg: string) => void
) => {
  const [assignments, setAssignments] = useState<Context[] | undefined>(
    undefined
  );

  useEffect(() => {
    if (project.contexts.length > 0) setAssignments(project.contexts);
    else setAssignments([]);
  }, []);

  return { assignments, setAssignments };
};
