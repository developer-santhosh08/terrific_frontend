import { useState, useEffect } from 'react';
import { useLoader } from '../../context/LoaderContext';
import TableSortIcon from '../../components/TableSortIcon';
import SubmitPopup from '../../components/Popup/SubmitPopup';
import UpdatePopup from '../../components/Popup/UpdatePopup';
import SuccessPopup from '../../components/Popup/SuccessPopup';
import MobileCard from '../../components/common/MobileCard';

import { useLocation } from 'react-router-dom';

const toInputDate = (d) => d.toISOString().split('T')[0];

const PayrollEntry = () => {
    const { setLoading } = useLoader();
    const location = useLocation();
    const [date, setDate]         = useState(location.state?.selectedDate || toInputDate(new Date()));
    const [employees, setEmployees] = useState([]);
    
    // Popup states
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const fetchAttendanceAndEmployees = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                // Fetch all employees
                const empRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`, { headers });
                const empJson = await empRes.json();
                const empData = Array.isArray(empJson) ? empJson : (empJson?.data || []);

                // Fetch attendance for selected date
                const attRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/attendance/${date}`, { headers });
                const attJson = await attRes.json();
                const attData = attJson?.data || null;

                if (attData && attData.logs && attData.logs.length > 0) {
                    setIsSaved(true);
                    
                    // Map existing logs to employee list
                    const logMap = {};
                    attData.logs.forEach(log => {
                        logMap[log.al_employee_id] = log;
                    });

                    const mapped = empData.map(item => {
                        const log = logMap[item.id];
                        return {
                            id: item.id,
                            name: item.name,
                            status: log ? (log.al_present === 1) : false,
                            ot: log ? (log.ot === 1) : false,
                            inTime: log ? (log.al_intime || '') : '',
                            outTime: log ? (log.al_outtime || '') : '',
                            otHrs: log ? (log.al_ot || '') : ''
                        };
                    });
                    setEmployees(mapped);
                } else {
                    setIsSaved(false);
                    // Reset to defaults
                    const mapped = empData.map(item => ({
                        id: item.id,
                        name: item.name,
                        status: false,
                        ot: false,
                        inTime: '',
                        outTime: '',
                        otHrs: ''
                    }));
                    setEmployees(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendanceAndEmployees();
    }, [date, setLoading]);
    const [search, setSearch]     = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage]         = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const update = (id, field, value) =>
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

    const handleStatus = (id, checked) =>
        setEmployees(prev => prev.map(e =>
            e.id === id
                ? { ...e, status: checked, ot: false, inTime: '', outTime: '', otHrs: '' }
                : e
        ));

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
        setPage(1);
    };

    const handleSearch = (val) => { setSearch(val); setPage(1); };
    const handlePageSize = (val) => { setPageSize(Number(val)); setPage(1); };

    /* filter → sort → paginate */
    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        if (!sortConfig.key) return 0;
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage   = Math.min(page, totalPages);
    const start      = (safePage - 1) * pageSize;
    const paginated  = sorted.slice(start, start + pageSize);
    const showFrom   = sorted.length === 0 ? 0 : start + 1;
    const showTo     = Math.min(start + pageSize, sorted.length);

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const payload = {
                attendance_date: date,
                employees: employees.map(emp => ({
                    employee_id: emp.id,
                    status: !!emp.status,
                    is_ot: !!emp.ot,
                    intime: emp.inTime || null,
                    outtime: emp.outTime || null,
                    ot_hours: emp.otHrs ? Number(emp.otHrs) : null
                }))
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                setIsSaved(true);
                setSuccessMsg(isSaved ? "Attendance updated successfully!" : "Attendance saved successfully!");
                setShowSuccessPopup(true);
            } else {
                console.error('Failed to save attendance', data);
                alert(data.message || 'Failed to save attendance');
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const handleMainButtonClick = () => {
        if (isSaved) {
            setShowUpdatePopup(true);
        } else {
            setShowSubmitPopup(true);
        }
    };
    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border">
                        <h3 className="card-title">Payroll Entry</h3>
                    </div>
                    <div className="card-body">

                        {/* Date */}
                        <div className="row">
                            <div className="col-md-3 form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Show entries + Search */}
                        <div className="list-top-bar">
                            <div className="d-flex align-items-center">
                                <span>Show</span>
                                <select
                                    className="form-select form-select-sm mx-2 tw-w-20 tw-border-slate-300"
                                    value={pageSize}
                                    onChange={e => handlePageSize(e.target.value)}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2">Search:</span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm tw-border-slate-300"
                                    style={{ width: 'auto' }}
                                    value={search}
                                    onChange={e => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive tw-hidden md:tw-block">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th className="tw-w-16"><div className="tw-flex tw-justify-between tw-items-center">#</div></th>
                                        <th className="tw-cursor-pointer tw-select-none" onClick={() => handleSort('name')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">Employee <TableSortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></div>
                                        </th>
                                        <th className="tw-w-24"><div className="tw-flex tw-justify-between tw-items-center">Status</div></th>
                                        <th className="tw-w-20"><div className="tw-flex tw-justify-between tw-items-center">OT</div></th>
                                        <th><div className="tw-flex tw-justify-between tw-items-center">Intime</div></th>
                                        <th><div className="tw-flex tw-justify-between tw-items-center">OutTime</div></th>
                                        <th className="tw-w-32"><div className="tw-flex tw-justify-between tw-items-center">OT(hrs)</div></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((emp, idx) => (
                                        <tr key={emp.id}>
                                            <td className="tw-text-center tw-align-middle">{start + idx + 1}</td>
                                            <td className="tw-align-middle">{emp.name}</td>
                                            <td className="tw-text-center tw-align-middle">
                                                <div className="tw-flex tw-justify-center tw-items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`status-${emp.id}`}
                                                        checked={emp.status}
                                                        onChange={e => handleStatus(emp.id, e.target.checked)}
                                                    />
                                                    <label htmlFor={`status-${emp.id}`} style={{ marginBottom: 0 }} />
                                                </div>
                                            </td>
                                            <td className="tw-text-center tw-align-middle">
                                                <div className="tw-flex tw-justify-center tw-items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`ot-${emp.id}`}
                                                        checked={emp.ot}
                                                        disabled={!emp.status}
                                                        onChange={e => update(emp.id, 'ot', e.target.checked)}
                                                    />
                                                    <label htmlFor={`ot-${emp.id}`} style={{ marginBottom: 0 }} />
                                                </div>
                                            </td>
                                            <td className="tw-align-middle">
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    value={emp.inTime}
                                                    disabled={!emp.status}
                                                    onChange={e => update(emp.id, 'inTime', e.target.value)}
                                                />
                                            </td>
                                            <td className="tw-align-middle">
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    value={emp.outTime}
                                                    disabled={!emp.status}
                                                    onChange={e => update(emp.id, 'outTime', e.target.value)}
                                                />
                                            </td>
                                            <td className="tw-align-middle">
                                                <input
                                                    type="text"
                                                    className="form-control tw-text-center"
                                                    placeholder="OT"
                                                    value={emp.otHrs}
                                                    disabled={!emp.status || !emp.ot}
                                                    onChange={e => update(emp.id, 'otHrs', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="tw-text-center tw-text-slate-400 tw-py-6">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="tw-block md:tw-hidden tw-mt-4">
                            {paginated.map((emp, idx) => (
                                <MobileCard key={emp.id}>
                                    <MobileCard.Header label="#" value={start + idx + 1} />
                                    <MobileCard.Body>
                                        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                            <MobileCard.Field label="Employee" value={emp.name} />
                                            <MobileCard.Field label="Status" value={
                                                <div className="tw-flex tw-justify-start tw-items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`status-mob-${emp.id}`}
                                                        checked={emp.status}
                                                        onChange={e => handleStatus(emp.id, e.target.checked)}
                                                    />
                                                    <label htmlFor={`status-mob-${emp.id}`} style={{ marginBottom: 0, marginLeft: '0.5rem' }}>Present</label>
                                                </div>
                                            } />
                                            <MobileCard.Field label="OT" value={
                                                <div className="tw-flex tw-justify-start tw-items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`ot-mob-${emp.id}`}
                                                        checked={emp.ot}
                                                        disabled={!emp.status}
                                                        onChange={e => update(emp.id, 'ot', e.target.checked)}
                                                    />
                                                    <label htmlFor={`ot-mob-${emp.id}`} style={{ marginBottom: 0, marginLeft: '0.5rem' }}>OT</label>
                                                </div>
                                            } />
                                            <MobileCard.Field label="Intime" value={
                                                <input
                                                    type="time"
                                                    className="form-control form-control-sm"
                                                    value={emp.inTime}
                                                    disabled={!emp.status}
                                                    onChange={e => update(emp.id, 'inTime', e.target.value)}
                                                />
                                            } />
                                            <MobileCard.Field label="OutTime" value={
                                                <input
                                                    type="time"
                                                    className="form-control form-control-sm"
                                                    value={emp.outTime}
                                                    disabled={!emp.status}
                                                    onChange={e => update(emp.id, 'outTime', e.target.value)}
                                                />
                                            } />
                                            <MobileCard.Field label="OT(hrs)" value={
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm tw-text-center"
                                                    placeholder="OT"
                                                    value={emp.otHrs}
                                                    disabled={!emp.status || !emp.ot}
                                                    onChange={e => update(emp.id, 'otHrs', e.target.value)}
                                                />
                                            } />
                                        </div>
                                    </MobileCard.Body>
                                </MobileCard>
                            ))}
                            {paginated.length === 0 && (
                                <div className="tw-text-center tw-text-slate-400 tw-py-8">No records found</div>
                            )}
                        </div>

                        {/* Bottom: Showing info + Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="tw-text-xs tw-text-slate-500">
                                Showing {showFrom} to {showTo} of {sorted.length} entries
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-3 tw-text-sm">
                                <span
                                    className={`tw-cursor-pointer ${safePage === 1 ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => safePage > 1 && setPage(safePage - 1)}
                                >
                                    Previous
                                </span>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <span
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`tw-px-3 tw-py-1 tw-rounded-sm tw-cursor-pointer ${p === safePage ? 'tw-bg-blue-600 tw-text-white' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    >
                                        {p}
                                    </span>
                                ))}
                                <span
                                    className={`tw-cursor-pointer ${safePage === totalPages ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => safePage < totalPages && setPage(safePage + 1)}
                                >
                                    Next
                                </span>
                            </div>
                        </div>

                        {/* Save / Update Button */}
                        <div className="d-flex justify-content-end mt-4">
                            <button
                                className={`btn ${isSaved ? 'btn-primary' : 'btn-success'}`}
                                style={{ minWidth: 100 }}
                                onClick={handleMainButtonClick}
                            >
                                {isSaved ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popups */}
            <SubmitPopup 
                isOpen={showSubmitPopup} 
                onClose={() => setShowSubmitPopup(false)} 
                onConfirm={handleSave} 
            />
            <UpdatePopup 
                isOpen={showUpdatePopup} 
                onClose={() => setShowUpdatePopup(false)} 
                onConfirm={handleSave} 
            />
            <SuccessPopup 
                isOpen={showSuccessPopup} 
                onClose={() => setShowSuccessPopup(false)} 
                message={successMsg} 
            />
        </section>
    );
};

export default PayrollEntry;
