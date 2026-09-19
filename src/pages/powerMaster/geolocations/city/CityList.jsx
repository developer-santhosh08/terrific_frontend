import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';


const CityList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Geo Locations - City.Edit') || hasPermission('Power Master.Geo Locations - City.Delete');
    const { setLoading } = useLoader();


        
    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [cities, setCities] = useState([]);
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/city`, {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const cityJson = await __apiRes.json();

                if (cityJson.status && Array.isArray(cityJson.data)) {
                    let districtMap = {};
                    try {
                        const distRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/district`, {
                            headers: {
                                'Accept': 'application/json',
                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                            }
                        });
                        const distJson = await distRes.json();
                        if (distJson.status && Array.isArray(distJson.data)) {
                            distJson.data.forEach(d => {
                                districtMap[String(d.id)] = d.name;
                            });
                        }
                    } catch (e) {
                        console.error('Error fetching districts map:', e);
                    }

                    const merged = cityJson.data.map(c => ({
                        ...c,
                        districtName: districtMap[String(c.district_id)] || String(c.district_id)
                    }));
                    setCities(merged.sort((a, b) => b.id - a.id));
                }
            } catch (err) {
                console.error('Error fetching cities:', err);
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
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/city/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            setCities(prev => prev.filter(d => d.id !== pendingDeleteId));
        } catch (error) {
            console.error('Failed to delete', error);
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
    } = useTableControls(cities);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">City Details</h3>
                        {hasPermission('Power Master.Geo Locations - City.Add') && (
                            <button
                                className="btn-create"
                                onClick={() => navigate('/power-master/geolocations/city/add')}
                            >
                                <PlusIcon weight="duotone" className="tw-w-4" />
                                Create New
                            </button>
                        )}
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
                                        <th onClick={() => handleSort('districtName')} className="tw-cursor-pointer tw-select-none">District Name <TableSortIcon direction={sortConfig.key === 'districtName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">City Name <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((c, index) => (
                                        <tr key={c.id}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{c.districtName}</td>
                                            <td className="align-middle">{c.name}</td>
                                            <td className="align-middle">
                                                <span className="badge badge-success" style={{ backgroundColor: c.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {c.status_label || (c.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Geo Locations - City.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/geolocations/city/edit/${c.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Geo Locations - City.Delete') && (
<button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(c.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                </div>
                                            </td>
)}
                                        </tr>
                                    ))}
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

export default CityList;
