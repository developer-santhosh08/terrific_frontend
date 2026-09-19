const TableSortIcon = ({ direction = null }) => {
    return (
        <span className="tw-inline-flex tw-items-center tw-ml-2 tw-align-middle">
            <i className={`bi bi-arrow-up ${direction === 'asc' ? 'tw-text-blue-600' : 'tw-text-slate-300'}`} />
            <i className={`bi bi-arrow-down ${direction === 'desc' ? 'tw-text-blue-600' : 'tw-text-slate-300'}`} />
        </span>
    );
};

export default TableSortIcon;
