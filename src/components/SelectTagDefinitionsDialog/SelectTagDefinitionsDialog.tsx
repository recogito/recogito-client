import { Button } from '@components/Button';
import {
  CheckSquare,
  MagnifyingGlass,
  Square,
  X
} from '@phosphor-icons/react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Dialog from '@radix-ui/react-dialog';
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { TagDefinition, Translations } from 'src/Types.ts';
import './SelectTagDefinitionsDialog.css';

interface Props {
  i18n: Translations;

  labels: {
    columnCount;
    columnName: string;
    header: string;
    subtitle: string;
    title: string;
  };

  onCancel(): void;

  onSave(projectIds: string[]): void;

  open: boolean;

  selected: string[];

  tagDefinitions: TagDefinition[];
}

export const SelectTagDefinitionsDialog = (props: Props) => {
  const [query, setQuery] = useState('');
  const [selectedTagDefinitions, setSelectedTagDefinitions] = useState([]);

  const { t } = props.i18n;

  const filteredTagDefinitions = useMemo(() => {
    if (!(query && query.length)) {
      return props.tagDefinitions;
    }

    const regex = new RegExp(query, 'i');
    return props.tagDefinitions.filter((tagDefinition) => regex.test(tagDefinition.name))
  }, [query, props.tagDefinitions]);

  const isSelected = useCallback((id) => selectedTagDefinitions.includes(id), [selectedTagDefinitions]);

  const onSave = useCallback(() => props.onSave(selectedTagDefinitions), [selectedTagDefinitions, props.onSave])

  const toggleSelected = useCallback((id) => {
    if (isSelected(id)) {
      setSelectedTagDefinitions(selectedTagDefinitions.filter((i) => i !== id));
    } else {
      setSelectedTagDefinitions((prevSelected) => [...prevSelected, id]);
    }
  }, [isSelected, selectedTagDefinitions]);

  useEffect(() => {
    setSelectedTagDefinitions(props.selected);
  }, [props.open]);

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content select-tag-definitions'>
          <Dialog.Title className='dialog-title'>
            <h1>{props.labels.title}</h1>
          </Dialog.Title>
          <span>{props.labels.subtitle}</span>

          <div
            className='header'
          >
            <h2>{props.labels.header}</h2>
            <div className='search-container'>
              <input
                className='search-input'
                name='query'
                onChange={(evt) => setQuery(evt.target.value)}
                placeholder={t['Search']}
                value={query}
              />
              <MagnifyingGlass
                className='search-icon'
                size={16}
              />
              { query && query.length && (
                <button
                  className='search-clear unstyled'
                  onClick={() => setQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className='table-container'>
            <table>
              <thead>
              <tr>
                <th></th>
                <th>{props.labels.columnName}</th>
                <th>{props.labels.columnCount}</th>
              </tr>
              </thead>

              <tbody>
              { filteredTagDefinitions && filteredTagDefinitions.map((tagDefinition) => (
                <tr
                  key={tagDefinition.id}
                >
                  <td>
                    <Checkbox.Root
                      className='checkbox-root'
                      checked={isSelected(tagDefinition.id)}
                      onCheckedChange={() => toggleSelected(tagDefinition.id)}
                    >
                      <Checkbox.Indicator>
                        <CheckSquare size={20} weight='fill' />
                      </Checkbox.Indicator>

                      { !isSelected(tagDefinition.id) && (
                        <span>
                          <Square size={20} />
                        </span>
                      )}
                    </Checkbox.Root>
                  </td>
                  <td>{tagDefinition.name}</td>
                  <td>{tagDefinition.tags?.length || 0}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className='buttons'>
            <button onClick={props.onCancel}>
              {t['Cancel']}
            </button>

            <Button
              className='primary'
              onClick={onSave}
            >
                <span>
                  {t['Add to Selected']}
                </span>
            </Button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};