import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import { usePermissions } from '../../../../context/PermissionContext';

const MenuListList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master.Edit') || hasPermission('Power Master.General Master.Delete');
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const data = [
        { id: 1, menuName: 'Hold Enquiry', sessionNumber: '1133', status: 'Active' },
        { id: 2, menuName: 'Converted Enquiry', sessionNumber: '1132', status: 'Active' }
    ];

    const {
        sortConfig,
        handleSort,
        searchQuery,
        setSearchQuery,
        entriesPerPage,
        setEntriesPerPage,
        currentPage,
        setCurrentPage,
        totalPages,
        startIndex,
        endIndex,
        totalEntries,
        paginatedData: sortedData
    } = useTableControls(data);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Menu List Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            <button
                                className="btn-create d-flex align-items-center tw-gap-1"
                                onClick={() => navigate('/power-master/user/menu-list/add')}
                            >
                                <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                <span className="text-white">Create New</span>
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {/* Top controls: Show entries and Search */}
                        <div className="list-top-bar">
                            
                            <div className="d-flex align-items-center">
                                <span className="me-2">Show</span>
                                <select 
                                    className="form-select form-select-sm tw-border-slate-300 me-2" 
                                    style={{ width: '70px' }}
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2">Search:</span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm tw-border-slate-300" 
                                    style={{ width: 'auto' }} 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('menuName')} className="tw-cursor-pointer tw-select-none">Menu Name <TableSortIcon direction={sortConfig.key === 'menuName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('sessionNumber')} className="tw-cursor-pointer tw-select-none">Session Number <TableSortIcon direction={sortConfig.key === 'sessionNumber' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{+ index}</td>
                                            <td className="align-middle">{e.menuName}</td>
                                            <td className="align-middle">{e.sessionNumber}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.General Master.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/user/menu-list/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 5 : 4} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
                            </div>
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>

                        
                        

                    </div>
                </div>
            </div>
        </section>
    );
};

export default MenuListList;
