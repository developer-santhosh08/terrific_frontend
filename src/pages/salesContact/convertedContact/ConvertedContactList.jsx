import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableControls } from '../../../hooks/useTableControls';
import { TrashIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import SmartPagination from '../../../components/SmartPagination';
import { useLoader } from '../../../context/LoaderContext';
import DeletePopup from '../../../components/Popup/DeletePopup.jsx';
import MobileCard from '../../../components/common/MobileCard';
import { usePermissions } from '../../../context/PermissionContext';

const STAGE_COLOR = {
    pending: 'tw-bg-orange-500',
    Converted: 'tw-bg-emerald-500',
    Closed: 'tw-bg-red-500',
    Hold: 'tw-bg-amber-500',
    'In Followup': 'tw-bg-blue-500'
};

const ConvertedContactList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Sales Contact.Converted Contact.Edit') || hasPermission('Sales Contact.Converted Contact.Delete');
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const { setLoading } = useLoader();
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        const fetchConvertedContacts = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                // Fetch the converted sales contact API
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/salescontact/sales-contact/converted`, { headers });
                const json = await res.json();
                
                // Fetch engineers to map allottedTo ID to name
                const engRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/salescontact/engineers`, { headers }).catch(() => null);
                const engJson = engRes ? await engRes.json().catch(() => null) : null;
                const engineers = engJson ? (Array.isArray(engJson) ? engJson : (engJson.data || [])) : [];
                
                let data = Array.isArray(json) ? json : (json?.data || []);
                
                // Sort descending by ID (newest first)
                data = data.sort((a, b) => (b.id || 0) - (a.id || 0));
                
                setContacts(data.map(item => {
                    const allottedId = item.allottedTo || item.allotted_to;
                    const engineer = engineers.find(e => String(e.id) === String(allottedId));
                    const engineerName = engineer ? (engineer.name || engineer.engineer_name || engineer.employee_name) : allottedId;

                    return {
                        id: item.id,
                        sno: item.id.toString(),
                        createdDate: item.created_date || item.created_at?.split('T')[0] || '',
                        customerName: item.customer_name || item.name || '',
                        mobile: item.mobile_number || item.mobile_number1 || item.mobile || '',
                        allottedTo: String(engineerName || item.engineer_name || item.engineerName || item.employee_name || ''),
                        nextFollowDate: item.next_followup || item.next_follow_date || item.nextFollowDate || '',
                        currentStage: String(item.contact_status) === '3' ? 'Converted' : 'Converted'
                    };
                }));
            } catch (err) {
                console.error("Error fetching converted sales contacts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConvertedContacts();
    }, []);

    const handleConfirmDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/salescontact/sales-contact/${pendingDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const json = await res.json();
            if (res.ok && (json.status === 'success' || json.message)) {
                setContacts(prev => prev.filter(c => c.id !== pendingDeleteId));
            } else {
                alert(json.message || "Failed to delete");
            }
        } catch (err) {
            alert("Error deleting contact.");
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
        }
    };

    const filteredContacts = contacts.filter(c => 
        String(c.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.mobile || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.allottedTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.currentStage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.sno || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { items: sortedContacts, requestSort, getSortDirection } = useSortableData(filteredContacts);

    const totalPages = Math.ceil(sortedContacts.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const paginatedContacts = sortedContacts.slice(startIndex, startIndex + parseInt(entriesPerPage));

    return (
        <section className="content">
            <style>{`
                .list-action-btn {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease, transform .06s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.10);
                }
                .list-action-btn:hover { transform: translateY(-1px); }
                .list-action-btn:focus { outline: none; }
                .list-action-btn.btn-edit   { background-color: #f59e0b; color: #000; }
                .list-action-btn.btn-edit:hover   { background-color: #d97706; }
                .list-action-btn.btn-delete { background-color: #ef4444; color: #fff; }
                .list-action-btn.btn-delete:hover { background-color: #dc2626; }
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title max-[350px]:tw-text-center max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Converted Contact Details</h3>
                    </div>

                    <div className="card-body">
                        <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={entriesPerPage}
                                    onChange={(e) => { setEntriesPerPage(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="tw-text-gray-600 tw-font-medium">entries</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-flex-1 sm:tw-w-48 tw-inline-block"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        <tr>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('sno')}><div className="tw-flex tw-justify-between tw-items-center">SO. No <TableSortIcon direction={getSortDirection('sno')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('createdDate')}><div className="tw-flex tw-justify-between tw-items-center">Created Date <TableSortIcon direction={getSortDirection('createdDate')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('allottedTo')}><div className="tw-flex tw-justify-between tw-items-center">Allotted To <TableSortIcon direction={getSortDirection('allottedTo')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('nextFollowDate')}><div className="tw-flex tw-justify-between tw-items-center">Next Follow Date <TableSortIcon direction={getSortDirection('nextFollowDate')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div></th>
                                            {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedContacts.map((contact, index) => (
                                            <tr key={contact.id}>
                                                <td>{startIndex + index + 1}</td>
                                                <td>{contact.sno}</td>
                                                <td>{contact.createdDate}</td>
                                                <td>{contact.customerName}</td>
                                                <td>
                                                    <a href={`tel:${contact.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                        {contact.mobile}
                                                    </a>
                                                </td>
                                                <td>{contact.allottedTo}</td>
                                                <td>{contact.nextFollowDate}</td>
                                                <td>
                                                    <span className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-text-white ${STAGE_COLOR[contact.currentStage] || 'tw-bg-gray-500'}`}>
                                                        {contact.currentStage}
                                                    </span>
                                                </td>
                                                {hasActionPermission && (
                                                    <td>
                                                        <div className="tw-flex tw-gap-2">
                                                            {hasPermission('Sales Contact.Converted Contact.Edit') && (
                                                                <button 
                                                                    type="button" 
                                                                    className="list-action-btn btn-edit" 
                                                                    title="Edit"
                                                                    onClick={() => navigate(`/sales-contact/edit/${contact.id}`, { state: { from: '/sales-contact/converted' } })}
                                                                >
                                                                    <PencilSimpleIcon weight="duotone" className="tw-w-4 " />
                                                                </button>
                                                            )}
                                                            {hasPermission('Sales Contact.Converted Contact.Delete') && (
                                                                <button 
                                                                    type="button" 
                                                                    className="list-action-btn btn-delete" 
                                                                    title="Delete"
                                                                    onClick={() => {
                                                                        setPendingDeleteId(contact.id);
                                                                        setShowDeletePopup(true);
                                                                    }}
                                                                >
                                                                    <TrashIcon weight="duotone" className="tw-w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {paginatedContacts.length === 0 && (
                                            <tr>
                                                <td colSpan={hasActionPermission ? 9 : 8} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginatedContacts.map((contact) => (
                                <MobileCard key={contact.id}>
                                    <MobileCard.Header label="SO. NO" value={contact.sno} />
                                    
                                    <MobileCard.Body>
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <MobileCard.Field label="Customer Name" value={contact.customerName} bold />
                                        </div>
                                        
                                        <MobileCard.Field label="Mobile" value={
                                            <a href={`tel:${contact.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                {contact.mobile}
                                            </a>
                                        } inline />
                                        
                                        <div className="tw-flex tw-gap-4 tw-mt-1">
                                            <MobileCard.Field label="Current Stage" value={
                                                <span className={`tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-text-white ${STAGE_COLOR[contact.currentStage] || 'tw-bg-gray-500'}`}>
                                                    {contact.currentStage}
                                                </span>
                                            } />
                                            <MobileCard.Field label="Created Date" value={contact.createdDate} />
                                        </div>
                                    </MobileCard.Body>
                                    
                                    <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start">
                                        <div className="tw-flex tw-gap-4 tw-w-full">
                                            <MobileCard.Field label="Allotted To" value={contact.allottedTo || '-'} />
                                            <MobileCard.Field label="Next Follow Date" value={contact.nextFollowDate || '-'} align="right" />
                                        </div>

                                        {hasActionPermission && (
                                            <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                <MobileCard.Actions>
                                                {hasPermission('Sales Contact.Converted Contacts.View Job Card') && (
                                                    <button 
                                                        type="button" 
                                                        className="list-action-btn btn-edit tw-shadow-none" 
                                                        title="View Job Card"
                                                        onClick={() => navigate(`/job-card`)}
                                                    >
                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('Sales Contact.Converted Contacts.Delete') && (
                                                    <button 
                                                        type="button" 
                                                        className="list-action-btn btn-delete tw-shadow-none" 
                                                        title="Delete"
                                                        onClick={() => {
                                                            setPendingDeleteId(contact.id);
                                                            setShowDeletePopup(true);
                                                        }}
                                                    >
                                                        <TrashIcon weight="duotone" className="tw-w-4" />
                                                    </button>
                                                )}
                                                </MobileCard.Actions>
                                            </div>
                                        )}
                                    </MobileCard.Footer>
                                </MobileCard>
                            ))}
                            
                            {paginatedContacts.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8 tw-bg-white tw-rounded-xl tw-border tw-border-gray-100">
                                    No records found
                                </div>
                            )}
                        </div>

                        <SmartPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalEntries={sortedContacts.length}
                            startIndex={startIndex}
                            entriesPerPage={entriesPerPage}
                        />
                    </div>
                </div>
            </div>
            
            <DeletePopup 
                isOpen={showDeletePopup}
                onClose={() => setShowDeletePopup(false)}
                onConfirm={handleConfirmDelete}
                message="Are you sure you want to delete this converted contact?"
            />
        </section>
    );
};

export default ConvertedContactList;
