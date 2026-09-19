import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';
import { useEffect } from 'react';
const EmployeeBusinessAdd = () => {
    const navigate = useNavigate();

    // State for dynamic business vertical rows
    const [businessVerticals, setBusinessVerticals] = useState([{ id: 1, name: null, from_date: '', to_date: '' }]);

    const handleAddBusinessVertical = () => {
        const newId = businessVerticals.length > 0 ? Math.max(...businessVerticals.map(b => b.id)) + 1 : 1;
        setBusinessVerticals([...businessVerticals, { id: newId, name: null, from_date: '', to_date: '' }]);
    };

    const handleRemoveBusinessVertical = (id) => {
        if (businessVerticals.length > 1) {
            setBusinessVerticals(businessVerticals.filter(b => b.id !== id));
        }
    };

    const handleBusinessVerticalChange = (id, field, value) => {
        setBusinessVerticals(businessVerticals.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const [employeeName, setEmployeeName] = useState(null);
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const { loading, setLoading } = useLoader();
    const [apiError, setApiError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setApiError('');
        const newErrors = {};
        if (!employeeName) newErrors.employeeName = 'The employee name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const selectedVerticals = businessVerticals.filter(b => b.name).map(b => ({
                business_vertical_id: b.name,
                from_date: b.from_date,
                to_date: b.to_date
            }));
            const payload = {
                employee_id: employeeName,
                business_verticals: selectedVerticals
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-business-vertical-mapping`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result?.status) {
                navigate('/power-master/employee/business-vertical-mapping');
            } else {
                const detail = result?.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result?.message;
                setApiError(detail || 'Failed to create employee business vertical mapping.');
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setApiError('Network error. Please try again.');
            setShowSubmitPopup(false);
        } finally {
            setLoading(false);
        }
    };

    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [businessVerticalOptions, setBusinessVerticalOptions] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee`, {
                    headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                });
                const result = await __apiRes.json();
                if (result.status && result.data) {
                    setEmployeeOptions(result.data.map(emp => ({ value: emp.id, label: emp.name })));
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        const fetchVerticals = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/business-vertical`, {
                    headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                });
                const result = await __apiRes.json();
                if (result.status && result.data) {
                    setBusinessVerticalOptions(result.data.map(item => ({ value: item.id, label: item.name })));
                }
            } catch (error) {
                console.error("Error fetching business verticals:", error);
            }
        };

        fetchEmployees();
        fetchVerticals();
    }, []);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Create Employee Business Vertical Mapping</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/employee/business-vertical-mapping')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <form onSubmit={handleSubmit}>
                            {/* Employee Name Select - Stacked design */}
                            <div className="row mb-4">
                                <div className="col-12 col-md-3 form-group">
                                    <label>Employee Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={employeeOptions}
                                        value={employeeOptions.find(o => o.value === employeeName) || null}
                                        onChange={(selected) => { setEmployeeName(selected ? selected.value : null); if (errors.employeeName) setErrors(p => ({ ...p, employeeName: '' })); }}
                                        placeholder="Choose a Employee Name"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={errors.employeeName ? { control: (b) => ({ ...b, borderColor: '#dc3545' }) } : {}}
                                    />
                                    {errors.employeeName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.employeeName}</span>}
                                </div>
                            </div>

                            {/* Business Vertical Name Table */}
                            <div className="row mb-2">
                                <div className="col-12">
                                    <h5 className="tw-font-semibold tw-mb-3">Business Vertical Name</h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered no-margin">
                                            <thead>
                                                <tr>
                                                    <th className="tw-w-16">S.No</th>
                                                    <th>Business Vertical Name</th>
                                                    <th>From Date</th>
                                                    <th>To Date</th>
                                                    <th className="tw-w-32">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {businessVerticals.map((vertical, index) => (
                                                    <tr key={vertical.id}>
                                                        <td className="align-middle">{index + 1}</td>
                                                        <td className="align-middle">
                                                            <Select
                                                                options={businessVerticalOptions}
                                                                value={businessVerticalOptions.find(o => o.value === vertical.name) || null}
                                                                onChange={(selected) => handleBusinessVerticalChange(vertical.id, 'name', selected ? selected.value : null)}
                                                                placeholder="Choose Business Vertical"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                placeholder="From Date"
                                                                value={vertical.from_date}
                                                                onChange={(e) => handleBusinessVerticalChange(vertical.id, 'from_date', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                placeholder="To Date"
                                                                value={vertical.to_date}
                                                                onChange={(e) => handleBusinessVerticalChange(vertical.id, 'to_date', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="tw-flex tw-justify-start tw-gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-delete"
                                                                    onClick={() => handleRemoveBusinessVertical(vertical.id)}
                                                                    disabled={businessVerticals.length === 1}
                                                                >
                                                                    <Trash weight="bold" className="tw-w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-add"
                                                                    onClick={handleAddBusinessVertical}
                                                                >
                                                                    <Plus weight="bold" className="tw-w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Form Actions */}
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/employee/business-vertical-mapping')}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
        );
};

export default EmployeeBusinessAdd;
