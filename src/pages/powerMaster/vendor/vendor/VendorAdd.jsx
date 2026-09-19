import React, { useState, useEffect } from 'react';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [vendorGroupId, setVendorGroupId] = useState(null);
    const [vendorCategoryId, setVendorCategoryId] = useState(null);
    const [vendorSubCategoryId, setVendorSubCategoryId] = useState(null);
    const [vendorCode, setVendorCode] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [selectedStatus, setSelectedStatus] = useState({ value: 'Active', label: 'Active' });
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const [formData, setFormData] = useState({
        address1: '', address2: '', address3: '', city_id: null,
        tin_number: '', cst_number: '', gstin_number: '', registration_date: new Date().toISOString().split('T')[0],
        email1: '', mobile_number: '', phone_number: '', website: '',
        contact_person: '', contact_mode: '', contact_person_mobile: ''
    });

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [groupOptions, setGroupOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                let res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendor_group`);
                let json = await res.json();
                if (json.status) setGroupOptions(json.data.map(d => ({ value: d.id, label: d.name })));

                res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendor_category`);
                json = await res.json();
                if (json.status) setCategoryOptions(json.data.map(d => ({ value: d.id, label: d.name })));

                res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendor_subcategory`);
                json = await res.json();
                if (json.status) setSubCategoryOptions(json.data.map(d => ({ value: d.id, label: d.name })));

                res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/city`);
                json = await res.json();
                if (json.status) setCityOptions(json.data.map(d => ({ value: d.id, label: d.name })));
            } catch (err) {
                console.error("Error fetching options:", err);
            }
        };
        fetchOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const body = {
                vendor_group_id: vendorGroupId ? vendorGroupId.value : 1,
                vendor_category_id: vendorCategoryId ? vendorCategoryId.value : 1,
                vendor_sub_category_id: vendorSubCategoryId ? vendorSubCategoryId.value : 2,
                code: vendorCode,
                name: vendorName,
                status: selectedStatus && selectedStatus.value === 'Inactive' ? "0" : "1",
                address1: formData.address1,
                address2: formData.address2,
                address3: formData.address3,
                city_id: formData.city_id ? formData.city_id.value : 0,
                tin_number: formData.tin_number,
                cst_number: formData.cst_number,
                gstin_number: formData.gstin_number,
                registration_date: formData.registration_date,
                email1: formData.email1,
                mobile_number: formData.mobile_number,
                phone_number: formData.phone_number,
                website: formData.website,
                contact_person: formData.contact_person,
                contact_mode: formData.contact_mode,
                contact_person_mobile: formData.contact_person_mobile
            };
            
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/vendor`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            if (result.status) {
                setShowSubmitPopup(true);
            } else {
                console.error("Failed to create vendor:", result.message);
                alert(result.message || "Failed to create vendor");
            }
        } catch (err) {
            console.error("Error creating vendor:", err);
            alert("An error occurred while creating the vendor");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        setShowSubmitPopup(false);
        navigate('/power-master/vendor/vendor');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Create Vendor</h3>
                        <div className="d-flex align-items-center tw-gap-4">
                            <button
                                className="btn-header-back"
                                onClick={() => navigate('/power-master/vendor/vendor')}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Group <span className="text-danger">*</span></label>
                                    <Select options={groupOptions} value={vendorGroupId} onChange={setVendorGroupId} placeholder="Vendor Group" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Category <span className="text-danger">*</span></label>
                                    <Select options={categoryOptions} value={vendorCategoryId} onChange={setVendorCategoryId} placeholder="Vendor Category" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Sub Category <span className="text-danger">*</span></label>
                                    <Select options={subCategoryOptions} value={vendorSubCategoryId} onChange={setVendorSubCategoryId} placeholder="Vendor Sub Category" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Code <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Code" value={vendorCode} onChange={(e) => setVendorCode(e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 1" value={formData.address1} onChange={e => handleFormChange('address1', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 2 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 2" value={formData.address2} onChange={e => handleFormChange('address2', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 3 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 3" value={formData.address3} onChange={e => handleFormChange('address3', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select options={cityOptions} placeholder="Choose a City..." className="react-select-container" classNamePrefix="react-select" value={formData.city_id} onChange={opt => handleFormChange('city_id', opt)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Tin Number</label>
                                    <input type="text" className="form-control" placeholder="Tin Number" value={formData.tin_number} onChange={e => handleFormChange('tin_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>CST Number</label>
                                    <input type="text" className="form-control" placeholder="CST Number" value={formData.cst_number} onChange={e => handleFormChange('cst_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>GSTIN Number</label>
                                    <input type="text" className="form-control" placeholder="GSTIN Number" value={formData.gstin_number} onChange={e => handleFormChange('gstin_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Reg Date</label>
                                    <input type="date" className="form-control" placeholder="Registration Date" value={formData.registration_date} onChange={e => handleFormChange('registration_date', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Email</label>
                                    <input type="email" className="form-control" placeholder="Email ID" value={formData.email1} onChange={e => handleFormChange('email1', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Mobile Number <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Mobile Number" value={formData.mobile_number} onChange={e => handleFormChange('mobile_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Phone Number</label>
                                    <input type="text" className="form-control" placeholder="Phone Number" value={formData.phone_number} onChange={e => handleFormChange('phone_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Web Site</label>
                                    <input type="text" className="form-control" placeholder="Web Site" value={formData.website} onChange={e => handleFormChange('website', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Contact Person</label>
                                    <input type="text" className="form-control" placeholder="Contact Person" value={formData.contact_person} onChange={e => handleFormChange('contact_person', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Contact Mode</label>
                                    <input type="text" className="form-control" placeholder="Contact Mode" value={formData.contact_mode} onChange={e => handleFormChange('contact_mode', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Contact Person Mobile</label>
                                    <input type="text" className="form-control" placeholder="Contact Person Mobile" value={formData.contact_person_mobile} onChange={e => handleFormChange('contact_person_mobile', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} placeholder="Status" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/vendor/vendor')}>Cancel</button>
                                <button type="submit" className="btn-save">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default VendorAdd;
