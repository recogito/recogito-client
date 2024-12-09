import { MagnifyingGlass, X } from '@phosphor-icons/react';
import classNames from 'classnames';
import React from 'react';
import './SearchInput.css';

interface Props {
  className?: string;

  onChange(event: any): void;

  onClear(): void;

  placeholder?: string;

  search: string;
}

export const SearchInput = (props: Props) => (
  <div
    className={classNames('search-input', props.className)}
  >
    <input
      className='input'
      name='query'
      onChange={props.onChange}
      placeholder={props.placeholder}
      value={props.search}
    />
    <MagnifyingGlass
      className='search-icon'
      size={16}
    />
    { props.search && props.search.length && (
      <button
        className='search-clear unstyled'
        onClick={props.onClear}
      >
        <X size={16} />
      </button>
    )}
  </div>
);