import type { Document, Translations } from 'src/Types';
import type { AssignmentSpec } from '@apps/project-home/AssignmentsView/Wizard/AssignmentSpec';
import type { AvailableLayers } from '@backend/Types';
import * as Accordion from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CaretDown } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, Article, Image } from '@phosphor-icons/react';
import classNames from 'classnames';

import './Layers.css';

interface LayersProps {
  i18n: Translations;

  assignment: AssignmentSpec;

  availableLayers: AvailableLayers[];

  documents: Document[];

  onChange(op: 'add' | 'remove', documentId: string, layerId: string): void;

  onCancel(): void;

  onBack(): void;
  onNext(): void;
}

interface LayersInAssignment extends AvailableLayers {
  selected: boolean;
}

type DocumentLayers = {
  [document: string]: {
    documentName: string;
    contentType?: string;
    layers: LayersInAssignment[];
  };
};

// eslint-disable-next-line react/display-name
const AccordionTrigger = React.forwardRef(
  // @ts-ignore
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className='accordion-header'>
      <Accordion.Trigger
        className={classNames('accordion-trigger', className)}
        {...props}
        // @ts-ignore
        ref={forwardedRef}
      >
        <CaretDown className='accordion-chevron' aria-hidden />
        {children}
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

// eslint-disable-next-line react/display-name
const AccordionContent = React.forwardRef(
  // @ts-ignore
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={classNames('accordion-content', className)}
      {...props}
      // @ts-ignore
      ref={forwardedRef}
    >
      <div className='accordion-content-text'>{children}</div>
    </Accordion.Content>
  )
);

export const Layers = (props: LayersProps) => {
  const [documentLayers, setDocumentLayers] = useState<
    DocumentLayers | undefined
  >();

  const { t } = props.i18n;

  useEffect(() => {
    if (props.availableLayers && props.documents) {
      const available: DocumentLayers = {};
      props.availableLayers
        .filter((a) => a.context_id !== props.assignment.id && a.is_active)
        .forEach((l) => {
          if (
            l.context_id !== props.assignment.id ||
            (l.context_id === props.assignment.id && !l.is_active)
          ) {
            const docIdx = props.assignment.documents.findIndex(
              (d) => d.id === l.document_id
            );
            const doc = props.documents.find((d) => d.id === l.document_id);
            if (doc && docIdx > -1) {
              const assignmentDoc = props.assignment.documents.find(
                (d) => d.id === doc.id
              );

              if (!available[l.document_id]) {
                available[l.document_id] = {
                  contentType: doc.content_type,
                  documentName: doc.name,
                  layers: [],
                };
              }

              const selected = assignmentDoc
                ? !!assignmentDoc.layers.find(
                    (layer) => l.layer_id === layer.id
                  )
                : false;

              available[l.document_id].layers.push({
                ...l,
                selected: selected,
              });
            }
          }
        });

      setDocumentLayers(available);
    }
  }, [props.availableLayers, props.documents, props.assignment]);

  if (documentLayers) {
    const display: any[] = [];
    Object.keys(documentLayers).forEach((l: any) => {
      const val = documentLayers[l];
      const isAllSelected = val.layers.reduce(
        (accumulator, currentValue) =>
          accumulator ? currentValue.selected : accumulator,
        true
      );
      display.push(
        <Accordion.Item
          className='accordion-item'
          value={val.documentName}
          key={val.documentName}
        >
          {/* @ts-ignore */}
          <AccordionTrigger>
            <div className='layer-document-name-container'>
              {' '}
              {val.contentType ? <Article size={16} /> : <Image size={16} />}
              <div className='layer-document-name-text'>{val.documentName}</div>
            </div>
          </AccordionTrigger>
          {/* @ts-ignore */}
          <AccordionContent>
            <div className='layers-checkbox-select-all'>
              <Checkbox.Root
                className='checkbox-root'
                checked={isAllSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    val.layers.forEach((layer) => {
                      if (!layer.selected) {
                        props.onChange(
                          'add',
                          layer.document_id,
                          layer.layer_id
                        );
                      }
                    });
                  } else {
                    val.layers.forEach((layer) => {
                      if (layer.selected) {
                        props.onChange(
                          'remove',
                          layer.document_id,
                          layer.layer_id
                        );
                      }
                    });
                  }
                }}
              >
                <Checkbox.Indicator>
                  <CheckSquare size={20} weight='fill' />
                </Checkbox.Indicator>

                {!isAllSelected && (
                  <span>
                    <Square size={20} />
                  </span>
                )}
              </Checkbox.Root>
              <label className='layers-checkbox-label' htmlFor='c1'>
                {t['Select All']}
              </label>
            </div>
            {val.layers.map((l) => {
              return (
                <div className='layers-checkbox-layer' key={l.document_id}>
                  <Checkbox.Root
                    className='checkbox-root'
                    checked={l.selected}
                    onCheckedChange={(checked) =>
                      props.onChange(
                        checked ? 'add' : 'remove',
                        l.document_id,
                        l.layer_id
                      )
                    }
                  >
                    <Checkbox.Indicator>
                      <CheckSquare size={20} weight='fill' />
                    </Checkbox.Indicator>

                    {!l.selected && (
                      <span>
                        <Square size={20} />
                      </span>
                    )}
                  </Checkbox.Root>
                  <label className='layers-checkbox-label' htmlFor='c1'>
                    {l.context_name || t['Base Assignment']}
                  </label>
                </div>
              );
            })}
          </AccordionContent>
        </Accordion.Item>
      );
    });

    return (
      <>
        <div className='row tab-team'>
          <section className='column'>
            <h1>{`${t['Step']} 3 (${t['Optional']})`}</h1>
            <p>
              {
                t[
                  'Import read only layers from other assignments to add to each document.'
                ]
              }
            </p>
          </section>

          <section className='column'>
            <Accordion.Root type='multiple'>{display}</Accordion.Root>
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
  } else {
    return <div />;
  }
};
