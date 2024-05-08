import { ReactNode, createContext, useContext, useState } from 'react';
import type { Filter } from '@annotorious/react';

interface FilterStateContextValue {

  creatorFilter?: Filter;

  setCreatorFilter: React.Dispatch<React.SetStateAction<Filter | undefined>>;

  tagFilter?: Filter;
  
  setTagFilter: React.Dispatch<React.SetStateAction<Filter | undefined>>;

  visibilityFilter?: Filter;
  
  setVisibilityFilter: React.Dispatch<React.SetStateAction<Filter | undefined>>;

}

// @ts-ignore
const FilterStateContext = createContext<FilterStateContextValue>(); 

interface FilterStateProps {

  children: ReactNode;

}

export const FilterState = (props: FilterStateProps) => {

  const [creatorFilter, setCreatorFilter] = useState<Filter | undefined>();

  const [tagFilter, setTagFilter] = useState<Filter | undefined>();

  const [visibilityFilter, setVisibilityFilter] = useState<Filter | undefined>();

  return (
    <FilterStateContext.Provider value={{ 
      creatorFilter,
      setCreatorFilter,
      tagFilter,
      setTagFilter,
      visibilityFilter,
      setVisibilityFilter 
    }}>
      {props.children}
    </FilterStateContext.Provider>
  )

}

export const useFilterState = () => useContext(FilterStateContext);