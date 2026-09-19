import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const CustomerCategoryAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [customerCategory, setCustomerCategory] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!customerCategory.trim()) newErrors.customerCategory = 'The customer category field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const payload = {
                name: customerCategory,
                status: status?.value === 'Active' || status?.value === 1 ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer-category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.status) {
                setShowSubmitPopup(false);
                navigate('/power-master/customer/customer-category');
            } else {
                console.error("API Error:", result.message);
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Error creating customer category", error);
            setShowSubmitPopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Customer Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/customer/customer-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer Category <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Customer Category"
                                        value={customerCategory}
                                        onChange={(e) => { setCustomerCategory(e.target.value); if (errors.customerCategory) setErrors(p => ({ ...p, customerCategory: '' })); }}
                                        style={errors.customerCategory ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.customerCategory && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The customer category field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={status}
                                        onChange={setStatus}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/customer/customer-category')}>Cancel</button>
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

export default CustomerCategoryAdd;
