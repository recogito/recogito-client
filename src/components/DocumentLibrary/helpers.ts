// constants used in document list and grid calculations
export const CARD_WIDTH = 200;
export const GAP = 16;

export const getGridTemplate = (view: 'mine' | 'all' | 'collection') => {
  // helper function to set the column sizes based on view
  switch (view) {
    case 'mine':
      return '50px 450px 150px 1fr 1fr 60px';
    case 'all':
      return '50px 450px 1fr 1fr 60px';
    case 'collection':
      return '50px 325px 200px 1fr 1fr 60px';
    default:
      return '50px 1fr 1fr 1fr 60px';
  }
};
