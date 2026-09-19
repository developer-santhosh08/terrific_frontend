import { useState, useEffect } from 'react';
import Select from 'react-select';
import TableSortIcon from '../../components/TableSortIcon';
import { useLoader } from '../../context/LoaderContext';

const rsStyles = {
    control: (p) => ({ ...p, background: '#fff', minHeight: '36px' }),
    menu:    (p) => ({ ...p, zIndex: 9999 }),
};

const toInputDate = (d) => d.toISOString().split('T')[0];

const PayrollReport = () => {
    const { setLoading } = useLoader();
    const today = toInputDate(new Date());

    const [from, setFrom]         = useState('');
    const [to, setTo]             = useState('');
    const [employee, setEmployee] = useState({ value: '', label: 'All' });
    const [employeeOptions, setEmployeeOptions] = useState([]);
    
    const [reportData, setReportData] = useState([]);
    const [search, setSearch]     = useState('');
    const [pageSize]              = useState(10);
    const [page, setPage]         = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const json = await res.json();
                const data = Array.isArray(json) ? json : (json?.data || []);
                setEmployeeOptions([
                    { value: '', label: 'All' },
                    ...data.map(e => ({ value: e.id, label: e.name }))
                ]);
            } catch (err) {
                console.error("Failed to fetch employees", err);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const empId = employee ? employee.value : '';
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/report?from_date=${from}&to_date=${to}&employee_id=${empId}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const json = await res.json();
                if (res.ok && json.status === 'success') {
                    setReportData(json.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch report", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [from, to, employee, setLoading]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
        setPage(1);
    };

    const data = reportData.map(item => ({
        employee: item.employee_name,
        date: item.date,
        present: item.present === 1 ? 'Yes' : 'No',
        absent: item.absent === 1 ? 'Yes' : 'No',
        inTime: item.in_time || '-',
        outTime: item.out_time || '-',
        ot: item.ot || '-'
    }));

    const filtered = data.filter(r =>
        Object.values(r).some(v =>
            String(v).toLowerCase().includes(search.toLowerCase())
        )
    );

    const sorted = [...filtered].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const av = a[sortConfig.key], bv = b[sortConfig.key];
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage   = Math.min(page, totalPages);
    const start      = (safePage - 1) * pageSize;
    const paginated  = sorted.slice(start, start + pageSize);
    const showFrom   = sorted.length === 0 ? 0 : start + 1;
    const showTo     = Math.min(start + pageSize, sorted.length);

    const cols = [
        { key: 'employee', label: 'Employee Name' },
        { key: 'date',     label: 'Date'          },
        { key: 'present',  label: 'Present'       },
        { key: 'absent',   label: 'Absent'        },
        { key: 'inTime',   label: 'In Time'       },
        { key: 'outTime',  label: 'Out Time'      },
        { key: 'ot',       label: 'OT'            },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border">
                        <h3 className="card-title">Payroll Employee Wise</h3>
                    </div>
                    <div className="card-body">

                        {/* Filter fields — one row, three fields */}
                        <div className="row">
                            <div className="col-md-3 form-group">
                                <label>From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Employee Name</label>
                                <Select
                                    options={employeeOptions}
                                    styles={rsStyles}
                                    value={employee}
                                    onChange={setEmployee}
                                    placeholder="Select Employee"
                                />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="d-flex justify-content-end align-items-center mb-3 tw-text-sm tw-text-slate-600">
                            <span className="me-2">Search:</span>
                            <input
                                type="text"
                                className="form-control form-control-sm tw-border-slate-300"
                                style={{ width: 'auto' }}
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-cursor-pointer tw-select-none" onClick={() => handleSort('sno')}>
                                            <div className="tw-flex tw-justify-between tw-items-center">S.no <TableSortIcon direction={sortConfig.key === 'sno' ? sortConfig.direction : null} /></div>
                                        </th>
                                        {cols.map(c => (
                                            <th key={c.key} className="tw-cursor-pointer tw-select-none" onClick={() => handleSort(c.key)}>
                                                <div className="tw-flex tw-justify-between tw-items-center">{c.label} <TableSortIcon direction={sortConfig.key === c.key ? sortConfig.direction : null} /></div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length > 0 ? paginated.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="tw-align-middle tw-text-center">{start + idx + 1}</td>
                                            <td className="tw-align-middle">{row.employee}</td>
                                            <td className="tw-align-middle tw-text-center">{row.date}</td>
                                            <td className="tw-align-middle tw-text-center">{row.present}</td>
                                            <td className="tw-align-middle tw-text-center">{row.absent}</td>
                                            <td className="tw-align-middle tw-text-center">{row.inTime}</td>
                                            <td className="tw-align-middle tw-text-center">{row.outTime}</td>
                                            <td className="tw-align-middle tw-text-center">{row.ot}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="tw-text-center tw-text-slate-400 tw-py-6">
                                                No data available in table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Showing info + Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="tw-text-xs tw-text-slate-500">
                                Showing {showFrom} to {showTo} of {sorted.length} entries
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-flex-wrap tw-justify-end">
                                <span
                                    className={`tw-cursor-pointer ${safePage === 1 ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => safePage > 1 && setPage(safePage - 1)}
                                >
                                    Previous
                                </span>
                                {(() => {
                                    const pages = [];
                                    if (totalPages <= 7) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        if (safePage <= 4) {
                                            pages.push(1, 2, 3, 4, 5, '...', totalPages);
                                        } else if (safePage >= totalPages - 3) {
                                            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                        } else {
                                            pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
                                        }
                                    }
                                    return pages.map((p, idx) => (
                                        <span
                                            key={idx}
                                            onClick={() => p !== '...' && setPage(p)}
                                            className={`tw-px-2 tw-py-1 tw-rounded-sm ${p === '...' ? 'tw-cursor-default tw-text-slate-400' : 'tw-cursor-pointer'} ${p === safePage ? 'tw-bg-blue-600 tw-text-white' : (p !== '...' ? 'tw-text-slate-500 hover:tw-text-blue-600' : '')}`}
                                        >
                                            {p}
                                        </span>
                                    ));
                                })()}
                                <span
                                    className={`tw-cursor-pointer ${safePage === totalPages ? 'tw-text-slate-300' : 'tw-text-slate-500 hover:tw-text-blue-600'}`}
                                    onClick={() => safePage < totalPages && setPage(safePage + 1)}
                                >
                                    Next
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default PayrollReport;
