import { useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient.js';
import type { DocumentInContext } from 'src/Types';
import { CETEIcean } from '@recogito/react-text-annotator';

interface TEIContentProps {

  document: DocumentInContext;
  
  onLoad?(element: HTMLElement): void;

}

export const TEIContent = (props: TEIContentProps) => {

  const { document } = props;

  const [tei, setTEI] = useState<string | undefined>();

  useEffect(() => {
    supabase
      .storage
      .from(document.bucket_id!)
      .download(document.id)
      .then(({ data, error }) => {
        if (error)
          console.error(error);
        else
          data.text().then(setTEI);
      });
  }, []);

  return (
    <CETEIcean tei={tei} onLoad={props.onLoad} />
  )

}