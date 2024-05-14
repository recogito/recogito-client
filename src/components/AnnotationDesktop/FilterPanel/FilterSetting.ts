import type { Filter } from '@annotorious/react';

export interface FilterSetting<T extends unknown> {

  state: T;
  
  filter?: Filter;

}