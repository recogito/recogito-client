import { useEffect, useState } from 'react';
import type { Context, ExtendedProjectData } from 'src/Types';

export const useAssignments = (project: ExtendedProjectData) => {
  const [assignments, setAssignments] = useState<Context[]>([]);

  useEffect(() => {
    if (project.contexts.length > 0) {
      setAssignments(project.contexts);
    } else {
      setAssignments([]);
    }
  }, []);

  return { assignments, setAssignments };
};
