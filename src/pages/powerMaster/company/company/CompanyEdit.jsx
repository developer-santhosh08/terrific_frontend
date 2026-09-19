import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const CompanyEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        companyName: '',
        tinNumber: '',
        tanNumber: '',
        panNumber: '',
        eccNumber: '',
        gstinNumber: '',
        gstinDate: '',
        registrationNumber: '',
        registrationDate: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        pincode: '',
        city: '',
        phoneNumber: '',
        mobileNumber: '',
        email: '',
        webSite: '',
        tollFreeNumber: '',
        contactPersonName: '',
        contactPersonMobile: '',
        status: 'Active',
    });

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const response = await apiFetch('/master/company/' + id);
                const data = response?.json || {};
                if (data?.status && data?.data) {
                    const fetchedData = data.data;
                    setFormData(prev => ({
                        ...prev,
                        companyName: fetchedData.name || '',
                        tinNumber: fetchedData.tin_number || '',
                        tanNumber: fetchedData.tan_number || '',
                        panNumber: fetchedData.pan_number || '',
                        eccNumber: fetchedData.ecc_number || '',
                        gstinNumber: fetchedData.gstin_number || '',
                        gstinDate: fetchedData.gstin_date || '',
                        registrationNumber: fetchedData.registration_number || '',
                        registrationDate: fetchedData.registration_date || '',
                        addressLine1: fetchedData.address1 || '',
                        addressLine2: fetchedData.address2 || '',
                        addressLine3: fetchedData.address3 || '',
                        pincode: fetchedData.pincode || '',
                        city: fetchedData.city_id || '',
                        phoneNumber: fetchedData.phone || fetchedData.phone_number || '',
                        mobileNumber: fetchedData.mobile || fetchedData.mobile_number || '',
                        email: fetchedData.email || '',
                        webSite: fetchedData.web_site || '',
                        tollFreeNumber: fetchedData.toll_free_number || '',
                        contactPersonName: fetchedData.contact_person_name || '',
                        contactPersonMobile: fetchedData.contact_person_mobile || '',
                        status: fetchedData.status === 1 ? 'Active' : 'Inactive'
                    }));
                }
            } catch (error) {
                console.error("Error fetching company details:", error);
            }
        };
        if (id) {
            fetchCompanyDetails();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [cityOptions, setCityOptions] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await apiFetch('/master/geolocation?type=city&state_id=30');
                if (response && response.json && response.json.status && response.json.data) {
                    setCityOptions(response.json.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const payload = {
                name: formData.companyName,
                tin_number: formData.tinNumber,
                tan_number: formData.tanNumber,
                pan_number: formData.panNumber,
                ecc_number: formData.eccNumber,
                gstin_number: formData.gstinNumber,
                gstin_date: formData.gstinDate,
                registration_number: formData.registrationNumber,
                registration_date: formData.registrationDate,
                address1: formData.addressLine1,
                address2: formData.addressLine2,
                address3: formData.addressLine3,
                pincode: formData.pincode,
                city_id: formData.city,
                city: formData.city ? cityOptions.find(c => c.value === formData.city)?.label || '' : '',
                state: 'Tamil Nadu',
                address: formData.addressLine1,
                phone: formData.phoneNumber,
                phone_number: formData.phoneNumber,
                mobile: formData.mobileNumber,
                mobile_number: formData.mobileNumber,
                email: formData.email,
                web_site: formData.webSite,
                toll_free_number: formData.tollFreeNumber,
                contact_person_name: formData.contactPersonName,
                contact_person_mobile: formData.contactPersonMobile,
                status: formData.status === 'Active' ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/company/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data?.status) {
                navigate('/power-master/company');
            } else {
                console.error("Failed to update company:", data?.message);
                let errorMsg = data?.message || 'Failed';
                if (data?.errors) {
                    errorMsg = Object.values(data.errors).flat().join('\n');
                }
                alert("Validation Failed:\n" + errorMsg);
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error("Error updating company:", error);
        }
    };

    const handleCancel = () => {
        navigate('/power-master/company');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Company</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/company')}>
                             Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Company Name <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="companyName"
                                            placeholder="Company Name"
                                            value={formData.companyName}
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
                                        <label>ECC Number</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="eccNumber"
                                            placeholder="ECC Number"
                                            value={formData.eccNumber}
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
                                        <label>Registration Number</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="registrationNumber"
                                            placeholder="Registration Number"
                                            value={formData.registrationNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Registration Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control"
                                            name="registrationDate"
                                            placeholder="dd/mm/yyyy"
                                            value={formData.registrationDate}
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
                                        <label>Pincode</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="pincode"
                                            placeholder="Pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>City <span className="text-danger">*</span></label>
                                        <Select
                                            options={cityOptions}
                                            value={cityOptions.find(opt => opt.value == formData.city) || null}
                                            onChange={(selectedOption) => handleChange({ target: { name: 'city', value: selectedOption ? selectedOption.value : '' } })}
                                            placeholder="Select City"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Phone Number <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="phoneNumber"
                                            placeholder="Phone Number"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Mobile Number <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="mobileNumber"
                                            placeholder="Mobile Number"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                            required
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
                                        <label>Contact Person Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="contactPersonName"
                                            placeholder="Contact Person Name"
                                            value={formData.contactPersonName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Contact Person Mobile</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="contactPersonMobile"
                                            placeholder="Contact Person Mobile"
                                            value={formData.contactPersonMobile}
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
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default CompanyEdit;
