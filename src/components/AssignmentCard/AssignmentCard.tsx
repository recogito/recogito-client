import { useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { listDocumentsInContext } from '@backend/helpers';
import type { DocumentInContext, Context, Translations } from 'src/Types';

interface AssignmentCardProps {

  i18n: Translations;

  // Just temporary, for hacking/testing
  assignment: Context;

}

export const AssignmentCard = (props: AssignmentCardProps) => {

  const { assignment } = props;

  const { lang } = props.i18n;

  const [documents, setDocuments] = useState<DocumentInContext[]>();

  useEffect(() => {
    // Temporary hack
    listDocumentsInContext(supabase, assignment.id)
      .then(({ data, error }) => setDocuments(data));
  }, []);

  return (
    <article className="assignment-card">
      <h1>{assignment.name}</h1>
      {documents?.map(document => (
        <a key={document.id} href={`/${lang}/annotate/${assignment.id}/${document.id}`}>{document.name}</a>
      ))}
    </article>
  )

}