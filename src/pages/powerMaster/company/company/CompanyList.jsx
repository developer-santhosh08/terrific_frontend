import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../../lib/api';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';
import MobileCard from '../../../../components/common/MobileCard';

const CompanyList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.General Master - Company.Edit') || hasPermission('Power Master.General Master - Company.Delete');
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [companies, setCompanies] = useState([]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('erp_token');

            // Fetch cities first to map IDs to Names
            const cityRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=city&state_id=30`, {
                headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
            });
            const cityJson = await cityRes.json();
            const cityMap = {};
            if (cityJson.status && cityJson.data) {
                cityJson.data.forEach(c => {
                    cityMap[c.id] = c.name;
                });
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/company`, {
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const data = await response.json();
            if (data?.status && data?.data) {
                const companiesWithCities = data.data.map(c => ({
                    ...c,
                    city_name: cityMap[c.city_id] || c.city_id
                }));
                setCompanies(companiesWithCities.reverse());
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);


    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await apiFetch('/master/company/' + pendingDeleteId, {
                method: 'DELETE'
            });
            setCompanies(prev => prev.filter(d => d.id !== pendingDeleteId));
        } catch {
            // silently ignore
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
    } = useTableControls(companies);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Company Details</h3>
                        {hasPermission('Power Master.General Master - Company.Add') && (
                            <button
                                className="btn-create"
                                onClick={() => navigate('/power-master/company/add')}
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

                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSort('name')} className="tw-cursor-pointer tw-select-none">Company <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('city_id')} className="tw-cursor-pointer tw-select-none">City <TableSortIcon direction={sortConfig.key === 'city_id' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('address1')} className="tw-cursor-pointer tw-select-none">Address1 <TableSortIcon direction={sortConfig.key === 'address1' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('address2')} className="tw-cursor-pointer tw-select-none">Address2 <TableSortIcon direction={sortConfig.key === 'address2' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('mobile_number')} className="tw-cursor-pointer tw-select-none">Mobile <TableSortIcon direction={sortConfig.key === 'mobile_number' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status_label')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status_label' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((c, index) => (
                                        <tr key={c.id}>
                                            <td>{startIndex + index}</td>
                                            <td>{c.name}</td>
                                            <td>{c.city_name || c.city_id || ''}</td>
                                            <td>{c.address1}</td>
                                            <td>{c.address2}</td>
                                            <td>{c.mobile_number}</td>
                                            <td>
                                                <span className="badge badge-success" style={{ backgroundColor: c.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {c.status_label || (c.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td>
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.General Master - Company.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/company/edit/${c.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {/* <button type="button" className="list-action-btn btn-settings">
                                                        <GearSixIcon weight="duotone" className="tw-w-4" />
                                                    </button> */}
                                                    {hasPermission('Power Master.General Master - Company.Delete') && (
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

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {sortedData.map((c, index) => (
                                <MobileCard key={c.id}>
                                    <MobileCard.Header label="Company" value={c.name} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="#" value={startIndex + index} />
                                            <MobileCard.Field label="City" value={c.city_name || c.city_id || ''} />
                                            <MobileCard.Field label="Mobile" value={c.mobile_number} />
                                            <MobileCard.Field label="Status" value={
                                                <span className="badge badge-success" style={{ backgroundColor: c.status === 1 ? '#28a745' : '#dc3545' }}>
                                                    {c.status_label || (c.status === 1 ? 'Active' : 'Inactive')}
                                                </span>
                                            } />
                                        </div>
                                        {(c.address1 || c.address2) && (
                                            <div className="tw-mt-2">
                                                <MobileCard.Field label="Address" value={[c.address1, c.address2].filter(Boolean).join(', ')} />
                                            </div>
                                        )}
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer className="tw-border-t tw-border-slate-100 tw-flex tw-justify-end tw-items-center">
                                            <MobileCard.Actions>
                                                {hasPermission('Power Master.General Master - Company.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/company/edit/${c.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Power Master.General Master - Company.Delete') && (
                                                    <button
                                                        type="button"
                                                        className="list-action-btn btn-delete"
                                                        onClick={() => handleDelete(c.id)}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                            </MobileCard.Actions>
                                        </MobileCard.Footer>
                                    )}
                                </MobileCard>
                            ))}
                            {sortedData.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No records found</div>
                            )}
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
            <DeletePopup
                isOpen={showDeletePopup}
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default CompanyList;
