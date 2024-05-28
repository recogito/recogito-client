import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Annotation, Filter, User } from '@annotorious/react';
import type { FilterSetting } from './FilterSetting';

interface FilterStateContextValue {

  layerSettings?: FilterSetting<string[] | undefined>;
  
  setLayerSettings: React.Dispatch<React.SetStateAction<FilterSetting<string[] | undefined> | undefined>>;

  creatorSettings?: FilterSetting<User[]>;

  setCreatorSettings: React.Dispatch<React.SetStateAction<FilterSetting<User[]> | undefined>>;

  tagSettings?: FilterSetting<string[]>;
  
  setTagSettings: React.Dispatch<React.SetStateAction<FilterSetting<string[]> | undefined>>;

  visibilitySettings?: FilterSetting<'public' | 'private' | 'all'>;
  
  setVisibilitySettings: React.Dispatch<React.SetStateAction<FilterSetting<'all' | 'private' | 'public'> | undefined>>;

  filter?: Filter;

}

// @ts-ignore
const FilterStateContext = createContext<FilterStateContextValue>(); 

interface FilterStateProps {

  children: ReactNode;

}

export const FilterState = (props: FilterStateProps) => {

  const [layerSettings, setLayerSettings] = 
    useState<FilterSetting<string[] | undefined> | undefined> ();

  const [creatorSettings, setCreatorSettings] = 
    useState<FilterSetting<User[]> | undefined>();

  const [tagSettings, setTagSettings] = 
    useState<FilterSetting<string[]> | undefined>();

  const [visibilitySettings, setVisibilitySettings] = 
    useState<FilterSetting<'all' | 'private' | 'public'> | undefined>();

  const [chained, setChained] = useState<Filter | undefined>();

  // Note: this may move into the context provider later
  useEffect(() => {
    const filters = [
      layerSettings?.filter!,
      creatorSettings?.filter!,
      tagSettings?.filter!,
      visibilitySettings?.filter!
    ].filter(Boolean);

    if (filters.length > 0) {
      const chained = (a: Annotation) => filters.every(fn => fn(a));
      setChained(() => chained)
    } else {
      setChained(undefined); 
    }
  }, [layerSettings, creatorSettings, tagSettings, visibilitySettings]);

  return (
    <FilterStateContext.Provider value={{ 
      layerSettings,
      setLayerSettings,
      creatorSettings,
      setCreatorSettings,
      tagSettings,
      setTagSettings,
      visibilitySettings,
      setVisibilitySettings,
      filter: chained 
    }}>
      {props.children}
    </FilterStateContext.Provider>
  )

}

export const useFilterSettingsState = () => useContext(FilterStateContext);

export const useFilter = () => {
  const { 
    layerSettings,
    creatorSettings, 
    tagSettings, 
    visibilitySettings, 
    filter 
  } = useContext(FilterStateContext);

  // Number of filter conditions chained in the filter
  const numConditions = [layerSettings, creatorSettings, tagSettings, visibilitySettings].filter(Boolean).length;

  return { filter, numConditions };
}