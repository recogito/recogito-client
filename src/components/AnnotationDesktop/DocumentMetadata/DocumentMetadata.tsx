import { EmptyMetadata } from '@components/AnnotationDesktop/DocumentMetadata/EmptyMetadata.tsx';
import { MetadataList } from '@components/AnnotationDesktop/DocumentMetadata/MetadataList';
import { MetadataModal } from '@components/MetadataModal';
import { PencilSimple } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Document, IIIFMetadata } from 'src/Types';
import './DocumentMetadata.css';

interface Props {
  allowEdit?: boolean;
  document: Document;
  metadata?: IIIFMetadata[];
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

  const external = useMemo(
    () =>
      props.metadata?.map((i) => ({
        label: Object.values(i.label).flat().at(0),
        value: Object.values(i.value).flat().at(0),
      })),
    [props.metadata]
  );

  const hasMedata = useMemo(
    () => internal && internal?.length > 0 || external && external?.length > 0,
    [external, internal]
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
              <PencilSimple />
            </button>
          )}
        </div>
      )}

      {internal && internal?.length > 0 && <MetadataList items={internal} />}

      {!(internal && internal.length > 0) && (
        <EmptyMetadata />
      )}

      {external && external?.length > 0 && (
        <>
          <div className='document-metadata-header'>
            <h2>{t('External', { ns: 'annotation-common' })}</h2>
          </div>
          <MetadataList items={external} />
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
