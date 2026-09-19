import { useState, useMemo } from 'react';

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let av = a[sortConfig.key];
        let bv = b[sortConfig.key];
        if (av === bv) return 0;
        if (av == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bv == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (typeof av === 'number' && typeof bv === 'number') {
            return sortConfig.direction === 'asc' ? av - bv : bv - av;
        }
        
        av = String(av);
        bv = String(bv);
        return sortConfig.direction === 'asc' 
            ? av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' })
            : bv.localeCompare(av, undefined, { numeric: true, sensitivity: 'base' });
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key) => {
      if (!sortConfig) return null;
      return sortConfig.key === key ? sortConfig.direction : null;
  };

  return { items: sortedItems, requestSort, sortConfig, getSortDirection };
};
