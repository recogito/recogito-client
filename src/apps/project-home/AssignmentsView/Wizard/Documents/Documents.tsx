import { useEffect } from 'react';
import {
  Article,
  Check,
  CheckSquare,
  Image,
  Square,
  Warning,
} from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { Document, DocumentWithContext, Translations } from 'src/Types';
import {
  assignmentSpecToContext,
  type AssignmentSpec,
} from '../AssignmentSpec';
import { useSelectableRows } from '../useSelectableRows';
import { Label } from '@radix-ui/react-label';

import './Document.css';

interface DocumentsProps {
  i18n: Translations;

  assignment: AssignmentSpec;

  documents: Document[];

  onChange(documents: DocumentWithContext[]): void;

  onCancel(): void;

  onNext(): void;
}

export const Documents = (props: DocumentsProps) => {
  const { t } = props.i18n;

  const { documents } = props;

  const { selected, toggleSelected, toggleAll, isAllSelected } =
    useSelectableRows(documents, props.assignment.documents);

  useEffect(() => {
    const docs: DocumentWithContext[] = [];

    documents
      .filter((d) => selected.includes(d.id))
      .forEach((d) => {
        docs.push({
          ...d,
          layers: [],
          context: assignmentSpecToContext(props.assignment),
        });
      });
    props.onChange(docs);
  }, [selected, documents]);

  return (
    <>
      <div className='row tab-documents'>
        <section className='column'>
          <h1>{t['Step']} 2</h1>
          <p>{t['Add documents to this assignment.']}</p>
        </section>

        <section className='column'>
          <table>
            <thead>
              <tr>
                <th>
                  <Checkbox.Root
                    className='checkbox-root'
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}
                  >
                    <Checkbox.Indicator>
                      <CheckSquare size={20} weight='fill' />
                    </Checkbox.Indicator>

                    {!isAllSelected && (
                      <span>
                        <Label
                          htmlFor='all-documents'
                          aria-label={t['select all documents in project']}
                        >
                          <Square size={20} id='all-documents' />
                        </Label>
                      </span>
                    )}
                  </Checkbox.Root>
                </th>

                <th aria-label='No value'></th>
                <th aria-label='No value'></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>
                    <Checkbox.Root
                      className='checkbox-root'
                      checked={selected.includes(document.id)}
                      onCheckedChange={(checked) =>
                        toggleSelected(document, checked)
                      }
                    >
                      <Checkbox.Indicator>
                        <Label
                          htmlFor={`document-${document.id}`}
                          aria-label={`${t['remove document']} ${document.name} ${t['from this assignment']}`}
                        >
                          <CheckSquare size={20} weight='fill' />
                        </Label>
                      </Checkbox.Indicator>

                      {!selected.includes(document.id) && (
                        <Label
                          htmlFor={`document-${document.id}`}
                          aria-label={`${t['add document']} ${document.name} ${t['to this assignment']}`}
                        >
                          <span>
                            <Square size={20} id={`document-${document.id}`} />
                          </span>
                        </Label>
                      )}
                    </Checkbox.Root>
                  </td>

                  <td>
                    {/* Temporary hack - for now, everything that has a content type is a text ! */}
                    {document.content_type ? (
                      <Article size={16} />
                    ) : (
                      <Image size={16} />
                    )}
                  </td>

                  <td>{document.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {selected.length === 0 ? (
            <p className='hint warn'>
              <Warning size={16} /> {t['Select at least 1 document']}
            </p>
          ) : selected.length === 1 ? (
            <p className='hint ok'>
              <Check size={16} /> {t['Selected 1 document']}
            </p>
          ) : (
            <p className='hint ok'>
              <Check size={16} />{' '}
              {t['Selected ${n} documents'].replace(
                '${n}',
                selected.length.toString()
              )}
            </p>
          )}
        </section>
      </div>

      <section className='wizard-nav'>
        <button onClick={props.onCancel}>{t['Cancel']}</button>

        <button className='primary' onClick={props.onNext}>
          {t['Next']}
        </button>
      </section>
    </>
  );
};
