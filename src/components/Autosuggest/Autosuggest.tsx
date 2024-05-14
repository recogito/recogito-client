
import { useEffect, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { AutosizeInput } from '../AutosizeInput';

import './Autosuggest.css';

const getVocabSuggestions = (query: string, vocabulary?: string[]) =>
  (vocabulary || []).filter(item =>
    item.toLowerCase().startsWith(query.toLowerCase()));

interface AutosuggestProps {

  autoFocus?: boolean;

  autoSize?: boolean;

  placeholder?: string;

  value: string;

  vocabulary?: string[];

  onChange(value: string): void;

  onSubmit(value: string): void;

  onCancel?(): void;

}

export const Autosuggest = (props: AutosuggestProps) => {

  const element = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>();

  useEffect(() => {
    element.current?.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const getSuggestions = (value: string) => {
    const suggestions = getVocabSuggestions(value, props.vocabulary);
    setSuggestions(suggestions);
  }

  const onSubmit = () => {
    if (highlightedIndex !== undefined) {
      // Submit highligted suggestion
      props.onSubmit(suggestions[highlightedIndex]);
    } else {
      // Submit input value
      const trimmed = props.value.trim();

      if (trimmed) {
        // If there is a vocabulary with the same label, use that
        const matchingTerm = Array.isArray(props.vocabulary) ?
          props.vocabulary.find(term =>
            term.toLowerCase() === trimmed.toLowerCase()) : null;

        if (matchingTerm) {
          props.onSubmit(matchingTerm);
        } else {
          // Otherwise, just use as a freetext tag
          props.onSubmit(trimmed);
        }
      }
    }

    setSuggestions([]);
    setHighlightedIndex(undefined);
  }

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      onSubmit();
    } else if (evt.key === 'Escape') {
      setSuggestions([]);
      setHighlightedIndex(undefined);
      props.onCancel && props.onCancel();
    } else {
      // Neither enter nor cancel
      if (suggestions.length > 0) {
        if (evt.key === 'ArrowUp') {
          if (highlightedIndex === undefined) {
            setHighlightedIndex(0);
          } else {
            const prev = Math.max(0, highlightedIndex - 1);
            setHighlightedIndex(prev);
          }
        } else if (evt.key === 'ArrowDown') {
          if (highlightedIndex === undefined) {
            setHighlightedIndex(0);
          } else {
            const next = Math.min(suggestions.length - 1, highlightedIndex + 1);
            setHighlightedIndex(next);
          }
        }
      } else {
        // No suggestions: key down shows all vocab 
        // options (only for hard-wired vocabs!)
        if (evt.key === 'ArrowDown') {
          setSuggestions(props.vocabulary || []);
        }
      }
    }
  }

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    props.onChange(value);

    // Typing on the input resets the highlight
    setHighlightedIndex(undefined);

    if (value)
      getSuggestions(value);
    else
      setSuggestions([]);
  }

  return (
    <Popover.Root open={suggestions.length > 0}>
      <div
        ref={element}  
        className="autosuggest">  

        <Popover.Anchor>
          {props.autoSize ? (
            <AutosizeInput
              autoFocus={props.autoFocus}
              value={props.value || ''}
              placeholder={props.placeholder}
              onChange={onChange} 
              onKeyDown={onKeyDown} />
          ) : (
            <input
              autoFocus={props.autoFocus}
              value={props.value}
              placeholder={props.placeholder}
              onChange={onChange}
              onKeyDown={onKeyDown} />
          )}
        </Popover.Anchor>

        <Popover.Content onOpenAutoFocus={evt => evt.preventDefault()}>
          <ul>
            {suggestions.map((item, index) => (
              <li 
                key={`${item}-${index}`}
                onClick={onSubmit}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={highlightedIndex === index ? 'selected' : undefined}>
                {item}
              </li>
            ))}
          </ul>
        </Popover.Content>
      </div>
    </Popover.Root>
  )
}
