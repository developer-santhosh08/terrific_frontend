import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../../components/TableSortIcon';
import DeletePopup from '../../../../components/Popup/DeletePopup.jsx';
import { usePermissions } from '../../../../context/PermissionContext';

const AccountDetailsList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Bank - Account Details.Edit') || hasPermission('Power Master.Bank - Account Details.Delete');
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const [banksRes, citiesRes, branchRes, detailsRes] = await Promise.all([
                fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/bank'),
                fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/geolocation?type=city&state_id=30'),
                fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/branch'),
                fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/account-detail')
            ]);
            const banksJson = await banksRes.json();
            const citiesJson = await citiesRes.json();
            const branchJson = await branchRes.json();
            const detailsJson = await detailsRes.json();
            
            let banksMap = {};
            if (banksJson.status && banksJson.data) {
                banksMap = banksJson.data.reduce((acc, bank) => {
                    acc[bank.id] = bank.name;
                    return acc;
                }, {});
            }

            let citiesMap = {};
            if (citiesJson.status && citiesJson.data) {
                citiesMap = citiesJson.data.reduce((acc, city) => {
                    acc[city.id] = city.name;
                    return acc;
                }, {});
            }

            let branchMap = {};
            if (branchJson.status && branchJson.data) {
                branchMap = branchJson.data.reduce((acc, branch) => {
                    acc[branch.id] = branch.name;
                    return acc;
                }, {});
            }

            if (detailsJson.status && detailsJson.data) {
                const formattedData = detailsJson.data.map(item => ({
                    id: item.id,
                    bankName: banksMap[item.bank_id] || item.bank_id || '',
                    accountNumber: item.account_number || '',
                    accountHolderName: item.holder_name || '',
                    branch: branchMap[item.branch] || item.branch || '',
                    city: citiesMap[item.branch_city] || item.branch_city || '',
                    status: (item.status === 1 || item.status === '1' || item.status === 'Active') ? 'Active' : 'Inactive'
                })).sort((a, b) => b.id - a.id);
                setData(formattedData);
            }
        } catch (err) {
            console.error("Error fetching account details:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = sessionStorage.getItem('erp_token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/account-detail/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            setData(prev => prev.filter(d => d.id !== pendingDeleteId));
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
    } = useTableControls(data);

    return (
                <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title"> Account Details</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            {hasPermission('Power Master.Bank - Account Details.Add') && (
                                <button
                                    className="btn-create d-flex align-items-center tw-gap-1"
                                    onClick={() => navigate('/power-master/bank/account-details/add')}
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
                                        <th onClick={() => handleSort('bankName')} className="tw-cursor-pointer tw-select-none">Bank Name <TableSortIcon direction={sortConfig.key === 'bankName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('accountNumber')} className="tw-cursor-pointer tw-select-none">Account Number <TableSortIcon direction={sortConfig.key === 'accountNumber' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('accountHolderName')} className="tw-cursor-pointer tw-select-none">Account Holder Name <TableSortIcon direction={sortConfig.key === 'accountHolderName' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('branch')} className="tw-cursor-pointer tw-select-none">Branch <TableSortIcon direction={sortConfig.key === 'branch' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('city')} className="tw-cursor-pointer tw-select-none">City <TableSortIcon direction={sortConfig.key === 'city' ? sortConfig.direction : null} /></th>
                                        <th onClick={() => handleSort('status')} className="tw-cursor-pointer tw-select-none">Status <TableSortIcon direction={sortConfig.key === 'status' ? sortConfig.direction : null} /></th>
                                        {hasActionPermission && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((e, index) => (
                                        <tr key={index}>
                                            <td className="align-middle">{startIndex + index}</td>
                                            <td className="align-middle">{e.bankName}</td>
                                            <td className="align-middle">{e.accountNumber}</td>
                                            <td className="align-middle">{e.accountHolderName}</td>
                                            <td className="align-middle">{e.branch}</td>
                                            <td className="align-middle">{e.city}</td>
                                            <td className="align-middle">
                                                <span className={`badge ${e.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            {hasActionPermission && (
<td className="align-middle">
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Power Master.Bank - Account Details.Edit') && (
<button type="button" className="list-action-btn btn-edit" onClick={() => navigate(`/power-master/bank/account-details/edit/${e.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Power Master.Bank - Account Details.Delete') && (
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
                                            <td colSpan={hasActionPermission ? 8 : 7} className="text-center tw-py-4">No data available in table</td>
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

export default AccountDetailsList;
