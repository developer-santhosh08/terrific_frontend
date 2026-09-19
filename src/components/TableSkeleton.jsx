import React from 'react';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
    return (
        <div className="table-responsive">
            <table className="table table-bordered table-striped no-margin">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <div className="tw-h-4 tw-bg-slate-200 tw-rounded tw-w-full tw-animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i}>
                            {Array.from({ length: columns }).map((_, j) => (
                                <td key={j}>
                                    <div className="tw-h-4 tw-bg-slate-200 tw-rounded tw-w-full tw-animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;
