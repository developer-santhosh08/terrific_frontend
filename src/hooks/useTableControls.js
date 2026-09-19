import { useState, useMemo } from 'react';

export const useTableControls = (initialData = []) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let result = [...initialData];

        // 1. Search (case insensitive)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item => {
                return Object.values(item).some(val =>
                    val !== null && val !== undefined && String(val).toLowerCase().includes(lowerQuery)
                );
            });
        }

        // 2. Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (valA == null && valB == null) return 0;
                if (valA == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valB == null) return sortConfig.direction === 'asc' ? 1 : -1;

                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();

                if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [initialData, searchQuery, sortConfig]);

    const totalPages = Math.ceil(processedData.length / entriesPerPage) || 1;

    // Ensure currentPage is valid (e.g., if search reduces items)
    const validCurrentPage = Math.min(currentPage, totalPages);

    const paginatedData = processedData.slice(
        (validCurrentPage - 1) * entriesPerPage,
        validCurrentPage * entriesPerPage
    );

    const startIndex = processedData.length === 0 ? 0 : (validCurrentPage - 1) * entriesPerPage + 1;
    const endIndex = Math.min(validCurrentPage * entriesPerPage, processedData.length);
    const totalEntries = processedData.length;

    return {
        sortConfig,
        handleSort,
        entriesPerPage,
        setEntriesPerPage: (val) => { setEntriesPerPage(Number(val)); setCurrentPage(1); },
        searchQuery,
        setSearchQuery: (val) => { setSearchQuery(val); setCurrentPage(1); },
        currentPage: validCurrentPage,
        setCurrentPage,
        totalPages,
        paginatedData,
        startIndex,
        endIndex,
        totalEntries
    };
};
