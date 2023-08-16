import { useState } from 'react';
import { Article, CheckSquare, Image, Square } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { DocumentInProject, Translations } from 'src/Types';

import './Document.css';

interface DocumentsProps {

  i18n: Translations;

  documents: DocumentInProject[];

  onCancel(): void;

  onNext(): void;

}

export const Documents = (props: DocumentsProps) => {

  const { documents } = props;

  const [selected, setSelected] = useState<string[]>([]);

  const isAllSelected = selected.length === documents.length;

  const onToggleDocument = (document: DocumentInProject, checked: Checkbox.CheckedState) => {
    if (checked)
      setSelected(selected => [...selected, document.id])
    else 
      setSelected(selected => selected.filter(id => id !== document.id));
  }

  const onToggleAll = (checked: Checkbox.CheckedState) => {
    if (checked)
      setSelected(documents.map(p => p.id));
    else
      setSelected([]);    
  }

  return (
    <>
      <div className="row tab-documents">
        <section className="column">
          <h1>Step 1</h1>
          <p>
            Add documents to this assignment.
          </p>
        </section>

        <section className="column">
          <table>
            <thead>
              <tr>
                <th>
                  <Checkbox.Root 
                    className="checkbox-root"
                    checked={isAllSelected}
                    onCheckedChange={onToggleAll}>
                    
                    <Checkbox.Indicator>
                      <CheckSquare size={20} weight="fill" /> 
                    </Checkbox.Indicator>

                    {!isAllSelected && (
                      <span><Square size={20} /></span>
                    )}
                  </Checkbox.Root>
                </th>
                
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map(document => (
                <tr key={document.id}>
                  <td>
                    <Checkbox.Root 
                      className="checkbox-root"
                      checked={selected.includes(document.id)}
                      onCheckedChange={checked => onToggleDocument(document, checked)}>

                      <Checkbox.Indicator>
                        <CheckSquare size={20} weight="fill" />  
                      </Checkbox.Indicator>

                      {!selected.includes(document.id) && (
                        <span><Square size={20} /></span>
                      )}
                    </Checkbox.Root>
                  </td>

                  <td>
                    {/* Temporary hack - for now, everything that has a content type is a text ! */}
                    {document.content_type ? (
                      <Article size={16} />
                    ) :(
                      <Image size={16} />
                    )}
                  </td>

                  <td>
                    {document.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="wizard-nav">
        <button
          onClick={props.onCancel}>Cancel</button>

        <button 
          className="primary"
          onClick={props.onNext}>Next</button>
      </section>
    </>
  )

}