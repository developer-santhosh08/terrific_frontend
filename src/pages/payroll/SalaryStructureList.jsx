import { useState, useEffect } from 'react';
import { useLoader } from '../../context/LoaderContext';
import { usePermissions } from '../../context/PermissionContext';
import MobileCard from '../../components/common/MobileCard';

const SalaryStructureList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Payroll.Salary Structure.Edit') || hasPermission('Payroll.Salary Structure.Delete');
    const { setLoading } = useLoader();
    const [structures, setStructures] = useState([]);
    
    // Form state
    const [employeeId, setEmployeeId] = useState('');
    const [basic, setBasic] = useState('');
    const [hra, setHra] = useState('');
    const [da, setDa] = useState('');
    const [allowances, setAllowances] = useState('');
    const [deductions, setDeductions] = useState('');

    useEffect(() => {
        fetchStructures();
    }, []);

    const fetchStructures = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/salary-structures`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const json = await res.json();
            if (res.ok && json.status === 'success') {
                setStructures(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch salary structures", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payroll/salary-structures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    employee_id: employeeId,
                    basic_salary: basic,
                    hra: hra || 0,
                    da: da || 0,
                    other_allowances: allowances || 0,
                    fixed_deductions: deductions || 0
                })
            });
            const json = await res.json();
            if (res.ok && json.status === 'success') {
                alert('Salary structure saved!');
                fetchStructures();
            } else {
                alert('Failed to save structure');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid tw-py-4">
                <div className="row">
                    {/* Setup Form */}
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Setup Salary Structure</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSave}>
                                    <div className="form-group mb-3">
                                        <label>Employee ID</label>
                                        <input type="number" className="form-control" required value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Basic Salary</label>
                                        <input type="number" step="0.01" className="form-control" required value={basic} onChange={e => setBasic(e.target.value)} />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>HRA</label>
                                        <input type="number" step="0.01" className="form-control" value={hra} onChange={e => setHra(e.target.value)} />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>DA</label>
                                        <input type="number" step="0.01" className="form-control" value={da} onChange={e => setDa(e.target.value)} />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Allowances</label>
                                        <input type="number" step="0.01" className="form-control" value={allowances} onChange={e => setAllowances(e.target.value)} />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Fixed Deductions (Tax, PF)</label>
                                        <input type="number" step="0.01" className="form-control" value={deductions} onChange={e => setDeductions(e.target.value)} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 tw-bg-blue-600">Save Structure</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Structures List */}
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Existing Structures</h3>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive tw-hidden md:tw-block">
                                    <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>Emp ID</th>
                                            <th>Basic</th>
                                            <th>HRA</th>
                                            <th>DA</th>
                                            <th>Allowances</th>
                                            <th>Deductions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {structures.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.employee_id}</td>
                                                <td>{s.basic_salary}</td>
                                                <td>{s.hra}</td>
                                                <td>{s.da}</td>
                                                <td>{s.other_allowances}</td>
                                                <td>{s.fixed_deductions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                                
                                {/* Mobile View */}
                                <div className="tw-block md:tw-hidden tw-mt-4">
                                    {structures.length > 0 ? structures.map((s, idx) => (
                                        <MobileCard key={s.id}>
                                            <MobileCard.Header label="#" value={idx + 1} />
                                            <MobileCard.Body>
                                                <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                                    <MobileCard.Field label="Emp ID" value={s.employee_id} />
                                                    <MobileCard.Field label="Basic" value={s.basic_salary} />
                                                    <MobileCard.Field label="HRA" value={s.hra} />
                                                    <MobileCard.Field label="DA" value={s.da} />
                                                    <MobileCard.Field label="Allowances" value={s.other_allowances} />
                                                    <MobileCard.Field label="Deductions" value={s.fixed_deductions} />
                                                </div>
                                            </MobileCard.Body>
                                        </MobileCard>
                                    )) : (
                                        <div className="tw-text-center tw-text-slate-400 tw-py-8">No data available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SalaryStructureList;
