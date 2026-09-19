import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const EmployeeAdd = () => {
    const navigate = useNavigate();

    const [imagePreview, setImagePreview] = useState(null);
    const [idProofPreview, setIdProofPreview] = useState(null);
    const [addressProofPreview, setAddressProofPreview] = useState(null);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const currentDate = `${yyyy}-${mm}-${dd}`;

    const [companyOptions, setCompanyOptions] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [bankOptions, setBankOptions] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
                const [companyRes, branchRes, cityRes, bankRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/company`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/branch`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=city&state_id=30`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/bank`, { headers })
                ]);
                const companyResult = await companyRes.json();
                const branchResult = await branchRes.json();
                const cityResult = await cityRes.json();
                const bankResult = await bankRes.json();
                
                if (companyResult.status && Array.isArray(companyResult.data)) {
                    setCompanyOptions(companyResult.data.map(c => ({ value: c.id, label: c.name })));
                }
                if (branchResult.status && Array.isArray(branchResult.data)) {
                    setBranchOptions(branchResult.data.map(b => ({ value: b.id, label: b.name })));
                }
                if (cityResult.status && Array.isArray(cityResult.data)) {
                    setCityOptions(cityResult.data.map(c => ({ value: c.id, label: c.name })));
                }
                if (bankResult.status && Array.isArray(bankResult.data)) {
                    setBankOptions(bankResult.data.map(b => ({ value: b.id, label: b.name })));
                }
            } catch (error) {
                console.error("Error fetching dropdowns:", error);
            }
        };
        fetchDropdowns();
    }, []);

    const [formData, setFormData] = useState({
        company_id: 1,
        branch_id: 1,
        number: '',
        name: '',
        gender: 'Male',
        joined_date: currentDate,
        department_id: 2,
        designation_id: 1,
        employee_type_id: 1,
        address1: '',
        address2: '',
        address3: '',
        city_id: 8,
        mobile_number: '',
        alternate_mobile_number: '0',
        email: '',
        date_of_birth: currentDate,
        anniversary_date: currentDate,
        bank_id: 1,
        bank_account_id: '',
        ifsc_code: '',
        pf_number: '',
        lic_number: '',
        dl_number: '',
        pf_due_date: currentDate,
        lic_due_date: currentDate,
        status: 1,
        salary: '',
        ot_amount: '0',
        salary_advance: 0,
        suspense_amount: 0
    });
    
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const { loading, setLoading } = useLoader();
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleFileChange = (e, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = (inputId, setPreview) => {
        setPreview(null);
        if (document.getElementById(inputId)) {
            document.getElementById(inputId).value = "";
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const newErrors = {};
        setApiError('');
        if (!formData.name) newErrors.name = "Employee Name is required";
        if (!formData.number) newErrors.number = "Employee Number is required";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const payload = new FormData();
            Object.keys(formData).forEach(key => {
                payload.append(key, formData[key] !== null ? formData[key] : '');
            });
            
            const imageFile = document.getElementById('empImageAdd')?.files[0];
            if (imageFile) payload.append('image', imageFile);
            
            const idProofFile = document.getElementById('empIdProofAdd')?.files[0];
            if (idProofFile) payload.append('id_proof', idProofFile);
            
            const addressProofFile = document.getElementById('empAddressProofAdd')?.files[0];
            if (addressProofFile) payload.append('address_proof', addressProofFile);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: payload
            });
            const result = await response.json();
            if (result.status) {
                setShowSubmitPopup(true);
            } else {
                const detail = result?.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result?.message;
                setApiError(detail || "Failed to create employee");
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            setApiError("Error creating employee. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/employee/employee');
    };

    const genderOptions = [{ value: '1', label: 'Male' }, { value: '2', label: 'Female' }];
    const departmentOptions = [
        { value: 1, label: 'Sales Department' },
        { value: 2, label: 'Service Department' },
        { value: 3, label: 'ADMIN' }
    ];
    const designationOptions = [
        { value: 1, label: 'Sales Eng' },
        { value: 2, label: 'Service Eng' },
        { value: 3, label: 'Accountent' }
    ];
    const employeeTypeOptions = [{ value: 1, label: 'Sales Eng' }, { value: 3, label: 'Type 3' }, { value: 4, label: 'Type 4' }, { value: 5, label: 'Type 5' }];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Employee</h3>
                        <button 
                            className="btn-header-back" 
                            onClick={() => navigate('/power-master/employee/employee')}
                        >
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <form onSubmit={handleSubmit}>
                            {/* General Details */}
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Company <span className="text-danger">*</span></label>
                                    <Select 
                                        options={companyOptions} 
                                        value={companyOptions.find(o => o.value === formData.company_id)}
                                        onChange={selected => setFormData({...formData, company_id: selected.value})}
                                        placeholder="Choose Company" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Branch <span className="text-danger">*</span></label>
                                    <Select 
                                        options={branchOptions} 
                                        value={branchOptions.find(o => o.value === formData.branch_id)}
                                        onChange={selected => setFormData({...formData, branch_id: selected.value})}
                                        placeholder="Choose Branch" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Employee Number <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${errors.number ? 'is-invalid' : ''}`} name="number" value={formData.number} onChange={handleInputChange} placeholder="Employee Number" />
                                    {errors.number && <div className="invalid-feedback">{errors.number}</div>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Employee Name <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} name="name" value={formData.name} onChange={handleInputChange} placeholder="Employee Name" />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Gender <span className="text-danger">*</span></label>
                                    <Select 
                                        options={genderOptions} 
                                        value={genderOptions.find(o => o.value === formData.gender)}
                                        onChange={selected => setFormData({...formData, gender: selected.value})}
                                        placeholder="Choose Gender" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Employee Join Date</label>
                                    <input type="date" className="form-control" name="joined_date" value={formData.joined_date} onChange={handleInputChange} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Department <span className="text-danger">*</span></label>
                                    <Select 
                                        options={departmentOptions} 
                                        value={departmentOptions.find(o => o.value === formData.department_id)}
                                        onChange={selected => setFormData({...formData, department_id: selected.value})}
                                        placeholder="Choose a Department" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Designation <span className="text-danger">*</span></label>
                                    <Select 
                                        options={designationOptions} 
                                        value={designationOptions.find(o => o.value === formData.designation_id)}
                                        onChange={selected => setFormData({...formData, designation_id: selected.value})}
                                        placeholder="Choose a Designation" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Employee Type <span className="text-danger">*</span></label>
                                    <Select 
                                        options={employeeTypeOptions} 
                                        value={employeeTypeOptions.find(o => o.value === formData.employee_type_id)}
                                        onChange={selected => setFormData({...formData, employee_type_id: selected.value})}
                                        placeholder="Choose Employee Type" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>
                            </div>

                            <h5 className="tw-text-lg tw-text-gray-700 tw-mt-4 tw-mb-4 tw-border-b tw-pb-2">Contact Details</h5>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Address 1</label>
                                    <input type="text" className="form-control" name="address1" value={formData.address1} onChange={handleInputChange} placeholder="Address 1" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Address 2</label>
                                    <input type="text" className="form-control" name="address2" value={formData.address2} onChange={handleInputChange} placeholder="Address 2" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Address 3</label>
                                    <input type="text" className="form-control" name="address3" value={formData.address3} onChange={handleInputChange} placeholder="Address 3" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select 
                                        options={cityOptions} 
                                        value={cityOptions.find(o => o.value === formData.city_id)}
                                        onChange={selected => setFormData({...formData, city_id: selected.value})}
                                        placeholder="Choose City" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Mobile <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} placeholder="Mobile Number" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Alternate Mobile</label>
                                    <input type="text" className="form-control" name="alternate_mobile_number" value={formData.alternate_mobile_number} onChange={handleInputChange} placeholder="Mobile Number" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Email</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Date Of Birth</label>
                                    <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Anniversary Date</label>
                                    <input type="date" className="form-control" name="anniversary_date" value={formData.anniversary_date} onChange={handleInputChange} />
                                </div>
                            </div>

                            <h5 className="tw-text-lg tw-text-gray-700 tw-mt-4 tw-mb-4 tw-border-b tw-pb-2">Account Details</h5>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Salary Amount</label>
                                    <input type="text" className="form-control" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="Salary Amount" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Bank Account Number</label>
                                    <input type="text" className="form-control" name="bank_account_id" value={formData.bank_account_id} onChange={handleInputChange} placeholder="Bank Account Number" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Bank Name <span className="text-danger">*</span></label>
                                    <Select 
                                        options={bankOptions} 
                                        value={bankOptions.find(o => o.value === formData.bank_id)}
                                        onChange={selected => setFormData({...formData, bank_id: selected.value})}
                                        placeholder="Choose a Bank" 
                                        classNamePrefix="react-select" 
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Bank IFSC Code</label>
                                    <input type="text" className="form-control" name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} placeholder="Bank IFSC Code" />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>PF Number</label>
                                    <input type="text" className="form-control" name="pf_number" value={formData.pf_number} onChange={handleInputChange} placeholder="PF Number" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Licence Number</label>
                                    <input type="text" className="form-control" name="lic_number" value={formData.lic_number} onChange={handleInputChange} placeholder="Licence Number" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Image</label>
                                    <input type="file" id="empImageAdd" className="form-control" accept="image/*" onChange={(e) => handleFileChange(e, setImagePreview)} />
                                    {imagePreview && (
                                        <div className="tw-relative tw-inline-block tw-p-2 tw-rounded-lg tw-shadow-md tw-bg-white tw-border tw-border-gray-100 tw-mt-3">
                                            <img src={imagePreview} alt="Image Preview" className="tw-w-32 tw-h-32 tw-object-cover tw-rounded-md" />
                                            <button type="button" onClick={() => handleRemoveFile('empImageAdd', setImagePreview)} className="tw-absolute -tw-top-2 -tw-right-2 tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-rounded-full tw-shadow-md tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border tw-border-red-100">
                                                <i className="fa fa-trash tw-text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>ID Proof</label>
                                    <input type="file" id="empIdProofAdd" className="form-control" accept="image/*" onChange={(e) => handleFileChange(e, setIdProofPreview)} />
                                    {idProofPreview && (
                                        <div className="tw-relative tw-inline-block tw-p-2 tw-rounded-lg tw-shadow-md tw-bg-white tw-border tw-border-gray-100 tw-mt-3">
                                            <img src={idProofPreview} alt="ID Proof Preview" className="tw-w-32 tw-h-32 tw-object-cover tw-rounded-md" />
                                            <button type="button" onClick={() => handleRemoveFile('empIdProofAdd', setIdProofPreview)} className="tw-absolute -tw-top-2 -tw-right-2 tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-rounded-full tw-shadow-md tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border tw-border-red-100">
                                                <i className="fa fa-trash tw-text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-3 form-group mb-4">
                                    <label>Address Proof</label>
                                    <input type="file" id="empAddressProofAdd" className="form-control" accept="image/*" onChange={(e) => handleFileChange(e, setAddressProofPreview)} />
                                    {addressProofPreview && (
                                        <div className="tw-relative tw-inline-block tw-p-2 tw-rounded-lg tw-shadow-md tw-bg-white tw-border tw-border-gray-100 tw-mt-3">
                                            <img src={addressProofPreview} alt="Address Proof Preview" className="tw-w-32 tw-h-32 tw-object-cover tw-rounded-md" />
                                            <button type="button" onClick={() => handleRemoveFile('empAddressProofAdd', setAddressProofPreview)} className="tw-absolute -tw-top-2 -tw-right-2 tw-bg-red-50 tw-text-red-500 hover:tw-bg-red-500 hover:tw-text-white tw-rounded-full tw-shadow-md tw-w-7 tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border tw-border-red-100">
                                                <i className="fa fa-trash tw-text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="mt-4" />
                            <div className="form-actions mt-4 d-flex justify-content-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/employee/employee')}>Cancel</button>
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

export default EmployeeAdd;
