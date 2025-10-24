import { Button } from '@components/Button';
import { CheckSquare, MagnifyingGlass, Square, X } from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Translations } from 'src/Types.ts';
import { DialogContent } from '@components/DialogContent';
import './SelectRecordsDialog.css';

interface Column {
  name: string;

  label: string;

  resolve(record: Record): ReactNode | string | number;
}

interface Record {
  id: string;
}

interface Props {
  columns: Column[];

  description: string;

  filterBy?: string[];

  header?: string;

  i18n: Translations;

  onCancel(): void;

  onSave(ids: string[]): void;

  open: boolean;

  records: Record[];

  selected?: string[];

  subtitle?: string;

  title: string;
}

export const SelectRecordsDialog = (props: Props) => {
  const [query, setQuery] = useState<string>('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const { t } = props.i18n;

  const filteredRecords = useMemo(() => {
    if (!(query && query.length && props.filterBy && props.filterBy.length)) {
      return props.records;
    }

    const regex = new RegExp(query, 'i');
    return props.records.filter((record) =>
      // @ts-expect-error
      props.filterBy?.some((attr) => regex.test(record[attr]))
    );
  }, [query, props.filterBy, props.records]);

  const isSelected = useCallback(
    (id: string) => selectedRecords.includes(id),
    [selectedRecords]
  );

  const onSave = useCallback(
    () => props.onSave(selectedRecords),
    [selectedRecords, props.onSave]
  );

  const toggleSelected = useCallback(
    (id: string) => {
      if (isSelected(id)) {
        setSelectedRecords(selectedRecords.filter((i) => i !== id));
      } else {
        setSelectedRecords((prevSelected) => [...prevSelected, id]);
      }
    },
    [isSelected, selectedRecords]
  );

  useEffect(() => {
    setSelectedRecords(props.selected || []);
  }, [props.open]);

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent className='dialog-content select-tag-definitions'>
          <Dialog.Title asChild className='dialog-title'>
            <h1>{props.title}</h1>
          </Dialog.Title>
          {props.subtitle && <span>{props.subtitle}</span>}

          <VisuallyHidden.Root asChild>
            <Dialog.Description>{props.description}</Dialog.Description>
          </VisuallyHidden.Root>

          {(props.header || props.filterBy) && (
            <div className='header'>
              {props.header && <h2>{props.header}</h2>}

              {props.filterBy && (
                <div className='search-container'>
                  <input
                    className='search-input'
                    name='query'
                    onChange={(evt) => setQuery(evt.target.value)}
                    placeholder={t['Search']}
                    value={query}
                  />
                  <MagnifyingGlass className='search-icon' size={16} />
                  {query && query.length && (
                    <button
                      className='search-clear unstyled'
                      onClick={() => setQuery('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!!(filteredRecords && filteredRecords.length) && (
            <div className='table-container'>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {props.columns.map((column) => (
                      <th key={column.name}>{column.label}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords &&
                    filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <Checkbox.Root
                            className='checkbox-root'
                            checked={isSelected(record.id)}
                            onCheckedChange={() => toggleSelected(record.id)}
                          >
                            <Checkbox.Indicator>
                              <CheckSquare size={20} weight='fill' />
                            </Checkbox.Indicator>

                            {!isSelected(record.id) && (
                              <span>
                                <Square size={20} />
                              </span>
                            )}
                          </Checkbox.Root>
                        </td>
                        {props.columns.map((column) => (
                          <td key={`${record.id}-${column.name}`}>{column.resolve(record)}</td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {!(filteredRecords && filteredRecords.length) && (
            <div className='no-results text-body-small'>
              {t['No matching records']}
            </div>
          )}

          <div className='buttons'>
            <button onClick={props.onCancel}>{t['Cancel']}</button>

            <Button className='primary' onClick={onSave}>
              <span>{t['Add to Selected']}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
