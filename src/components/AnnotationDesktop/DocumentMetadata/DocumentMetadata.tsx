import { EmptyMetadata } from '@components/AnnotationDesktop/DocumentMetadata/EmptyMetadata.tsx';
import { MetadataList } from '@components/AnnotationDesktop/DocumentMetadata/MetadataList';
import { MetadataModal } from '@components/MetadataModal';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CozyMetadata } from 'cozy-iiif';
import type { Document } from 'src/Types';
import './DocumentMetadata.css';

interface Props {
  allowEdit?: boolean;
  document: Document;
  metadata?: CozyMetadata[];
  onError(error: string): void;
  onUpdated(document: Document): void;
}

export const DocumentMetadata = (props: Props) => {
  const [modal, setModal] = useState<boolean>(false);

  const { t } = useTranslation(['annotation-common', 'a11y']);

  const internal = useMemo(
    () => props.document.meta_data?.meta,
    [props.document]
  );

  const hasMedata = useMemo(
    () =>
      (internal && internal?.length > 0) ||
      (props.metadata && props.metadata?.length > 0),
    [props.metadata, internal]
  );

  if (!(hasMedata || props.allowEdit)) {
    return <EmptyMetadata />;
  }

  return (
    <div className='document-metadata'>
      {(props.allowEdit || (internal && internal.length > 0)) && (
        <div className='document-metadata-header'>
          <h2>{t('Internal', { ns: 'annotation-common' })}</h2>
          {props.allowEdit && (
            <button
              className='icon-only primary'
              onClick={() => setModal(true)}
              aria-label={t('edit document metadata', { ns: 'a11y' })}
            >
              <PencilSimpleIcon />
            </button>
          )}
        </div>
      )}

      {internal && internal?.length > 0 && <MetadataList items={internal} />}

      {!(internal && internal.length > 0) && <EmptyMetadata />}

      {props.metadata && props.metadata?.length > 0 && (
        <>
          <div className='document-metadata-header'>
            <h2>{t('External', { ns: 'annotation-common' })}</h2>
          </div>
          <MetadataList items={props.metadata} />
        </>
      )}

      <MetadataModal
        document={props.document}
        open={modal}
        onClose={() => setModal(false)}
        onError={props.onError}
        onUpdated={props.onUpdated}
      />
    </div>
  );
};
