import { useState, useEffect } from 'react';
import { useTableControls } from '../../../hooks/useTableControls';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';
import TableSortIcon from '../../../components/TableSortIcon';
import { useSortableData } from '../../../hooks/useSortableData';
import SmartPagination from '../../../components/SmartPagination';
import MobileCard from '../../../components/common/MobileCard';
import DeletePopup from '../../../components/Popup/DeletePopup.jsx';
import UpdateFollowupDatePopup from '../../../components/Popup/UpdateFollowupDatePopup.jsx';
import { useLoader } from '../../../context/LoaderContext';
import { usePermissions } from '../../../context/PermissionContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const WorkPlanList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Work Plan.Work Plan.Edit') || hasPermission('Work Plan.Work Plan.Delete');
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [updateDatePopup, setUpdateDatePopup] = useState({ isOpen: false, id: null, newDate: '' });
    const { setLoading } = useLoader();
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workplan/work-plans`, { headers });
            const json = await res.json();

            // Fetch engineers to map allottedTo ID to name
            const engRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/salescontact/engineers`, { headers }).catch(() => null);
            const engJson = engRes ? await engRes.json().catch(() => null) : null;
            const engineers = engJson ? (Array.isArray(engJson) ? engJson : (engJson.data || [])) : [];

            let data = Array.isArray(json) ? json : (json?.data || []);

            // The backend now sorts by follow-up status (today, overdue, in-followup)
            // data = data.sort((a, b) => (b.id || 0) - (a.id || 0));

            const getStatusPriority = (dateStr) => {
                if (!dateStr) return 4;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const target = new Date(dateStr);
                target.setHours(0, 0, 0, 0);
                const diff = target.getTime() - today.getTime();
                if (diff < 0) return 1;  // Overdue
                if (diff === 0) return 2; // Today
                return 3;                 // In Followup
            };

            let mapped = data.map(item => {
                const allottedId = item.allottedTo || item.allotted_to;
                const engineer = engineers.find(e => String(e.id) === String(allottedId));
                const engineerName = engineer ? (engineer.name || engineer.engineer_name || engineer.employee_name) : allottedId;

                return {
                    id: item.id,
                    customerName: item.customer_name || item.name || '',
                    mobile: item.mobile_number || item.mobile || item.mobile_number1 || '',
                    allottedTo: String(engineerName || item.engineer_name || item.engineerName || item.engineer || item.employee_name || item.assignee || item.sales_engineer || ''),
                    nextFollowDate: (item.next_followup || item.next_follow_date || item.nextFollowDate || item.next_followup_date || item.followup_date || item.follow_up_date || item.next_date || item.date || item.created_date || item.created_at || item.follow_date || '').toString().substring(0, 10),
                    currentStage: String(item.contact_status) === '1' ? 'In Followup' :
                        String(item.contact_status) === '2' ? 'Completed' :
                            String(item.contact_status) === '5' ? 'Pending' : 'In Followup'
                };
            });

            // Sort: Overdue → Today → In Followup, then by date ascending within each group
            mapped.sort((a, b) => {
                const pa = getStatusPriority(a.nextFollowDate);
                const pb = getStatusPriority(b.nextFollowDate);
                if (pa !== pb) return pa - pb;
                return new Date(a.nextFollowDate) - new Date(b.nextFollowDate);
            });

            setContacts(mapped);

        } catch (err) {
            console.error("Error fetching sales contacts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleConfirmDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workplan/work-plans/${pendingDeleteId}`, {
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
                console.error("Failed to delete contact:", json);
                alert(json.message || "Failed to delete");
            }
        } catch (err) {
            console.error("Error deleting contact:", err);
            alert("Error deleting contact.");
        } finally {
            setShowDeletePopup(false);
            setPendingDeleteId(null);
        }
    };

    const handleDateChange = async (id, newDate, remark) => {
        // Optimistic update
        setContacts(prev => prev.map(c => c.id === id ? { ...c, nextFollowDate: newDate } : c));
        setUpdateDatePopup({ isOpen: false, id: null, newDate: '' });
        
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workplan/work-plans/update-followup/${id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ next_followup: newDate, remarks: remark })
            });
            
            if (response.ok) {
                // Re-fetch to apply the backend's sorting rules
                fetchContacts();
            }
        } catch (error) {
            console.error("Error updating date:", error);
        }
    };

    const filteredContacts = contacts.filter(c =>
        String(c.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.mobile || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.allottedTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.currentStage || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { items: sortedContacts, requestSort, getSortDirection } = useSortableData(filteredContacts);

    const totalPages = Math.ceil(sortedContacts.length / entriesPerPage) || 1;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const paginatedContacts = sortedContacts.slice(startIndex, startIndex + parseInt(entriesPerPage));

    const getFollowUpStatusBadge = (dateStr) => {
        if (!dateStr) return '-';
        const today = new Date();
        today.setHours(0,0,0,0);
        const target = new Date(dateStr);
        target.setHours(0,0,0,0);
        const diff = target.getTime() - today.getTime();
        
        let label = 'In Followup';
        let colorClass = 'tw-bg-blue-500';
        
        if (diff === 0) {
            label = 'Today';
            colorClass = 'tw-bg-amber-500';
        } else if (diff < 0) {
            label = 'Overdue';
            colorClass = 'tw-bg-red-500';
        }
        
        return (
            <span className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-text-white ${colorClass}`}>
                {label}
            </span>
        );
    };

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
                /* Navigation arrows */
            `}</style>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-gap-3">
                        <h3 className="card-title tw-mb-0 max-[350px]:tw-text-center max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Work Plan Details</h3>
                        {hasPermission('Work Plan.Work Plan.Add') && (
                            <button className="btn-create tw-w-full sm:tw-w-auto" onClick={() => navigate('/work-plan/add')}>
                                Add Work Plan
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        <div className="list-top-bar tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-gap-3 sm:tw-gap-0 tw-mb-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <span className="tw-text-gray-600 tw-font-medium tw-w-16 sm:tw-w-auto tw-text-right">Show</span>
                                <select
                                    className="form-select form-select-sm tw-w-20 tw-inline-block"
                                    value={entriesPerPage}
                                    onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="tw-hidden md:tw-block">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped no-margin">
                                    <thead>
                                        <tr>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('id')}><div className="tw-flex tw-justify-between tw-items-center"># <TableSortIcon direction={getSortDirection('id')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('customerName')}><div className="tw-flex tw-justify-between tw-items-center">Customer Name <TableSortIcon direction={getSortDirection('customerName')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('mobile')}><div className="tw-flex tw-justify-between tw-items-center">Mobile <TableSortIcon direction={getSortDirection('mobile')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('allottedTo')}><div className="tw-flex tw-justify-between tw-items-center">Allotted To <TableSortIcon direction={getSortDirection('allottedTo')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('nextFollowDate')}><div className="tw-flex tw-justify-between tw-items-center">Next Follow Date <TableSortIcon direction={getSortDirection('nextFollowDate')} /></div></th>
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('nextFollowDate')}><div className="tw-flex tw-justify-between tw-items-center">Follow-up Status <TableSortIcon direction={getSortDirection('nextFollowDate')} /></div></th>
                                            {/* TEMPORARILY COMMENTED OUT PER USER REQUEST
                                            <th className="tw-align-middle tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => requestSort('currentStage')}><div className="tw-flex tw-justify-between tw-items-center">Current Stage <TableSortIcon direction={getSortDirection('currentStage')} /></div></th>
                                            */}
                                            {hasActionPermission && <th className="tw-align-middle">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedContacts.map((contact, index) => {
                                            let badgeColor = 'tw-bg-gray-500';
                                            if (contact.currentStage === 'In Followup') badgeColor = 'tw-bg-blue-500';
                                            if (contact.currentStage === 'Hold') badgeColor = 'tw-bg-amber-500';
                                            if (contact.currentStage === 'Closed') badgeColor = 'tw-bg-red-500';
                                            if (contact.currentStage === 'Converted') badgeColor = 'tw-bg-emerald-500';

                                            return (
                                                <tr key={contact.id}>
                                                    <td>{startIndex + index + 1}</td>
                                                    <td>{contact.customerName}</td>
                                                    <td>
                                                        <a href={`tel:${contact.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                            {contact.mobile}
                                                        </a>
                                                    </td>
                                                    <td>{contact.allottedTo}</td>
                                                    <td className="[&_.react-datepicker]:tw-font-sans [&_.react-datepicker]:tw-border [&_.react-datepicker]:tw-border-gray-300 [&_.react-datepicker]:tw-rounded-md [&_.react-datepicker]:tw-shadow-md [&_.react-datepicker__header]:tw-bg-white [&_.react-datepicker__header]:tw-border-none [&_.react-datepicker__header]:tw-pt-2 [&_.react-datepicker__day-names]:tw-mt-1 [&_.react-datepicker__day-names]:tw-border-b [&_.react-datepicker__day-names]:tw-border-gray-100 [&_.react-datepicker__day-name]:tw-w-8 [&_.react-datepicker__day-name]:tw-text-gray-700 [&_.react-datepicker__day]:tw-w-8 [&_.react-datepicker__day]:tw-leading-8 [&_.react-datepicker__day]:tw-m-0.5 [&_.react-datepicker__day--outside-month]:tw-text-gray-400 [&_.react-datepicker__day:hover]:tw-bg-gray-200 [&_.react-datepicker__day:hover]:tw-rounded-none [&_.react-datepicker__day--selected]:!tw-bg-blue-600 [&_.react-datepicker__day--selected]:!tw-text-white [&_.react-datepicker__day--selected]:!tw-font-bold [&_.react-datepicker__day--selected]:!tw-rounded-none [&_.react-datepicker__day--selected]:!tw-border-2 [&_.react-datepicker__day--selected]:!tw-border-black [&_.react-datepicker__day--keyboard-selected]:!tw-bg-blue-600 [&_.react-datepicker__day--keyboard-selected]:!tw-text-white [&_.react-datepicker__day--keyboard-selected]:!tw-font-bold [&_.react-datepicker__day--keyboard-selected]:!tw-rounded-none [&_.react-datepicker__day--keyboard-selected]:!tw-border-2 [&_.react-datepicker__day--keyboard-selected]:!tw-border-black [&_.react-datepicker__day--today]:!tw-bg-[#007bff] [&_.react-datepicker__day--today]:!tw-text-white [&_.react-datepicker__day--today]:!tw-font-bold [&_.react-datepicker__day--today]:!tw-rounded-none [&_.react-datepicker__day--today]:!tw-border-2 [&_.react-datepicker__day--today]:!tw-border-black [&_.react-datepicker__navigation]:tw-hidden">
                                                        <div className="tw-relative tw-inline-block tw-w-[140px]">
                                                            <DatePicker
                                                                className="form-control form-control-sm tw-pr-8 tw-w-full"
                                                                selected={contact.nextFollowDate ? new Date(contact.nextFollowDate) : null}
                                                                popperPlacement="bottom-start"
                                                                popperProps={{ strategy: 'fixed' }}
                                                            onChange={(date) => {
                                                                if(date) {
                                                                    const newDate = date.toLocaleDateString('en-CA');
                                                                    setUpdateDatePopup({ isOpen: true, id: contact.id, newDate });
                                                                }
                                                            }}
                                                            dateFormat="yyyy-MM-dd"
                                                            openToDate={new Date()}
                                                            renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                                                                <div className="tw-flex tw-justify-between tw-items-center tw-px-3 tw-pb-2">
                                                                    <div className="tw-text-black tw-font-bold tw-text-[15px] tw-flex tw-items-center tw-gap-1">
                                                                        {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                                                        <span className="tw-text-[10px] tw-ml-1">▼</span>
                                                                    </div>
                                                                    <div className="tw-flex tw-gap-3 tw-text-gray-600 tw-text-lg">
                                                                        <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="tw-bg-transparent tw-border-none tw-shadow-none hover:tw-text-black">
                                                                            ↑
                                                                        </button>
                                                                        <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="tw-bg-transparent tw-border-none tw-shadow-none hover:tw-text-black">
                                                                            ↓
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        >
                                                            <div className="tw-flex tw-justify-between tw-px-4 tw-py-2 tw-border-t tw-border-gray-200">
                                                                <button type="button" className="tw-bg-transparent tw-border-none tw-shadow-none tw-text-[#007bff] hover:tw-underline tw-text-sm" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    document.body.click(); // Hack to close datepicker
                                                                }}>Clear</button>
                                                                <button type="button" className="tw-bg-transparent tw-border-none tw-shadow-none tw-text-[#007bff] hover:tw-underline tw-text-sm" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const today = new Date().toLocaleDateString('en-CA');
                                                                    setUpdateDatePopup({ isOpen: true, id: contact.id, newDate: today });
                                                                    document.body.click(); // Hack to close datepicker
                                                                }}>Today</button>
                                                            </div>
                                                        </DatePicker>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tw-absolute tw-right-2 tw-top-1/2 -tw-translate-y-1/2 -tw-mt-[9px] tw-text-gray-800 tw-pointer-events-none">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                        </svg>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {getFollowUpStatusBadge(contact.nextFollowDate)}
                                                    </td>
                                                    {/* TEMPORARILY COMMENTED OUT PER USER REQUEST
                                                    <td>
                                                        <span className={`tw-inline-block tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium tw-text-white ${badgeColor}`}>
                                                            {contact.currentStage}
                                                        </span>
                                                    </td>
                                                    */}
                                                    {hasActionPermission && (
                                                        <td>
                                                            <div className="tw-flex tw-gap-2">
                                                                {hasPermission('Work Plan.Work Plan.Edit') && (
                                                                    <button
                                                                        type="button"
                                                                        className="list-action-btn btn-edit"
                                                                        title="Edit"
                                                                        onClick={() => navigate(`/work-plan/edit/${contact.id}`, { state: { from: '/work-plan' } })}
                                                                    >
                                                                        <PencilSimpleIcon weight="duotone" className="tw-w-4 " />
                                                                    </button>
                                                                )}
                                                                {hasPermission('Work Plan.Work Plan.Delete') && (
                                                                    <button
                                                                        type="button"
                                                                        className="list-action-btn btn-delete"
                                                                        title="Delete"
                                                                        onClick={() => {
                                                                            setPendingDeleteId(contact.id);
                                                                            setShowDeletePopup(true);
                                                                        }}
                                                                    >
                                                                        <TrashIcon weight="duotone" className="tw-w-4 " />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                        {paginatedContacts.length === 0 && (
                                            <tr>
                                                <td colSpan={hasActionPermission ? 7 : 6} className="tw-text-center tw-text-slate-400 tw-py-8">No records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginatedContacts.map((contact, index) => {
                                let badgeColor = 'tw-bg-gray-500';
                                if (contact.currentStage === 'In Followup') badgeColor = 'tw-bg-blue-500';
                                if (contact.currentStage === 'Hold') badgeColor = 'tw-bg-amber-500';
                                if (contact.currentStage === 'Closed') badgeColor = 'tw-bg-red-500';
                                if (contact.currentStage === 'Converted') badgeColor = 'tw-bg-emerald-500';

                                return (
                                    <MobileCard key={contact.id}>
                                        <MobileCard.Header label="CONTACT ID" value={`#${contact.id}`} />
                                        
                                        <MobileCard.Body>
                                            <div className="tw-flex tw-justify-between tw-items-start">
                                                <MobileCard.Field label="Customer Name" value={contact.customerName} bold />
                                            </div>
                                            
                                            <MobileCard.Field label="Mobile" value={
                                                <a href={`tel:${contact.mobile}`} className="tw-text-blue-600 hover:tw-underline">
                                                    {contact.mobile}
                                                </a>
                                            } inline />
                                            
                                            {/* TEMPORARILY COMMENTED OUT PER USER REQUEST
                                            <MobileCard.Field label="Current Stage" value={
                                                <span className={`tw-inline-block tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-text-white ${badgeColor}`}>
                                                    {contact.currentStage}
                                                </span>
                                            } inline />
                                            */}
                                            <MobileCard.Field label="Followup Status" value={
                                                getFollowUpStatusBadge(contact.nextFollowDate)
                                            } inline />
                                        </MobileCard.Body>
                                        
                                        <MobileCard.Footer className="tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-flex-col tw-gap-3 tw-items-start tw-col-span-2">
                                            <div className="tw-flex tw-gap-4 tw-w-full">
                                                <MobileCard.Field label="Allotted To" value={contact.allottedTo || '-'} />
                                                <MobileCard.Field 
                                                    label="Next Follow Date" 
                                                    value={<div className="[&_.react-datepicker]:tw-font-sans [&_.react-datepicker]:tw-border [&_.react-datepicker]:tw-border-gray-300 [&_.react-datepicker]:tw-rounded-md [&_.react-datepicker]:tw-shadow-md [&_.react-datepicker__header]:tw-bg-white [&_.react-datepicker__header]:tw-border-none [&_.react-datepicker__header]:tw-pt-2 [&_.react-datepicker__day-names]:tw-mt-1 [&_.react-datepicker__day-names]:tw-border-b [&_.react-datepicker__day-names]:tw-border-gray-100 [&_.react-datepicker__day-name]:tw-w-8 [&_.react-datepicker__day-name]:tw-text-gray-700 [&_.react-datepicker__day]:tw-w-8 [&_.react-datepicker__day]:tw-leading-8 [&_.react-datepicker__day]:tw-m-0.5 [&_.react-datepicker__day--outside-month]:tw-text-gray-400 [&_.react-datepicker__day:hover]:tw-bg-gray-200 [&_.react-datepicker__day:hover]:tw-rounded-none [&_.react-datepicker__day--selected]:!tw-bg-blue-600 [&_.react-datepicker__day--selected]:!tw-text-white [&_.react-datepicker__day--selected]:!tw-font-bold [&_.react-datepicker__day--selected]:!tw-rounded-none [&_.react-datepicker__day--selected]:!tw-border-2 [&_.react-datepicker__day--selected]:!tw-border-black [&_.react-datepicker__day--keyboard-selected]:!tw-bg-blue-600 [&_.react-datepicker__day--keyboard-selected]:!tw-text-white [&_.react-datepicker__day--keyboard-selected]:!tw-font-bold [&_.react-datepicker__day--keyboard-selected]:!tw-rounded-none [&_.react-datepicker__day--keyboard-selected]:!tw-border-2 [&_.react-datepicker__day--keyboard-selected]:!tw-border-black [&_.react-datepicker__day--today]:!tw-bg-[#007bff] [&_.react-datepicker__day--today]:!tw-text-white [&_.react-datepicker__day--today]:!tw-font-bold [&_.react-datepicker__day--today]:!tw-rounded-none [&_.react-datepicker__day--today]:!tw-border-2 [&_.react-datepicker__day--today]:!tw-border-black [&_.react-datepicker__navigation]:tw-hidden">
                                                        <div className="tw-relative tw-inline-block tw-w-[140px]">
                                                        <DatePicker 
                                                        className="form-control form-control-sm tw-pr-8 tw-w-full" 
                                                        selected={contact.nextFollowDate ? new Date(contact.nextFollowDate) : null} 
                                                        popperPlacement="bottom-start"
                                                        popperProps={{ strategy: 'fixed' }}
                                                        onChange={(date) => { if(date) { const newDate = date.toLocaleDateString('en-CA'); setUpdateDatePopup({ isOpen: true, id: contact.id, newDate }); } }} 
                                                        dateFormat="yyyy-MM-dd" 
                                                        openToDate={new Date()} 
                                                        withPortal
                                                        renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                                                            <div className="tw-flex tw-justify-between tw-items-center tw-px-3 tw-pb-2">
                                                                <div className="tw-text-black tw-font-bold tw-text-[15px] tw-flex tw-items-center tw-gap-1">
                                                                    {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                                                    <span className="tw-text-[10px] tw-ml-1">▼</span>
                                                                </div>
                                                                <div className="tw-flex tw-gap-3 tw-text-gray-600 tw-text-lg">
                                                                    <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="tw-bg-transparent tw-border-none tw-shadow-none hover:tw-text-black">↑</button>
                                                                    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="tw-bg-transparent tw-border-none tw-shadow-none hover:tw-text-black">↓</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    >
                                                        <div className="tw-flex tw-justify-between tw-px-4 tw-py-2 tw-border-t tw-border-gray-200">
                                                            <button type="button" className="tw-bg-transparent tw-border-none tw-shadow-none tw-text-[#007bff] hover:tw-underline tw-text-sm" onClick={(e) => { e.preventDefault(); document.body.click(); }}>Clear</button>
                                                            <button type="button" className="tw-bg-transparent tw-border-none tw-shadow-none tw-text-[#007bff] hover:tw-underline tw-text-sm" onClick={(e) => { e.preventDefault(); const today = new Date().toLocaleDateString('en-CA'); setUpdateDatePopup({ isOpen: true, id: contact.id, newDate: today }); document.body.click(); }}>Today</button>
                                                        </div>
                                                    </DatePicker>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tw-absolute tw-right-2 tw-top-1/2 -tw-translate-y-1/2 -tw-mt-[9px] tw-text-gray-800 tw-pointer-events-none">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                    </svg>
                                                    </div></div>} 
                                                    align="right"   
                                                />
                                            </div>
                                            
                                            {hasActionPermission && (
                                                <div className="tw-w-full tw-flex tw-justify-end tw-border-t tw-border-gray-100 tw-pt-2 tw-mt-1">
                                                    <MobileCard.Actions>
                                                    {hasPermission('Work Plan.Work Plan.Edit') && (
                                                        <button
                                                            type="button"
                                                            className="list-action-btn btn-edit tw-shadow-none"
                                                            title="Edit"
                                                            onClick={() => navigate(`/work-plan/edit/${contact.id}`, { state: { from: '/work-plan' } })}
                                                        >
                                                            <PencilSimpleIcon weight="duotone" className="tw-w-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Work Plan.Work Plan.Delete') && (
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
                                );
                            })}
                            
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
                            startIndex={startIndex}
                            entriesPerPage={entriesPerPage}
                            totalEntries={sortedContacts.length}
                        />
                    </div>
                </div>
            </div>
            <DeletePopup
                isOpen={showDeletePopup}
                onClose={() => { setShowDeletePopup(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
            <UpdateFollowupDatePopup 
                isOpen={updateDatePopup.isOpen}
                newDate={updateDatePopup.newDate}
                onClose={() => setUpdateDatePopup({ isOpen: false, id: null, newDate: '' })}
                onConfirm={(remark) => handleDateChange(updateDatePopup.id, updateDatePopup.newDate, remark)}
            />
        </section>
    );
};

export default WorkPlanList;
