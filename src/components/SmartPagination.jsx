import React from 'react';

const SmartPagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    startIndex, 
    entriesPerPage, 
    totalEntries 
}) => {
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            if (currentPage === 1) end = 3;
            if (currentPage === totalPages) start = totalPages - 2;
            
            for (let i = start; i <= end; i++) pages.push(i);
            
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
            <div className="tw-text-gray-600 tw-text-sm">
                Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + parseInt(entriesPerPage), totalEntries)} of {totalEntries} entries
            </div>
            <div className="tw-flex tw-items-center">
                <button 
                    className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-r-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                
                {getPageNumbers().map((page, i) => (
                    <button 
                        key={i}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        className={`btn btn-sm tw-rounded-none tw-px-3 ${page === '...' ? 'btn-outline-secondary tw-border-gray-300 tw-bg-white tw-text-gray-600 tw-cursor-default' : currentPage === page ? 'tw-bg-blue-500 tw-text-white tw-border-blue-500' : 'btn-outline-secondary tw-border-gray-300 tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600'}`}
                        disabled={page === '...'}
                    >
                        {page}
                    </button>
                ))}

                <button 
                    className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-l-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SmartPagination;
