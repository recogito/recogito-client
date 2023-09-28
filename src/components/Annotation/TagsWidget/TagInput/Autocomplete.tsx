import { useEffect, useRef, useState } from 'react';

const getVocabSuggestions = (query: string, vocabulary: string[]) =>
  vocabulary.filter(item =>
    item.toLowerCase().startsWith(query.toLowerCase()));

interface AutocompleteProps {

  focus?: boolean;

  placeholder?: string;

  initialValue?: string;

  vocabulary: string[];

  onChange?(value: string): void;

  onSubmit(value: string): void;

  onCancel?(): void;

}

export const Autocomplete = (props: AutocompleteProps) => {

  const element = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState(props.initialValue || '');

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>();

  useEffect(() => {
    if (props.focus)
      element.current?.querySelector('input')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    props.onChange && props.onChange(value);
  }, [value]);

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
      const trimmed = value.trim();

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

    setValue('');
    setSuggestions([]);
    setHighlightedIndex(undefined);
  }

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      onSubmit();
    } else if (evt.key === 'Escape') {
      props.onCancel && props.onCancel();
    } else {
      // Neither enter nor cancel
      console.log('key', evt.key);
      if (suggestions.length > 0) {
        if (evt.which === 38) {
          // Key up
          if (highlightedIndex === undefined) {
            setHighlightedIndex(0);
          } else {
            const prev = Math.max(0, highlightedIndex - 1);
            setHighlightedIndex(prev);
          }
        } else if (evt.which === 40) {
          // Key down
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
        if (evt.which === 40) {
          if (Array.isArray(props.vocabulary))
            setSuggestions(props.vocabulary);
        }
      }
    }
  }

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setValue(value);

    // Typing on the input resets the highlight
    setHighlightedIndex(undefined);

    if (value)
      getSuggestions(value);
    else
      setSuggestions([]);
  }

  return (
    <div
      ref={element}  
      className="tag-autocomplete">
      <div>
        <input
          onKeyDown={onKeyDown}
          onChange={onChange}
          value={value}
          placeholder={props.placeholder} />
      </div>
      
      <ul>
        {suggestions.length > 0 && suggestions.map((item, index) => (
          <li 
            key={`${item}-${index}`}
            onClick={onSubmit}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={highlightedIndex === index ? 'selected' : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}