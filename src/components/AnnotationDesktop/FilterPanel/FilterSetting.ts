import type { Filter } from '@annotorious/react';

export interface FilterSetting<T> {

  state: T;
  
  filter?: Filter;

}