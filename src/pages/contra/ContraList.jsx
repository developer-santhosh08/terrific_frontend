import { useTableControls } from '../../hooks/useTableControls';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../components/TableSortIcon';
import { useSortableData } from '../../hooks/useSortableData';
import { useState, useEffect } from 'react';
import DeletePopup from '../../components/Popup/DeletePopup.jsx';
import { useLoader } from '../../context/LoaderContext';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const ContraList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Contra.Contra list.Edit') || hasPermission('Contra.Contra list.Delete');
    const navigate = useNavigate();

    const [contras, setContras] = useState([]);
    const { setLoading } = useLoader();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        const fetchContras = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/contra/contra`);
                const result = await response.json();
                console.log("ContraList API Result:", result);
                if (result.status === 'success') {
                    const data = result.data || [];
                    const mappedData = data.map(item => {
                        const amt = parseFloat(item.contra_amount) || 0;
                        const interest = parseFloat(item.contra_intrest) || 0;
                        const totalAmount = amt + interest;
                        
                        return {
                            ...item,
                            total_amount: totalAmount
                        };
                    });
                    setContras(mappedData.reverse());
                }
            } catch (error) {
                console.error("Error fetching contras:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContras();
    }, []);

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/contra/contra/${pendingDeleteId}`, {
                method: 'DELETE',
                headers
            });
            const result = await response.json();
            if (result.status === 'success') {
                setContras(prev => prev.filter(c => c.id !== pendingDeleteId));
            } else {
                console.error("Failed to delete contra:", result);
                alert(result.message || 'Failed to delete contra');
            }
        } catch (error) {
            console.error("Error deleting contra:", error);
            alert('An error occurred while deleting the contra.');
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
            setLoading(false);
        }
    };

    const { items: sortedContras, requestSort, getSortDirection } = useSortableData(contras);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Contra List</h3>
                        {hasPermission('Contra.Contra list.Add') && (
                            <button className="btn-create" onClick={() => navigate('/contra/add')}>
                                Add Contra
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="list-top-bar tw-mb-4 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span>Show</span>
                                <select className="form-select form-select-sm tw-w-20 tw-inline-block">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-w-full md:tw-w-auto">
                                <span className="tw-whitespace-nowrap">Search:</span>
                                <input type="text" className="form-control form-control-sm tw-flex-1 md:tw-w-48 tw-inline-block" />
                            </div>
                        </div>

                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}>
                                            <div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('contraNo')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Contra No <TableSortIcon direction={getSortDirection('contraNo')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Name <TableSortIcon direction={getSortDirection('name')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('date')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Date <TableSortIcon direction={getSortDirection('date')} /></div>
                                        </th>
                                        <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('amount')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Amount <TableSortIcon direction={getSortDirection('amount')} /></div>
                                        </th>
                                        {hasActionPermission && (
<th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50">
                                            <div className="tw-flex tw-justify-between tw-items-center">Action <TableSortIcon /></div>
                                        </th>
)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedContras.map((c, index) => (
                                        <tr key={c.id}>
                                            <td>{index + 1}</td>
                                            <td>CTR-{c.id.toString().padStart(4, '0')}</td>
                                            <td>{c.name}</td>
                                            <td>{c.contra_date}</td>
                                            <td>{c.total_amount.toFixed(3)}</td>
                                            {hasActionPermission && (
<td>
                                                <div className="tw-flex tw-gap-2">
                                                    {hasPermission('Contra.Contra list.Edit') && (
<button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/contra/edit/${c.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
)}
                                                    {hasPermission('Contra.Contra list.Delete') && (
<button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => handleDelete(c.id)}>
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
                        <div className="tw-grid md:tw-hidden tw-gap-4 tw-mt-4">
                            {sortedContras.map((c, index) => (
                                <MobileCard key={c.id}>
                                    <MobileCard.Header label="Contra No" value={`CTR-${c.id.toString().padStart(4, '0')}`} />
                                    <MobileCard.Body>
                                        <MobileCard.Field label="Name" value={c.name} bold />
                                        <MobileCard.Field label="Date" value={c.contra_date} />
                                        <MobileCard.Field label="Amount" value={c.total_amount.toFixed(3)} />
                                    </MobileCard.Body>
                                    {hasActionPermission && (
                                        <MobileCard.Footer>
                                            <MobileCard.Actions>
                                                {hasPermission('Contra.Contra list.Edit') && (
                                                    <button type="button" className="list-action-btn btn-edit" title="Edit" onClick={() => navigate(`/contra/edit/${c.id}`)}>
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Contra.Contra list.Delete') && (
                                                    <button type="button" className="list-action-btn btn-delete" title="Delete" onClick={() => handleDelete(c.id)}>
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                            </MobileCard.Actions>
                                        </MobileCard.Footer>
                                    )}
                                </MobileCard>
                            ))}
                            {sortedContras.length === 0 && (
                                <div className="tw-text-center tw-py-4">No data available</div>
                            )}
                        </div>

                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                            <div className="tw-text-gray-600 tw-text-sm">
                                Showing 1 to {contras.length} of {contras.length} entries
                            </div>
                            <div className="tw-flex tw-items-center">
                                <button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-r-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600">Previous</button>
                                <button className="btn btn-sm tw-bg-blue-500 tw-text-white tw-border-blue-500 tw-rounded-none tw-px-3">1</button>
                                <button className="btn btn-sm btn-outline-secondary tw-border-gray-300 tw-rounded-l-none tw-bg-white hover:tw-bg-gray-50 tw-text-gray-600">Next</button>
                            </div>
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

export default ContraList;
