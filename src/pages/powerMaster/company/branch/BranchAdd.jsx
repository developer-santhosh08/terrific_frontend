import { useState, useEffect } from 'react';
import { useLoader } from '../../../../context/LoaderContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const BranchAdd = () => {
    const navigate = useNavigate();
    const { loading, setLoading } = useLoader();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const currentDate = `${yyyy}-${mm}-${dd}`;

    const [formData, setFormData] = useState({
        company: '',
        branchName: '',
        tinNumber: '',
        tanNumber: '',
        panNumber: '',
        gstinNumber: '',
        gstinDate: currentDate,
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        phoneNumber: '',
        mobileNumber: '',
        email: '',
        webSite: '',
        tollFreeNumber: '',
        status: 'Active'
    });

    const [companyOptions, setCompanyOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const [compRes, cityRes] = await Promise.all([
                    fetch(`${baseUrl}/api/master/company`, { headers }),
                    fetch(`${baseUrl}/api/master/geolocation?type=city&state_id=30`, { headers })
                ]);
                
                const compResult = await compRes.json();
                const cityResult = await cityRes.json();

                if (compResult && compResult.status && compResult.data) {
                    setCompanyOptions(compResult.data.map(c => ({ value: c.id, label: c.name })));
                }
                if (cityResult && cityResult.status && cityResult.data) {
                    setCityOptions(cityResult.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (error) {
                console.error("Error fetching dropdowns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDropdowns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Branch Form Data:', formData);
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                company_id: formData.company,
                name: formData.branchName,
                tin_number: formData.tinNumber || "",
                tan_number: formData.tanNumber || "",
                pan_number: formData.panNumber || "",
                gstin_number: formData.gstinNumber || "",
                gstin_date: formData.gstinDate || "1970-01-01",
                address1: formData.addressLine1 || "",
                address2: formData.addressLine2 || "",
                address3: formData.addressLine3 || "",
                city_id: formData.city,
                phone_number: formData.phoneNumber ? Number(formData.phoneNumber) : 0,
                toll_free_number: formData.tollFreeNumber || "",
                mobile_number: formData.mobileNumber ? Number(formData.mobileNumber) : 0,
                email: formData.email || "",
                web_site: formData.webSite || "",
                status: formData.status === 'Active' ? 1 : 0,
                log_status: formData.status === 'Active' ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/branch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('erp_auth');
                sessionStorage.removeItem('erp_token');
                sessionStorage.removeItem('erp_user');
                window.location.href = '/login';
                return;
            }

            const json = await response.json();

            if (response.ok && json && json.status) {
                setShowSubmitPopup(false);
                navigate('/power-master/branch');
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Error creating branch", error);
            setShowSubmitPopup(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/power-master/branch');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Branch</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/branch')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Company <span className="text-danger">*</span></label>
                                        <Select
                                            options={companyOptions}
                                            value={companyOptions.find(opt => opt.value === formData.company) || null}
                                            onChange={(selectedOption) => handleChange({ target: { name: 'company', value: selectedOption ? selectedOption.value : '' } })}
                                            placeholder="Select Company"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Branch <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="branchName"
                                            placeholder="Branch Name"
                                            value={formData.branchName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Tin Number <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="tinNumber"
                                            placeholder="Tin Number"
                                            value={formData.tinNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Tan Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="tanNumber"
                                            placeholder="Tan Number"
                                            value={formData.tanNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Pan Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="panNumber"
                                            placeholder="Pan Number"
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>GSTIN Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="gstinNumber"
                                            placeholder="GSTIN Number"
                                            value={formData.gstinNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>GSTIN Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="gstinDate"
                                            placeholder="dd/mm/yyyy"
                                            value={formData.gstinDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>City <span className="text-danger">*</span></label>
                                        <Select
                                            options={cityOptions}
                                            value={cityOptions.find(opt => opt.value === formData.city) || null}
                                            onChange={(selectedOption) => handleChange({ target: { name: 'city', value: selectedOption ? selectedOption.value : '' } })}
                                            placeholder="Select City"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phoneNumber"
                                            placeholder="Phone Number"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="mobileNumber"
                                            placeholder="Mobile Number"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            placeholder="Email ID"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Web Site</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="webSite"
                                            placeholder="Web Site"
                                            value={formData.webSite}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Toll free Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="tollFreeNumber"
                                            placeholder="Toll free Number"
                                            value={formData.tollFreeNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Address Line 1</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="addressLine1"
                                            placeholder="Address Line 1"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Address Line 2</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="addressLine2"
                                            placeholder="Address Line 2"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Address Line 3</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="addressLine3"
                                            placeholder="Address Line 3"
                                            value={formData.addressLine3}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Status <span className="text-danger">*</span></label>
                                        <Select
                                            options={[
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' }
                                            ]}
                                            value={formData.status ? { value: formData.status, label: formData.status } : null}
                                            onChange={(selectedOption) => handleChange({ target: { name: 'status', value: selectedOption ? selectedOption.value : '' } })}
                                            placeholder="Select Status"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Form Actions - Cancel on Left, Save on Right */}
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={loading}
                                >
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

export default BranchAdd;
