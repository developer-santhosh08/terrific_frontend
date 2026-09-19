import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';


const StateList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Geo Locations - State.Edit') || hasPermission('Power Master.Geo Locations - State.Delete');
    


    const navigate = useNavigate();
    const [states, setStates] = useState([]);
    const { setLoading } = useLoader();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/state`, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const stateJson = await __apiRes.json();

                if (stateJson.status && Array.isArray(stateJson.data)) {
                    // Collect unique country IDs from the state records
                    const uniqueIds = [...new Set(stateJson.data.map(s => s.country_id))];

                    // Fetch each country by its own ID endpoint
                    const countryMap = {};
                    await Promise.all(uniqueIds.map(async (cid) => {
                        try {
                            const __apiRes2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/country/${cid}`, {
                                headers: {
                                    'Accept': 'application/json',
                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                }
                            });
                            const j = await __apiRes2.json();
                            if (j.status && j.data) {
                                const c = Array.isArray(j.data) ? j.data[0] : j.data;
                                if (c?.name) countryMap[String(cid)] = c.name;
                            }
                        } catch { /* ignore individual country fetch failure */ }
                    }));

                    const merged = stateJson.data.map(s => ({
                        ...s,
                        countryName: countryMap[String(s.country_id)] || String(s.country_id)
                    }));
                    setStates(merged.sort((a, b) => b.id - a.id));
                }
            } catch (err) {
                console.error('Error fetching states:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [setLoading]);
    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/state/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            setStates(prev => prev.filter(s => s.id !== pendingDeleteId));
        } catch (err) {
            console.error('Error deleting state:', err);
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
        }
    };

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
    } = useTableControls(states);

    return (
                <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title"> State</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Geo Locations - State.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/geolocations/state/add')}
                                >
                                    <PlusIcon weight="bold" className="tw-w-4 text-white" />
                                    <span className="text-white">Create New</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
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
                                        <th onClick={() => handleSort('countryName')} className="tw-cursor-pointer tw-select-none">Country <TableSortIcon direction={sortConfig.key === 'countryName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">State <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.countryName}</td>
                                            <td className="align-middle">{e.name}</td>
                                            <td className="align-middle">
                                                <span className="badge badge-success" style={{ backgroundColor: e.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {e.status_label || (e.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Geo Locations - State.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/geolocations/state/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Geo Locations - State.Delete') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(e.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan={hasActionPermission ? 3 : 2} className="text-center tw-py-4">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing {totalEntries === 0 ? 0 : startIndex} to {endIndex} of {totalEntries} entries
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
            <DeletePopup
                isOpen={showDeletePopup}
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default StateList;
