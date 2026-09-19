import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const EmployeeBrandAdd = () => {
    const navigate = useNavigate();

    // State for dynamic brand rows
    const [brands, setBrands] = useState([{ id: 1, name: null }]);

    const handleAddBrand = () => {
        const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
        setBrands([...brands, { id: newId, name: null }]);
    };

    const handleRemoveBrand = (id) => {
        if (brands.length > 1) {
            setBrands(brands.filter(b => b.id !== id));
        }
    };

    const handleBrandChange = (id, value) => {
        setBrands(brands.map(b => b.id === id ? { ...b, name: value } : b));
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
            const selectedBrands = brands.filter(b => b.name).map(b => b.name);
            const payload = {
                employee_id: employeeName,
                brands: selectedBrands
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-brand-mapping`, {
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
                navigate('/power-master/employee/brand-mapping');
            } else {
                const detail = result?.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result?.message;
                setApiError(detail || 'Failed to create employee brand mapping.');
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
    const [brandOptions, setBrandOptions] = useState([]);

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

        const fetchBrands = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/brand`, {
                    headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                });
                const result = await __apiRes2.json();
                if (result.status && result.data) {
                    setBrandOptions(result.data.map(brand => ({ value: brand.id, label: brand.name })));
                }
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        fetchEmployees();
        fetchBrands();
    }, []);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Create Employee Brand Mapping</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/employee/brand-mapping')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <form onSubmit={handleSubmit}>
                            {/* Employee Name Select - Stacked design matching Create Company */}
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

                            {/* Brand Name Table */}
                            <div className="row mb-2">
                                <div className="col-12">
                                    <h5 className="tw-font-semibold tw-mb-3">Brand Name</h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered no-margin">
                                            <thead>
                                                <tr>
                                                    <th className="tw-w-16">S.No</th>
                                                    <th>Brand Name</th>
                                                    <th className="tw-w-32">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {brands.map((brand, index) => (
                                                    <tr key={brand.id}>
                                                        <td className="align-middle">{index + 1}</td>
                                                        <td className="align-middle">
                                                            <Select
                                                                options={brandOptions}
                                                                value={brandOptions.find(o => o.value === brand.name) || null}
                                                                onChange={(selected) => handleBrandChange(brand.id, selected ? selected.value : null)}
                                                                placeholder="Choose a Brand"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="tw-flex tw-justify-start tw-gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-delete"
                                                                    onClick={() => handleRemoveBrand(brand.id)}
                                                                    disabled={brands.length === 1}
                                                                >
                                                                    <Trash weight="bold" className="tw-w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-add"
                                                                    onClick={handleAddBrand}
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

                            {/* Form Actions - matching EmployeeTypeAdd design */}
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/employee/brand-mapping')}>Cancel</button>
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

export default EmployeeBrandAdd;
