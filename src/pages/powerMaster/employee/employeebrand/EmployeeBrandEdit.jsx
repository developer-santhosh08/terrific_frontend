import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const EmployeeBrandEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // State for dynamic brand rows
    const [brands, setBrands] = useState([{ id: 1, name: null }]); // prefill for edit

    const handleAddBrand = () => {
        const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
        setBrands([...brands, { id: newId, name: null }]);
    };

    const handleRemoveBrand = (removeId) => {
        if (brands.length > 1) {
            setBrands(brands.filter(b => b.id !== removeId));
        }
    };

    const handleBrandChange = (changeId, value) => {
        setBrands(brands.map(b => b.id === changeId ? { ...b, name: value } : b));
    };

    const [employeeName, setEmployeeName] = useState(null);
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const { loading, setLoading } = useLoader();
    const [apiError, setApiError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setApiError('');
        const newErrors = {};
        if (!employeeName) newErrors.employeeName = 'The employee name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const selectedBrands = brands.filter(b => b.name).map(b => b.name);
            const payload = {
                employee_id: employeeName,
                brands: selectedBrands
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-brand-mapping/${id}`, {
                method: 'PUT',
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
                setApiError(detail || 'Failed to update employee brand mapping.');
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error('Error updating form:', error);
            setApiError('Network error. Please try again.');
            setShowUpdatePopup(false);
        } finally {
            setLoading(false);
        }
    };

    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const [empRes, brandRes, mapRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee`, {
                        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/brand`, {
                        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-brand-mapping/${id}`, {
                        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                    })
                ]);

                const empData = await empRes.json();
                if (empData.status && empData.data) {
                    setEmployeeOptions(empData.data.map(emp => ({ value: emp.id, label: emp.name })));
                }

                const brandData = await brandRes.json();
                if (brandData.status && brandData.data) {
                    setBrandOptions(brandData.data.map(brand => ({ value: brand.id, label: brand.name })));
                }

                const mapData = await mapRes.json();
                if (mapData.status && mapData.data) {
                    const item = Array.isArray(mapData.data) ? mapData.data[0] : mapData.data;
                    if (item) {
                        setEmployeeName(item.employee_id);
                        if (item.brands && item.brands.length > 0) {
                            setBrands(item.brands.map((bId, idx) => ({ id: idx + 1, name: bId })));
                        } else {
                            setBrands([{ id: 1, name: null }]);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [id, setLoading]);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Employee Brand Mapping</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/employee/brand-mapping')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        {loading ? (
                            <div className="text-center tw-py-4 tw-text-slate-500">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                            {/* Employee Name Select */}
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

                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/employee/brand-mapping')}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default EmployeeBrandEdit;
